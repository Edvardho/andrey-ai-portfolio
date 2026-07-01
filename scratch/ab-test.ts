import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const synthesisSchema = z.object({
  answerStatus: z.enum(['grounded', 'insufficient_facts', 'needs_clarification', 'navigation_suggested']),
  title: z.string().min(6).max(90),
  intro: z.string().min(24).max(220),
  sections: z.array(z.object({
    title: z.string().min(4).max(56),
    body: z.string().min(24).max(240),
  })).min(2).max(4),
  bullets: z.array(z.string().min(8).max(140)).max(4),
});

const LOG_FILE_PATH = path.resolve(process.cwd(), 'scratch/openai-calls.jsonl');

function logCall(entry: any) {
  try {
    const dir = path.dirname(LOG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE_PATH, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (err) {
    console.error('Failed to write ab-test telemetry log:', err);
  }
}

const currentPrompt = `
Ты пишешь ответ для AI portfolio assistant на русском языке.
Тебе нельзя придумывать кейсы, цифры, роли, процессы или выводы, которых нет во входных фактах.
Если фактов мало, отвечай аккуратно и не преувеличивай.
Если фактов недостаточно для ответа, не маскируй это под обычный ответ: выбери answerStatus="insufficient_facts" и коротко назови границу данных.
Если вопрос слишком широкий или непонятный, выбери answerStatus="needs_clarification".
Если вопрос по сути просит не объяснение, а переход к кейсу/разделу, выбери answerStatus="navigation_suggested" и дай короткое пояснение.
Тон: собранный, прямой, профессиональный. Без рекламной клоунады.

Вопрос пользователя:
{question}

Тема ответа:
Почему здесь есть что смотреть

Разрешенные факты:
{facts}

Нужно:
1. answerStatus:
   - grounded: входных фактов достаточно
   - insufficient_facts: фактов нет или их недостаточно
   - needs_clarification: вопрос надо уточнить
   - navigation_suggested: лучше дать краткий ответ и предложить открыть раздел/кейс
2. title: короткая внутренняя тема ответа для системы. Пользователь ее не увидит, не пиши ее как начало сообщения.
3. intro: первый видимый абзац ответа. Он должен начинаться как обычная чат-реплика, например "Андрей работает..." или "По кейсам видно...". Не начинай intro с заголовка.
4. sections: 2-4 смысловых блока в формате короткий H3 + один короткий абзац, только если структуру действительно нужно разделить
5. bullets: пустой массив, кроме случаев когда перечисление реально лучше секций

Формат ответа:
Короткий conversational intro без заголовка.
### Смысловой блок
Один короткий абзац.

Жесткие ограничения:
- не пиши эссе
- не начинай ответ с заголовка
- не делай длинные абзацы
- каждая section должна держать одну мысль
- обычный ответ должен быть компактным: 700-1100 символов

Запрещено:
- выдумывать новые кейсы
- добавлять отсутствующие метрики
- писать "возможно", если этого нет во фактах
- пересказывать портфолио как резюме строка за строкой
`;

const neutralPrompt = `
Ты пишешь ответ для AI portfolio assistant на русском языке.
Тебе нельзя придумывать кейсы, цифры, роли, процессы или выводы, которых нет во входных фактах.
Если фактов мало, отвечай аккуратно и не преувеличивай.
Если фактов недостаточно для ответа, не маскируй это под обычный ответ: выбери answerStatus="insufficient_facts" и коротко назови границу данных.
Если вопрос слишком широкий или непонятный, выбери answerStatus="needs_clarification".
Если вопрос по сути просит не объяснение, а переход к кейсу/разделу, выбери answerStatus="navigation_suggested" и дай короткое пояснение.

Вопрос пользователя:
{question}

Тема ответа:
Почему здесь есть что смотреть

Разрешенные факты:
{facts}

Отвечай простым русским языком для конечного пользователя.
Используй контекст только как источник фактов.
Не копируй стиль, лексику и формулировки из контекста.
Не используй профессиональный жаргон без объяснения.
Не используй слова: сигнал, product judgment, craft, delivery, product depth, workflow-heavy.
Сначала прямо ответь на вопрос пользователя, затем объясни почему.

Нужно:
1. answerStatus:
   - grounded: входных фактов достаточно
   - insufficient_facts: фактов нет или их недостаточно
   - needs_clarification: вопрос надо уточнить
   - navigation_suggested: лучше дать краткий ответ и предложить открыть раздел/кейс
2. title: короткая внутренняя тема ответа для системы. Пользователь ее не увидит, не пиши ее как начало сообщения.
3. intro: первый видимый абзац ответа. Он должен начинаться как обычная чат-реплика, например "Андрей работает..." или "По кейсам видно...". Не начинай intro с заголовка.
4. sections: 2-4 смысловых блока в формате короткий H3 + один короткий абзац, только если структуру действительно нужно разделить
5. bullets: пустой массив, кроме случаев когда перечисление реально лучше секций

Формат ответа:
Короткий conversational intro без заголовка.
### Смысловой блок
Один короткий абзац.

Жесткие ограничения:
- не пиши эссе
- не начинай ответ с заголовка
- не делай длинные абзацы
- каждая section должна держать одну мысль
- обычный ответ должен быть компактным: 700-1100 символов

Запрещено:
- выдумывать новые кейсы
- добавлять отсутствующие метрики
- писать "возможно", если этого нет во фактах
- пересказывать портфолио как резюме строка за строкой
`;

const currentFacts = [
  'У Андрея 5+ лет опыта на стыке B2B и B2C.',
  'Его траектория включает MTS Digital, Альфа-Банк и Positive Technologies.',
  'Повторяющийся паттерн работы: research -> структура решения -> delivery до релиза.',
  'Он сильнее там, где нужно не просто нарисовать экран, а связать сценарий, ограничения, роли и метрики.',
  'В Positive Technologies часть интерфейсов проектировалась с помощью готовой дизайн-системы, а также поддерживался UI-kit, в который Андрей вносил правки.',
  'Альфа-Смарт дает флагманский продуктовый сигнал с метриками.',
  'SIEBEL дает редкую для дизайнеров связку research, workflow-redesign и измеримого результата.',
  'ChatPoint дает anti-case и product judgment вместо вымышленного success story.',
  'Mobile cases показывают ширину: сценарии, ветвления, роли и межкомандные зависимости.'
];

const cleanedFacts = [
  'У Андрея 5+ лет опыта на стыке B2B и B2C.',
  'Его траектория включает MTS Digital, Альфа-Банк и Positive Technologies.',
  'Он сильнее там, где нужно не просто нарисовать экран, а связать сценарий, ограничения, роли и метрики.',
  'В Positive Technologies часть интерфейсов проектировалась с помощью готовой дизайн-системы, а также поддерживался UI-kit, в который Андрей вносил правки.',
  'Альфа-Смарт — флагманский проект с успешным запуском семейной подписки и высокими метриками.',
  'В проекте CRM SIEBEL Андрей переработал интерфейс для операторов поддержки на основе наблюдений за их работой, что сократило время обработки обращений.',
  'В проекте ChatPoint Андрей проанализировал причины закрытия продукта из-за отсутствия рыночной ценности.',
  'Мобильные проекты показывают умение проектировать сложные сценарии с разветвленной логикой и ролями.'
];

async function runScenario(scenarioId: string, promptTemplate: string, facts: string[]) {
  console.log(`\n=================== RUNNING SCENARIO ${scenarioId} ===================`);
  const formattedFacts = facts.map(f => `- ${f}`).join('\n');
  const question = "На какие роли он подойдет?";
  const prompt = promptTemplate.replace('{question}', question).replace('{facts}', formattedFacts);

  const developerPromptChars = promptTemplate.length;
  const userMessageChars = question.length;
  const ragContextChars = formattedFacts.length;
  const schemaChars = 500;
  const totalPayloadChars = prompt.length + schemaChars;

  const callId = `call_${randomUUID()}`;
  logCall({
    event: 'call_start',
    callId,
    timestamp: new Date().toISOString(),
    route: `scratch/ab-test.ts (Scenario ${scenarioId})`,
    model: 'gpt-4o-mini',
    systemPromptChars: 0,
    developerPromptChars,
    userMessageChars,
    ragContextChars,
    historyChars: 0,
    schemaChars,
    totalPayloadChars,
    estimatedInputChars: Math.round(totalPayloadChars / 4),
    userMessagePreview: question.slice(0, 200),
    retrievedChunksCount: facts.length,
    messagesCount: 1,
  });

  const startTime = Date.now();
  try {
    const { output, usage, response } = await generateText({
      model: openai('gpt-4o-mini'),
      temperature: 0.3,
      output: Output.object({ schema: synthesisSchema }),
      prompt,
    });

    logCall({
      event: 'call_end',
      callId,
      timestamp: new Date().toISOString(),
      route: `scratch/ab-test.ts (Scenario ${scenarioId})`,
      model: 'gpt-4o-mini',
      durationMs: Date.now() - startTime,
      requestId: response?.id || `req_${randomUUID()}`,
      status: 'success',
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cachedInputTokens: usage.inputTokenDetails?.cacheReadTokens,
    });

    console.log(`Answer Status: ${output.answerStatus}`);
    console.log(`Title: ${output.title}`);
    console.log(`Intro: ${output.intro}`);
    console.log(`Sections:`);
    output.sections.forEach((s, idx) => {
      console.log(`  Section ${idx + 1}: ${s.title}`);
      console.log(`    ${s.body}`);
    });
    console.log(`Bullets: ${JSON.stringify(output.bullets)}`);
  } catch (error: any) {
    logCall({
      event: 'call_end',
      callId,
      timestamp: new Date().toISOString(),
      route: `scratch/ab-test.ts (Scenario ${scenarioId})`,
      model: 'gpt-4o-mini',
      durationMs: Date.now() - startTime,
      status: 'error',
      error: error?.message || String(error),
    });
    console.error(`Scenario ${scenarioId} failed:`, error);
  }
}

async function main() {
  // A: текущий промпт + текущий RAG
  await runScenario('A', currentPrompt, currentFacts);

  // B: текущий промпт + RAG выключен
  await runScenario('B', currentPrompt, []);

  // C: нейтральный промпт + текущий RAG
  await runScenario('C', neutralPrompt, currentFacts);

  // D: текущий промпт + очищенный RAG
  await runScenario('D', currentPrompt, cleanedFacts);
}

main().catch(console.error);
