import { Output, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

import {
  getContextualCaseFacts,
  getPortfolioFacts,
  getSynthesisTopicConfig,
} from '@/data/portfolio-facts';
import { getOpenAIKey, getOpenAIModel } from '@/lib/portfolio/config';
import type { AssistantSession, SynthesisSnapshot, SynthesisTopic } from '@/lib/portfolio/types';

const synthesisSchema = z.object({
  title: z.string().min(6).max(90),
  paragraphs: z.array(z.string().min(24).max(320)).min(2).max(3),
  bullets: z.array(z.string().min(8).max(140)).max(4).default([]),
});

const SYNTHESIS_PATTERNS: Array<{ topic: SynthesisTopic; patterns: RegExp[] }> = [
  {
    topic: 'decision_making',
    patterns: [/как.+принима/i, /как.+решени/i, /почему.+решени/i, /что.+логик/i],
  },
  {
    topic: 'product_approach',
    patterns: [/продуктов/i, /подход/i, /research/i, /процесс/i, /workflow/i],
  },
  {
    topic: 'collaboration',
    patterns: [/команд/i, /коммуникац/i, /согласован/i, /стейк/i, /бизнесом/i],
  },
  {
    topic: 'fit',
    patterns: [/почему.+смотрет/i, /почему.+полез/i, /почему.+наня/i, /подойдет/i, /что.+дает это портфолио/i],
  },
  {
    topic: 'strengths',
    patterns: [/сильн(ая|ые|ая сторона|ые стороны|ый сигнал|ые сигналы)/i, /что.+умеет/i, /что.+отлича/i, /в чем.+сил/i],
  },
];

export function detectSynthesisTopic(text: string): SynthesisTopic | null {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  for (const candidate of SYNTHESIS_PATTERNS) {
    if (candidate.patterns.some((pattern) => pattern.test(trimmed))) {
      return candidate.topic;
    }
  }

  return null;
}

function buildFallbackSnapshot(topic: SynthesisTopic, question: string): SynthesisSnapshot {
  const config = getSynthesisTopicConfig(topic);

  return {
    topic,
    question,
    title: config.fallbackTitle,
    paragraphs: config.fallbackParagraphs,
    bullets: config.fallbackBullets,
  };
}

export async function synthesizeGeneralAnswer(
  question: string,
  session: AssistantSession,
  topic: SynthesisTopic,
): Promise<SynthesisSnapshot> {
  const config = getSynthesisTopicConfig(topic);
  const contextualFacts =
    session.selectedContext.kind === 'case'
      ? getContextualCaseFacts(session.selectedContext.id)
      : [];
  const facts = [...getPortfolioFacts(topic), ...contextualFacts];

  if (!getOpenAIKey()) {
    return buildFallbackSnapshot(topic, question);
  }

  const prompt = `
Ты пишешь ответ для AI portfolio assistant на русском языке.
Тебе нельзя придумывать кейсы, цифры, роли, процессы или выводы, которых нет во входных фактах.
Если фактов мало, отвечай аккуратно и не преувеличивай.
Тон: собранный, прямой, профессиональный. Без рекламной клоунады.

Вопрос пользователя:
${question}

Тема ответа:
${config.title}

Разрешенные факты:
${facts.map((fact) => `- ${fact}`).join('\n')}

Нужно:
1. короткий заголовок ответа
2. 2-3 абзаца
3. до 4 кратких буллетов, если они реально усиливают ответ

Запрещено:
- выдумывать новые кейсы
- добавлять отсутствующие метрики
- писать "возможно", если этого нет во фактах
- пересказывать портфолио как резюме строка за строкой
`;

  try {
    const { output } = await generateText({
      model: openai(getOpenAIModel()),
      temperature: 0.3,
      output: Output.object({ schema: synthesisSchema }),
      prompt,
    });

    return {
      topic,
      question,
      title: output.title,
      paragraphs: output.paragraphs,
      bullets: output.bullets,
    };
  } catch {
    return buildFallbackSnapshot(topic, question);
  }
}
