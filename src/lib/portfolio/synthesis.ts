import { Output, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

import { getCaseFactPack, getCaseSynthesisConfig } from '@/data/portfolio-case-facts';
import {
  getSynthesisTopicConfig,
} from '@/data/portfolio-facts';
import { getOpenAIModel, isOpenAIEnabled } from '@/lib/portfolio/config';
import type {
  AnswerPlan,
  AnswerType,
  AssistantSession,
  CaseFactFacet,
  CaseFactPack,
  PromptChip,
  QueryScope,
  QuestionSubject,
  ResponseLength,
  SynthesisSnapshot,
  SynthesisTopic,
} from '@/lib/portfolio/types';
import { LIMITS, logOpenAICallStart, logOpenAICallEnd } from './logger';

const synthesisSchema = z.object({
  answerStatus: z.enum(['grounded', 'insufficient_facts', 'needs_clarification', 'navigation_suggested']),
  title: z.string().min(6).max(90),
  intro: z.string().min(24).max(220),
  sections: z.array(z.object({
    title: z.string().min(4).max(56),
    body: z.string().min(24).max(240),
  })).max(3),
  bullets: z.array(z.string().min(8).max(140)).max(4),
});

const SYNTHESIS_PATTERNS: Array<{ topic: SynthesisTopic; patterns: RegExp[] }> = [
  {
    topic: 'web',
    patterns: [/что делал в web/i, /что делал в веб/i, /web[-\s]?кейсы/i, /веб[-\s]?кейсы/i],
  },
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
    patterns: [
      /сильн(ая|ые|ая сторона|ые стороны|ый сигнал|ые сигналы)/i,
      /что.+умеет/i,
      /что.+отлича/i,
      /в чем.+сил/i,
      /если убрать.+(?:красив|аккуратн|визуальн).+(?:экран|ui|интерфейс|картин)/i,
      /что останется.+(?:без|кроме|после).+(?:экран|ui|интерфейс|картин|визуал)/i,
    ],
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

type SynthesisRequestConfig = {
  topic: SynthesisTopic;
  answerType: AnswerType;
  queryScope: QueryScope;
  questionSubject: QuestionSubject;
  responseLength: ResponseLength;
  answerPlan: AnswerPlan;
  title: string;
  facts: string[];
  fallbackTitle: string;
  fallbackIntro: string;
  fallbackFollowupParagraphs: string[];
  fallbackSections: Array<{
    title: string;
    body: string;
  }>;
  fallbackBullets: string[];
  fallbackAnswerStatus?: SynthesisSnapshot['answerStatus'];
  chips: PromptChip[];
  previousUserQuestion?: string | null;
  previousAssistantAnswerPreview?: string | null;
  previousQuestionSubject?: QuestionSubject | null;
};

function normalizeIntro(intro: string, answerPlan: AnswerPlan) {
  const trimmed = intro.trim();
  if (!answerPlan.mustStartWith) {
    return trimmed;
  }

  const normalizedStart = answerPlan.mustStartWith.toLowerCase();
  return trimmed.toLowerCase().startsWith(normalizedStart)
    ? trimmed
    : `${answerPlan.mustStartWith} ${trimmed}`;
}

function finalizeSnapshot(
  request: SynthesisRequestConfig,
  question: string,
  draft: {
    answerStatus: SynthesisSnapshot['answerStatus'];
    title: string;
    intro: string;
    followupParagraphs?: string[];
    sections: Array<{
      title: string;
      body: string;
    }>;
    bullets: string[];
  },
): SynthesisSnapshot {
  const followupParagraphs =
    draft.followupParagraphs
      ?? (!request.answerPlan.allowSections
        ? draft.sections.map((section) => section.body)
        : []);

  const normalizedFollowups = followupParagraphs
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .slice(0, Math.max(request.answerPlan.maxParagraphs - 1, 0));

  const normalizedSections = request.answerPlan.allowSections
    ? draft.sections
        .reduce<Array<{ title: string; body: string }>>((acc, section) => {
          const title = section.title.trim();
          const body = section.body.trim();
          if (!title || !body) {
            return acc;
          }

          const normalizedTitle = title.toLowerCase();
          const normalizedBody = body.toLowerCase();
          const hasDuplicate = acc.some(
            (existing) =>
              existing.title.trim().toLowerCase() === normalizedTitle
              || existing.body.trim().toLowerCase() === normalizedBody,
          );

          if (!hasDuplicate) {
            acc.push({ title, body });
          }

          return acc;
        }, [])
        .slice(0, 3)
    : [];

  const normalizedBullets = request.answerPlan.allowBullets
    ? draft.bullets.slice(0, 4)
    : [];

  return {
    topic: request.topic,
    answerType: request.answerType,
    queryScope: request.queryScope,
    questionSubject: request.questionSubject,
    responseLength: request.responseLength,
    answerPlan: request.answerPlan,
    question,
    answerStatus: draft.answerStatus,
    title: draft.title,
    intro: normalizeIntro(draft.intro, request.answerPlan),
    followupParagraphs: normalizedFollowups,
    sections: normalizedSections,
    bullets: normalizedBullets,
    chips: request.chips,
  };
}

function applyResponseLength(
  answerPlan: AnswerPlan,
  responseLength: ResponseLength,
): AnswerPlan {
  if (responseLength === 'default') {
    return answerPlan;
  }

  return {
    ...answerPlan,
    maxParagraphs: Math.min(answerPlan.maxParagraphs, 2),
    allowSections: false,
    allowBullets: false,
  };
}

function buildFallbackSnapshot(
  request: SynthesisRequestConfig,
  question: string,
): SynthesisSnapshot {
  return finalizeSnapshot(request, question, {
    answerStatus: request.fallbackAnswerStatus ?? 'grounded',
    title: request.fallbackTitle,
    intro: request.fallbackIntro,
    followupParagraphs: request.fallbackFollowupParagraphs,
    sections: request.fallbackSections,
    bullets: request.fallbackBullets,
  });
}

function buildAnswerPlan(
  answerType: AnswerType,
  options: {
    targetCaseIds?: string[];
    questionSubject?: QuestionSubject;
    isValueBeyondUiQuestion?: boolean;
    isCandidateQualityQuestion?: boolean;
  } = {},
): AnswerPlan {
  switch (answerType) {
    case 'candidate_positioning':
      return {
        answerType,
        requiredMoves:
          options.questionSubject === 'candidate_motivation'
            ? ['прямо ответить да/нет', 'дать живую реплику без театра', 'подтвердить поведением и фактами из портфолио']
            : ['кто он', 'где особенно силен', '2-3 доказательства'],
        avoid: ['резюме по компаниям без вывода', 'длинная хронология', 'общие качества без кейсов', 'психологический портрет без фактов'],
        maxParagraphs: 3,
        allowSections: false,
        allowBullets: false,
      };
    case 'experience_overview':
      return {
        answerType,
        requiredMoves: ['где работал и с какими продуктами', 'какой это тип опыта', 'что это доказывает о нем как о дизайнере'],
        avoid: ['сухой список компаний', 'подробный пересказ всех кейсов', 'повтор сильных сторон из hiring-ответа', 'фраза "быстрый ориентир"'],
        maxParagraphs: 2,
        allowSections: false,
        allowBullets: false,
      };
    case 'portfolio_compression':
      return {
        answerType,
        mustStartWith: 'Если сжать опыт Андрея в одну мысль:',
        requiredMoves: ['одна мысль про Андрея', 'по 1-2 строки на ключевые кейсы', 'где лежат доказательства'],
        avoid: ['bullet-only recap', 'сухой список компаний', 'безличный справочный тон'],
        maxParagraphs: 7,
        allowSections: false,
        allowBullets: false,
      };
    case 'portfolio_value_argument':
      return {
        answerType,
        requiredMoves:
          options.questionSubject === 'ai_format_value'
            ? ['что дает сам формат', 'как это экономит время', 'чем лучше статичной страницы']
            : options.questionSubject === 'assistant_case_navigation'
              ? ['почему удобно смотреть кейсы через ассистента', 'какие вопросы можно задать сразу', 'как это помогает быстрее добраться до сути']
              : ['зачем это смотреть', 'что именно это помогает быстро понять', 'какие кейсы дают какой тип доказательства'],
        avoid: ['сравнение со средним дизайнером', 'рекламный тон', 'формулы про полезность портфолио', 'абстракции без конкретики'],
        maxParagraphs: 3,
        allowSections: false,
        allowBullets: false,
      };
    case 'contribution_breakdown':
      return {
        answerType,
        requiredMoves: ['назвать роль кандидата', 'дать 4-6 конкретных действий', 'указать артефакты вклада', 'связать вклад с релизом или результатом'],
        avoid: ['длинное описание продукта', 'пересказ продукта перед вкладом', 'самый сильный кейс', 'повтор одной мысли', 'метрики без связи с вкладом'],
        maxParagraphs: 5,
        allowSections: false,
        allowBullets: false,
        targetCaseIds: options.targetCaseIds,
      };
    case 'case_summary':
      return {
        answerType,
        requiredMoves: ['что за кейс', 'что делал Андрей', 'почему стоит смотреть'],
        avoid: ['длинный отчет', 'канцелярит', 'защита кейса вместо объяснения'],
        maxParagraphs: 3,
        allowSections: false,
        allowBullets: false,
        targetCaseIds: options.targetCaseIds,
      };
    case 'decision_breakdown':
      return {
        answerType,
        requiredMoves:
          options.questionSubject === 'case_research'
            ? ['что именно проверяли или изучали', 'какими артефактами это подтверждено', 'где фактов не хватает']
            : options.questionSubject === 'case_decisions'
              ? ['какие решения были приняты', 'почему они были важны', 'чем подтверждены']
              : options.questionSubject === 'design_process'
                ? ['какие гипотезы или решения проверял', 'где это видно по кейсам и артефактам', 'какая граница подтвержденных фактов']
                : options.questionSubject === 'stakeholder_feedback'
                  ? ['как обрабатывал обратную связь', 'какие примеры подтверждены кейсами', 'не додумывать неподтвержденные процессы']
                  : options.questionSubject === 'prioritization'
                    ? ['как выбирал важное', 'какие компромиссы подтверждены кейсами', 'что не подтверждено']
                    : ['главный принцип', 'пример из кейса', 'что это подтверждает'],
        avoid: ['пересказ всех действий по порядку', 'пустые общие слова', 'додуманные интервью или тесты без фактов'],
        maxParagraphs: 4,
        allowSections: true,
        allowBullets: false,
        targetCaseIds: options.targetCaseIds,
      };
    case 'outcome_summary':
      return {
        answerType,
        requiredMoves: ['назвать подтвержденный результат', 'отделить метрики от качественного вывода', 'сказать прямо, если нужных метрик нет'],
        avoid: ['выдуманные метрики', 'NPS или feedback без фактов', 'общая победная риторика', 'метрики без связи с кейсом'],
        maxParagraphs: 3,
        allowSections: true,
        allowBullets: false,
        targetCaseIds: options.targetCaseIds,
      };
    case 'proof_map':
      return {
        answerType,
        requiredMoves:
          options.questionSubject === 'case_evidence'
            ? ['прямо сказать, что словам верить не нужно', 'назвать проверяемые артефакты', 'показать где смотреть по кейсам', 'дать критерий доверия: без артефактов это рассказ о себе']
            : ['где лежат доказательства', 'на какие артефакты смотреть', 'что именно они подтверждают'],
        avoid: ['защита ассистента', 'фраза "я ограничен фактами"', 'убеждать словами', 'общая фраза "смотри кейсы"', 'бездоказательные выводы', 'дублирующиеся секции', 'одинаковые заголовки', 'объяснение зачем смотреть портфолио вместо карты доказательств', 'слово "сигнал"', 'маркетинговый тон'],
        maxParagraphs: 4,
        allowSections: options.questionSubject !== 'case_evidence',
        allowBullets: options.questionSubject !== 'case_evidence',
        targetCaseIds: options.targetCaseIds,
      };
    case 'hiring_argument':
      return {
        answerType,
        requiredMoves:
          options.questionSubject === 'interview_decision'
            ? ['почему стоит тратить слот интервью', 'какие задачи он может закрыть', 'что именно нужно проверить на разговоре']
            : options.questionSubject === 'case_strength'
              ? ['что этот кейс доказывает', 'почему он важен для оценки кандидата', 'какие артефакты или результаты это подтверждают']
              : options.questionSubject === 'candidate_value' && options.isValueBeyondUiQuestion
                ? ['сказать что остается способ работы, а не мнение о кандидате', 'разложить цепочку работы: требования, user flow, гипотезы, проверка, handoff, релиз', 'подтвердить разными кейсами: Альфа-Смарт, SIEBEL, ChatPoint']
                : options.questionSubject === 'candidate_value' && options.isCandidateQualityQuestion
                  ? ['ответить на оценку кандидата без позиции "мне кажется"', 'дать 2-3 доказательства из разных кейсов', 'закончить точной формулировкой уровня доказанности']
              : ['оценить кандидата через артефакты и результаты', 'что остается кроме экранов и аккуратного UI', 'кейсы как доказательства', 'честная граница'],
        avoid: ['сводить ответ только к Альфа-Смарт', 'оценка "хороший дизайнер" без доказательств', 'общие качества', 'резюме без позиции', 'сравнение со средним дизайнером', 'слишком сильные обещания', 'сильная сторона Андрея как старт ответа'],
        maxParagraphs: 3,
        allowSections: false,
        allowBullets: false,
      };
    case 'failure_postmortem':
      return {
        answerType,
        mustStartWith: 'Да.',
        requiredMoves: ['назвать кейс', 'что за продукт', 'что делал Андрей', 'почему продукт не взлетел', 'какой урок из этого следует'],
        avoid: ['защитный тон', 'попытка выдать провал за успех', 'заголовки', 'hero-tone'],
        maxParagraphs: 4,
        allowSections: false,
        allowBullets: false,
        targetCaseIds: options.targetCaseIds,
      };
    case 'risk_assessment':
      return {
        answerType,
        requiredMoves: ['где реальная слабая зона', 'пример кейса', 'честная граница'],
        avoid: ['размытый негатив', 'паническая критика', 'сваливание всего в один список'],
        maxParagraphs: 3,
        allowSections: false,
        allowBullets: false,
        targetCaseIds: options.targetCaseIds,
      };
    case 'calibrated_unknown':
      return {
        answerType,
        requiredMoves: ['сразу назвать границу подтвержденных фактов', 'дать ближайшее подтвержденное evidence', 'отделить delivery от непроверяемого качества', 'предложить один точный вопрос для интервью'],
        avoid: ['категоричное да или нет о дисциплине', 'психологический портрет', 'общая заглушка', 'неподтвержденные сроки'],
        maxParagraphs: 2,
        allowSections: false,
        allowBullets: false,
        targetCaseIds: options.targetCaseIds,
      };
    default:
      return {
        answerType,
        requiredMoves: ['дать ответ', 'подкрепить фактами'],
        avoid: ['вода'],
        maxParagraphs: 3,
        allowSections: false,
        allowBullets: false,
      };
  }
}

function buildFewShotExamples(
  answerType: AnswerType,
  questionSubject?: QuestionSubject,
): string {
  switch (answerType) {
    case 'candidate_positioning':
      if (questionSubject === 'candidate_motivation') {
        return `
Хороший пример:
Вопрос: Нравится ли Андрею работа дизайнером?
Ответ: Да. Иначе было бы странно тратить столько сил на кейсы, разбор решений и даже на меня.

Но лучше смотреть не на декларацию "нравится/не нравится", а на поведение: Андрей продолжает разбирать свои решения, показывать доказательства и честно вытаскивать наружу даже слабые кейсы вроде ChatPoint.
`;
      }
      return '';
    case 'failure_postmortem':
      return `
Хороший пример:
Вопрос: Был ли неудачный кейс?
Ответ: Да. ChatPoint — самый честный пример.

Андрей работал над B2B-платформой для коммуникаций: подключение каналов, маршрутизация, операторские и админские сценарии. Интерфейсно задача была сильная: много сложной логики, ролей и зависимостей.

Но продукт закрыли. Главная причина — ценность проверили слишком поздно.

Для Андрея этот кейс важен не как история успеха, а как урок: сначала проверять, нужен ли продукт, и только потом глубоко вкладываться в решение.
`;
    case 'calibrated_unknown':
      return `
Хороший пример:
Вопрос: Срывал ли Андрей дедлайны?
Ответ: В портфолио нет данных, чтобы честно сказать, срывал ли Андрей дедлайны: там не описаны сроки, оценки задач или просрочки.

Есть подтверждение другого уровня: в Альфа-Смарте и SIEBEL решения дошли до реализации, включая handoff и проверку после релиза. Это показывает доведение работы до результата, но не доказывает личную дисциплину по срокам. На интервью стоит спросить, как он оценивает задачи и эскалирует риск срыва.
`;
    case 'hiring_argument':
      if (questionSubject === 'interview_decision') {
        return `
Хороший пример:
Вопрос: Почему его стоит звать на интервью?
Ответ: Андрея стоит звать на интервью, если нужен дизайнер под сложный продукт, а не только под аккуратный UI.

По Альфа-Смарту и SIEBEL видно, что он умеет разбирать сценарии, ограничения и рабочую среду, а потом доводить решение до релиза. На интервью его стоит проверять на уровне мышления: как он принимает решения, что считает доказательством и как связывает дизайн с результатом.
`;
      }
      if (questionSubject === 'case_strength') {
        return `
Хороший пример:
Вопрос: Почему этот кейс сильный?
Ответ: Этот кейс сильный не потому, что здесь просто аккуратные экраны, а потому что по нему видно, как Андрей работает от проблемы до результата.

В Альфа-Смарте он сначала разобрал сценарий и гипотезы, потом довел решение до релиза и метрик. Для оценки кандидата это важно, потому что кейс показывает не только UI, а связку: решение, проверка и итоговый результат.
`;
      }
      return `
Хороший пример:
Вопрос: Чем Андрей лучше других дизайнеров?
Ответ: Если убрать аккуратный UI, у Андрея остается главное: умение разобраться в ролях, сценариях и ограничениях, а уже потом собирать интерфейс.

Лучше всего это видно по Альфа-Смарту и SIEBEL: в одном случае — сложный продукт с запуском и метриками, в другом — операторский процесс с исследованием и измеримым эффектом.
`;
    case 'experience_overview':
      return `
Хороший пример:
Вопрос: Кратко пройдись по его опыту.
Ответ: Андрей работал продуктовым дизайнером в MTS Digital, Альфа-Банке и Positive Technologies. По типу задач это B2B и B2C продукты со сложной логикой: операторские сценарии, банковские продукты и мобильные пользовательские пути.

Этот опыт показывает, что он уверенно работает там, где нужно не только собрать интерфейс, но и разобраться в сценариях, ограничениях и том, как решение дойдет до релиза.
`;
    case 'portfolio_compression':
      return `
Хороший пример:
Вопрос: Сожми весь опыт в один ответ...
Ответ: Если сжать опыт Андрея в одну мысль: он не дизайнер «про красивые экраны». Он дизайнер для сложных продуктов, где нужно разобраться в логике, ролях, сценариях и ограничениях — а потом превратить это в понятный интерфейс.

У него есть кейсы в финтехе, B2B, операторских системах и мобильных сценариях. Где-то результат подтверждается запуском и метриками, где-то — сокращением времени работы, а где-то честным выводом, почему продукт не сработал.

**Альфа-Смарт** — запуск подписки в мобильном банке. Андрей проектировал сценарии управления подпиской, выгоды, тарифы и семейные механики. Подтверждение — макеты, гипотезы, запуск и продуктовые метрики.

**SIEBEL** — сложный операторский workflow. Андрей разбирал процесс, убирал лишние шаги и проектировал интерфейс под реальную работу операторов. Подтверждение — сценарии, user flow и метрики до/после.

**ChatPoint** — ранний B2B-продукт, который в итоге закрыли. Ценность кейса в том, что он показывает не успех, а зрелый вывод: проверять спрос и PMF нужно раньше. Подтверждение — разбор сценариев, продуктовая логика и выводы после закрытия.

**Mobile cases** — мобильные сценарии с ограничениями, состояниями и согласованиями. Они показывают ширину опыта: Андрей умеет работать не только с тяжелыми B2B-интерфейсами, но и с компактными пользовательскими сценариями.
`;
    case 'portfolio_value_argument':
      if (questionSubject === 'ai_format_value') {
        return `
Хороший пример:
Вопрос: Что дает такой формат портфолио?
Ответ: Такой формат убирает главный минус обычного портфолио: не нужно читать всё подряд и самому собирать вывод о кандидате.

Можно сразу спросить то, что влияет на решение: где метрики, какой был личный вклад, есть ли слабые кейсы, как кандидат принимает решения и что подтверждает его опыт.
`;
      }
      if (questionSubject === 'assistant_case_navigation') {
        return `
Хороший пример:
Вопрос: Зачем мне смотреть кейсы через ассистента?
Ответ: Через ассистента кейсы удобнее смотреть не линейно, а по вашим вопросам.

Не нужно открывать каждый кейс и вычитывать детали. Можно сразу спросить про вклад, доказательства, метрики, риски и релевантность под роль — и быстрее добраться до сути.
`;
      }
      return `
Хороший пример:
Вопрос: Почему это портфолио вообще стоит смотреть?
Ответ: Его стоит смотреть, если нужно быстро понять кандидата не по набору экранов, а по типам доказательств. Здесь видно, где у Андрея есть запущенный продукт с метриками, где сильный workflow и исследование, а где честный слабый кейс.

Альфа-Смарт показывает релиз и результат, SIEBEL — работу с реальным операторским процессом, ChatPoint — зрелый вывод из неудачного продукта, а mobile cases — ширину опыта. За счет этого по портфолио быстрее собирается цельная картина, чем по обычной подборке экранов.
`;
    case 'contribution_breakdown':
      return `
Хороший пример:
Вопрос: Что он здесь реально сделал?
Ответ: В Альфа-Смарте Андрей был не просто дизайнером экранов, а единственным Product Designer на кейсе.

Его вклад был в том, что он разобрал требования и роли в семейной подписке, собрал user flow, сделал первые драфты, подготовил гипотезы и прототип для юзабилити-теста. После нескольких итераций команда ушла от web-first подхода к мобильному сценарию, потому что именно он был важнее для запуска.

Дальше Андрей прошёл дизайн-чек, подготовил макеты для разработки, структурировал их по пользовательскому пути и провёл дизайн-ревью после реализации. По кейсу есть не только итоговые экраны, но и артефакты процесса: Miro-структура, user flow, гипотезы, прототипы, дизайн-чек, handoff и метрики после запуска.
`;
    case 'proof_map':
      return `
Хороший пример:
Вопрос: Если я не верю словам, на что смотреть в кейсах?
Ответ: Правильно, словам верить не нужно. Особенно словам ассистента.

Проверяйте не то, как Андрей описывает себя, а следы работы в кейсах: user flow, гипотезы, прототипы, дизайн-чек, handoff, дизайн-ревью, метрики и выводы после запуска.

В Альфа-Смарте должна считываться цепочка: требования → user flow → гипотезы → прототип → передача в разработку → релиз → метрики. В SIEBEL — исследование реального процесса и изменения workflow. В ChatPoint — честный разбор продукта, который не сработал.

Если кейс нельзя проверить по артефактам, это не кейс, а рассказ о себе.
`;
    case 'outcome_summary':
      return `
Хороший пример:
Вопрос: Какой результат получился после запуска?
Ответ: По этому кейсу подтвержденный результат нужно разделять на две части: что дошло до релиза и какие метрики есть в портфолио.

Если метрики есть, называй только их. Если NPS, ошибки или feedback не указаны в фактах, так и скажи: в портфолио это не подтверждено.
`;
    default:
      return '';
  }
}

function isValueBeyondUiQuestion(question: string): boolean {
  return /если убрать.+(?:красив|аккуратн|визуальн).+(?:экран|ui|интерфейс|картин)|что останется.+(?:без|кроме|после).+(?:экран|ui|интерфейс|картин|визуал)|без красивых экранов|кроме красивых экранов|кроме аккуратного ui|если не смотреть на ui|если не смотреть на экраны/i.test(question);
}

function isCandidateQualityQuestion(question: string): boolean {
  return /андре[йя].+хорош.+дизайнер|хорош.+дизайнер.+андре[йя]|андре[йя].+сильн.+дизайнер|нормальн.+дизайнер/i.test(question);
}

function isDeadlineReliabilityQuestion(question: string): boolean {
  return /дедлайн|срок|продалб|срыв|успева/i.test(question);
}

function buildGlobalSynthesisRequest(
  question: string,
  topic: SynthesisTopic,
  answerType: AnswerType,
  queryScope: QueryScope,
  questionSubject: QuestionSubject,
  responseLength: ResponseLength,
  session: AssistantSession,
): SynthesisRequestConfig {
  const config = getSynthesisTopicConfig(topic);
  const valueBeyondUiQuestion = isValueBeyondUiQuestion(question);
  const candidateQualityQuestion = isCandidateQualityQuestion(question);
  const deadlineReliabilityQuestion = isDeadlineReliabilityQuestion(question);
  const answerPlan = applyResponseLength(buildAnswerPlan(answerType, {
    questionSubject,
    isValueBeyondUiQuestion: valueBeyondUiQuestion,
    isCandidateQualityQuestion: candidateQualityQuestion,
  }), responseLength);
  const facts = config.subjectFacts?.[questionSubject] ?? config.facts;
  const portfolioValueVariant =
    topic === 'portfolio_value' && questionSubject === 'ai_format_value'
      ? {
          title: 'Что дает AI-формат портфолио',
          fallbackParagraphs: [
            'Такой формат убирает главный минус обычного портфолио: не нужно читать всё подряд и самому собирать вывод о кандидате.',
            'Можно сразу спросить то, что влияет на решение: где метрики, какой был личный вклад, есть ли слабые кейсы, как кандидат принимает решения и что подтверждает его опыт.',
          ],
        }
      : topic === 'portfolio_value' && questionSubject === 'assistant_case_navigation'
        ? {
            title: 'Зачем смотреть кейсы через ассистента',
            fallbackParagraphs: [
              'Через ассистента кейсы удобнее смотреть не линейно, а по вашим вопросам.',
              'Не нужно открывать каждый кейс и вычитывать детали. Можно сразу спросить про вклад, доказательства, метрики, риски и релевантность под роль — и быстрее добраться до сути.',
            ],
          }
        : topic === 'portfolio_value'
          ? {
              title: config.title,
              fallbackParagraphs: config.fallbackParagraphs,
            }
          : null;
  const strengthsVariant =
    topic === 'strengths' && questionSubject === 'interview_decision'
      ? {
          title: 'Почему стоит звать Андрея на интервью',
          fallbackParagraphs: [
            'Андрея стоит звать на интервью, если нужен дизайнер под сложный продукт, а не только под аккуратный UI.',
            'По Альфа-Смарту и SIEBEL видно, что он умеет разбирать сценарии, ограничения и рабочую среду, а потом доводить решение до релиза. На интервью его стоит проверять на уровне мышления: как он принимает решения, что считает доказательством и как связывает дизайн с результатом.',
          ],
        }
      : topic === 'strengths' && questionSubject === 'candidate_value' && valueBeyondUiQuestion
        ? {
            title: 'Что остается кроме экранов',
            fallbackParagraphs: [
              'Останется не картинка, а способ работы.',
              'По кейсам видно, что Андрей сначала разбирает задачу: роли, сценарии, ограничения, точки входа, гипотезы и пользовательский путь. Уже потом появляются макеты.',
              'В Альфа-Смарте это цепочка от требований и user flow до релиза и метрик. В SIEBEL — исследование реального процесса операторов и изменение workflow. В ChatPoint — вывод, что хороший интерфейс не спасает продукт, если ценность проверили поздно.',
            ],
          }
        : topic === 'strengths' && questionSubject === 'candidate_value' && candidateQualityQuestion
          ? {
              title: 'Хороший ли Андрей дизайнер',
              fallbackParagraphs: [
                'Да, но проверять это лучше не по словам, а по кейсам.',
                'В Альфа-Смарте видно, что Андрей довел сложный банковский сценарий до релиза и метрик. В SIEBEL — что он умеет разбираться в реальной работе операторов, а не просто перерисовывать интерфейс. В ChatPoint — что он способен честно разбирать слабый продуктовый результат.',
                'Точнее: у него есть доказательства продуктового мышления, работы со сложной логикой и доведения решений до результата.',
              ],
            }
      : null;
  const proofVariant =
    answerType === 'proof_map' && questionSubject === 'case_evidence'
      ? {
          title: 'На что смотреть в кейсах',
          fallbackParagraphs: [
            'Правильно, словам верить не нужно. Особенно словам ассистента.',
            'Проверяйте не то, как Андрей описывает себя, а следы работы в кейсах: user flow, гипотезы, прототипы, дизайн-чек, handoff, дизайн-ревью, метрики и выводы после запуска.',
            'В Альфа-Смарте должна считываться цепочка: требования → user flow → гипотезы → прототип → передача в разработку → релиз → метрики. В SIEBEL — исследование реального процесса и изменения workflow. В ChatPoint — честный разбор продукта, который не сработал.',
            'Если кейс нельзя проверить по артефактам, это не кейс, а рассказ о себе.',
          ],
        }
      : null;
  const identityMotivationVariant =
    topic === 'identity' && questionSubject === 'candidate_motivation'
      ? {
          title: 'Нравится ли Андрею работа дизайнером',
          fallbackParagraphs: [
            'Да. Иначе было бы странно тратить столько сил на кейсы, разбор решений и даже на меня.',
            'Но лучше смотреть не на декларацию “нравится/не нравится”, а на поведение: Андрей продолжает разбирать свои решения, показывать доказательства и честно вытаскивать наружу даже слабые кейсы вроде ChatPoint.',
          ],
        }
      : null;
  const behavioralEvidenceVariant =
    topic === 'delivery_evidence' && questionSubject === 'behavioral_evidence_check'
      ? deadlineReliabilityQuestion
        ? {
            title: 'Что можно сказать о сроках',
            fallbackParagraphs: [
              'В портфолио нет данных, чтобы честно сказать, срывал ли Андрей дедлайны: там не описаны сроки, оценки задач или просрочки.',
              'Есть подтверждение другого уровня: в Альфа-Смарте и SIEBEL решения дошли до реализации, включая дизайн-чек, handoff и проверку после реализации. Это показывает доведение работы до результата, но не доказывает личную дисциплину по срокам. На интервью стоит спросить, как он оценивает задачи и эскалирует риск срыва.',
            ],
          }
        : {
            title: 'Что можно сказать об исполнительности',
            fallbackParagraphs: [
              'По материалам скорее видно, что Андрей доводит дизайн-работу до реализации: в Альфа-Смарте прошел путь от требований до handoff и запуска, а в SIEBEL — от исследования до MVP и релиза.',
              'Но портфолио не подтверждает ежедневную исполнительность или соблюдение сроков как личное качество. На интервью стоит попросить конкретный пример: как он вел задачу, когда срок был под риском.',
            ],
          }
      : null;
  const processVariant =
    topic === 'decision_making' && questionSubject === 'design_process'
      ? {
          title: 'Как Андрей ведет дизайн-процесс',
          fallbackParagraphs: [
            'По подтвержденным кейсам его процесс выглядит так: сначала разобраться в задаче, ролях и ограничениях, потом собрать сценарий и гипотезы, после этого перейти к макетам, проверке и передаче в разработку.',
            'Гипотезы он проверял через разные форматы: в Альфа-Смарте были юзабилити-тесты и First Click test, в SIEBEL — анализ записей операторов, интервью и проверка решений через MVP.',
          ],
        }
      : topic === 'decision_making' && questionSubject === 'collaboration_process'
        ? {
            title: 'Как Андрей работает с командами',
            fallbackParagraphs: [
              'По кейсам видно, что Андрей работает не только с интерфейсом, а с людьми вокруг задачи: бизнесом, продактами, разработкой и соседними командами.',
              'В Альфа-Смарте это было видно в синхронизации сценария и handoff, в SIEBEL — в согласовании проблем с продактами, а в расходах держателей — в межкомандной зависимости, которую нужно было провести до решения.',
            ],
          }
        : topic === 'decision_making' && questionSubject === 'stakeholder_feedback'
          ? {
              title: 'Как Андрей работает с обратной связью',
              fallbackParagraphs: [
                'В портфолио подтверждены не все детали работы со стейкхолдерами, поэтому здесь нельзя честно рассказывать “полный процесс”.',
                'Что подтверждено: в Альфа-Смарте были дизайн-чек, аппрувы и дизайн-ревью после реализации; в SIEBEL найденные проблемы согласовывались с продактами перед переводом в решения.',
              ],
            }
          : topic === 'decision_making' && questionSubject === 'prioritization'
            ? {
                title: 'Как Андрей приоритизирует решения',
                fallbackParagraphs: [
                  'По кейсам видно, что Андрей приоритизирует не по красоте экрана, а по влиянию на сценарий и ограничения продукта.',
                  'В Альфа-Смарте это видно в переходе от web-first к mobile-first и споре за MVP отмены подписки в один экран. В SIEBEL — в фокусе на двухоконный режим, данные клиента и шаблоны, а не на косметический редизайн.',
                ],
              }
            : topic === 'decision_making' && questionSubject === 'impact_measurement'
              ? {
                  title: 'Как Андрей измеряет влияние работы',
                  fallbackParagraphs: [
                    'Влияние подтверждено не во всех кейсах одинаково. Самые сильные данные есть в Альфа-Смарте и SIEBEL.',
                    'В Альфа-Смарте есть продуктовые метрики после запуска: 32 111 активных подписчиков, 30% владельцев добавили участников, 1,1 млн ₽ дохода. В SIEBEL есть эффект по workflow: среднее время обработки сократилось с 900 до 580 секунд, а число диалогов выросло примерно вдвое.',
                  ],
                }
              : topic === 'decision_making' && questionSubject === 'learning_adaptation'
                ? {
                    title: 'Как Андрей учится новому',
                    fallbackParagraphs: [
                      'Самый явно подтвержденный пример обучения — UX/UI WannabeLike: Андрей отдельно прокачивал UI вне жестких ограничений банковской дизайн-системы.',
                      'По этому кейсу видны research synthesis, структура приложения, user flows и UI-концепт. Более широкий список случаев быстрого обучения в портфолио пока не подтвержден.',
                    ],
                  }
                : null;
  const designSystemVariant =
    topic === 'experience' && questionSubject === 'design_system_work'
      ? {
          title: 'Как Андрей работает с дизайн-системами',
          fallbackParagraphs: [
            'В портфолио подтверждено, что Андрей работал не только с кастомными экранами, но и внутри готовых дизайн-систем.',
            'В Positive Technologies он проектировал часть интерфейсов с готовой дизайн-системой и поддерживал UI-kit. В Альфа-Смарте работал в ограничениях банковской дизайн-системы и BDUI.',
          ],
        }
      : null;
  const variant =
    portfolioValueVariant
    ?? strengthsVariant
    ?? proofVariant
    ?? identityMotivationVariant
    ?? behavioralEvidenceVariant
    ?? processVariant
    ?? designSystemVariant;
  const resolvedTitle = variant?.title ?? config.title;
  const resolvedFallbackParagraphs = variant?.fallbackParagraphs ?? config.fallbackParagraphs;
  return {
    topic,
    answerType,
    queryScope,
    questionSubject,
    responseLength,
    answerPlan,
    title: resolvedTitle,
    facts,
    fallbackTitle: variant?.title ?? config.fallbackTitle,
    fallbackIntro: resolvedFallbackParagraphs[0] ?? config.fallbackTitle,
    fallbackFollowupParagraphs: !answerPlan.allowSections
      ? resolvedFallbackParagraphs.slice(1, answerPlan.maxParagraphs)
      : [],
    fallbackSections: resolvedFallbackParagraphs.slice(1, 4).map((paragraph, index) => ({
      title: ['Что видно', 'Где подтверждается', 'Как читать сигнал'][index] ?? `Блок ${index + 1}`,
      body: paragraph,
    })),
    fallbackBullets: config.fallbackBullets,
    chips: config.chips,
    previousUserQuestion: session.lastUserQuestion,
    previousAssistantAnswerPreview: session.lastAssistantAnswerPreview,
    previousQuestionSubject: session.lastQuestionSubject,
  };
}

async function synthesizeAnswerFromRequest(
  question: string,
  session: AssistantSession,
  request: SynthesisRequestConfig,
): Promise<SynthesisSnapshot> {
  const contextLabel = session.selectedContext.label ?? 'нет выбранного контекста';
  const facts = [...new Set(request.facts.map((fact) => fact.trim()).filter(Boolean))].slice(
    0,
    LIMITS.MAX_RETRIEVED_CHUNKS,
  );

  if (!isOpenAIEnabled()) {
    return buildFallbackSnapshot(request, question);
  }

  const prompt = `
Ты пишешь ответ для AI portfolio assistant на русском языке.
Пиши живым, естественным и простым русским языком, ориентированным на обычного человека.
Категорически запрещено использовать англицизмы, рекрутерский и дизайн-жаргон, в особенности слова: "сигнал" (в контексте оценки), "product judgment", "craft", "delivery", "workflow-heavy", "anti-case". Вместо них используй простые русские аналоги (например, "доведение до релиза" вместо "delivery", "опыт/показатель" вместо "сигнал", "продуктовое мышление" вместо "product judgment").
Ты не пересказываешь карточку кейса или резюме. Ты помогаешь рекрутеру, лиду или нанимающему менеджеру быстро понять ценность кандидата.

Сначала отвечай прямо на вопрос пользователя. Не повторяй вопрос в начале ответа.
Если пользователь находится внутри конкретного кейса, отвечай в первую очередь про этот кейс, а не общими словами по портфолио.
Приводи примеры и метрики только если они есть во входных фактах и реально помогают ответу.

Тебе нельзя придумывать кейсы, цифры, роли, процессы или выводы, которых нет во входных фактах.
Не копируй дословно готовые формулировки из входных фактов, если можешь сказать то же самое проще и живее.
Не используй канцелярские или пустые фразы вроде "быстрый ориентир", "как читать сигнал", "здесь есть что смотреть", если пользователь сам не просил такого тона.
Если фактов мало, отвечай аккуратно и не преувеличивай.
Если фактов недостаточно для ответа, не маскируй это под обычный ответ: выбери answerStatus="insufficient_facts" и коротко назови границу данных.
Если вопрос слишком широкий или непонятный, выбери answerStatus="needs_clarification".
Если вопрос по сути просит не объяснение, а переход к кейсу/разделу, выбери answerStatus="navigation_suggested" и дай короткое пояснение.
Тон: собранный, прямой, профессиональный. Без рекламной клоунады.

Вопрос пользователя:
${question}

Тема ответа:
${request.title}

Тип ответа:
${request.answerType}

Scope ответа:
${request.queryScope}

QuestionSubject ответа:
${request.questionSubject}

Текущий контекст интерфейса:
${contextLabel}

Разрешенные факты:
${facts.map((fact) => `- ${fact}`).join('\n')}

Контракт ответа:
- answerType: ${request.answerPlan.answerType}
- requiredMoves: ${request.answerPlan.requiredMoves.join(' | ')}
- avoid: ${request.answerPlan.avoid.join(' | ')}
- maxParagraphs: ${request.answerPlan.maxParagraphs}
- allowSections: ${request.answerPlan.allowSections ? 'yes' : 'no'}
- allowBullets: ${request.answerPlan.allowBullets ? 'yes' : 'no'}
${request.answerPlan.mustStartWith ? `- mustStartWith: ${request.answerPlan.mustStartWith}` : ''}
${request.answerPlan.targetCaseIds?.length ? `- targetCaseIds: ${request.answerPlan.targetCaseIds.join(', ')}` : ''}

Специальные правила по QuestionSubject:
- candidate_portfolio_value: объясняй, почему это портфолио кандидата полезно для оценки и какие типы доказательств в нем есть
- ai_format_value: отвечай про формат AI-портфолио как инструмента, а не про силу Андрея как кандидата
	- assistant_case_navigation: отвечай про сценарий просмотра кейсов через ассистента и про то, какие вопросы он помогает задать быстрее
	- interview_decision: отвечай, почему стоит тратить слот интервью и что нужно проверить на разговоре
	- candidate_motivation: отвечай живо, но подтверждай вывод поведением и фактами портфолио, а не психологическими догадками
	- case_contribution: отвечай только про личный вклад кандидата
- case_evidence: отвечай как карта проверки по артефактам; если пользователь говорит, что не верит словам, это нормальная позиция, а не спор с ассистентом
- case_strength: отвечай, что именно этот кейс доказывает о кандидате и почему это важно для оценки
- case_problem: отвечай про исходную задачу и проблему, не уходи в продажу кейса
- case_research: отвечай только про подтвержденные исследования, проверки, тесты и артефакты; если нужного типа проверки нет в фактах, скажи об этом
- case_decisions: отвечай про конкретные решения, механику, flow и trade-off
- case_constraints: отвечай про ограничения, права доступа, безопасность, edge cases и компромиссы; не выдумывай compliance
- case_outcomes: отвечай про подтвержденные результаты, метрики и feedback; если NPS/ошибки/отзывы не указаны, скажи "в портфолио это не подтверждено"
- design_process: отвечай про процесс от задачи до handoff только по подтвержденным кейсам
- collaboration_process: отвечай про работу с PM, разработчиками и командами только по подтвержденным кейсам
- stakeholder_feedback: отвечай про feedback и стейкхолдеров только если это есть во фактах
- prioritization: отвечай про приоритеты и компромиссы через подтвержденные решения
- impact_measurement: отвечай про измерение влияния и метрики; не придумывай метрики
- design_system_work: отвечай про дизайн-системы, компоненты и UI-kit только по подтвержденным фактам
- learning_adaptation: отвечай про обучение новому только по подтвержденным фактам
- behavioral_evidence_check: не делай вывод "срывает" или "не срывает" без прямых данных о сроках. Сначала назови границу данных, затем ближайшее подтвержденное evidence о delivery и в конце предложи один конкретный вопрос для интервью

Предыдущий диалог:
- previousUserQuestion: ${request.previousUserQuestion ?? 'none'}
- previousQuestionSubject: ${request.previousQuestionSubject ?? 'none'}
- previousAssistantAnswerPreview: ${request.previousAssistantAnswerPreview ?? 'none'}

Нужно:
1. answerStatus:
   - grounded: входных фактов достаточно
   - insufficient_facts: фактов нет или их недостаточно
   - needs_clarification: вопрос надо уточнить
   - navigation_suggested: лучше дать краткий ответ и предложить открыть раздел/кейс
2. title: короткая внутренняя тема ответа для системы. Пользователь ее не увидит, не пиши ее как начало сообщения.
3. intro: первый видимый абзац ответа. Он должен начинаться как обычная чат-реплика, например "Андрей работает..." или "По кейсам видно...". Не начинай intro с заголовка.
4. sections: 0-3 смысловых блока в формате короткий H3 + один короткий абзац. Используй секции только если без них ответ хуже читается.
5. bullets: пустой массив, кроме случаев когда перечисление реально лучше секций
6. Если нужно визуально выделить название кейса или ключевую сущность в начале абзаца, используй только markdown-lite формат **вот так**. Других inline-форматов нет.

Примеры хорошего ответа:
${buildFewShotExamples(request.answerType, request.questionSubject)}

Формат ответа:
Короткий conversational intro без заголовка.
### Смысловой блок
Один короткий абзац.

Жесткие ограничения:
- не пиши эссе
- не начинай ответ с заголовка
- не делай длинные абзацы
- каждая section должна держать одну мысль
- обычный ответ должен быть компактным: 350-700 символов
- для простого вопроса достаточно 1-2 абзацев без секций
- если responseLength = compact, ответь максимум двумя короткими абзацами без секций и списков
- если allowSections = no, не используй заголовки и разделы
- если allowBullets = no, не превращай ответ в список
- если mustStartWith задан, начни именно так
- если answerType не равен experience_overview, не начинай ответ с хронологии компаний
- сначала дай вывод, потом объяснение, потом доказательство
- не начинай hiring-ответ с формулы "Сильная сторона Андрея —"
- не объясняй кейс через фразу "ценность не в картинках"
- не начинай ответ с фразы "Если нужен быстрый ориентир"
- не используй фразу "это портфолио полезно"
- для portfolio_value_argument не сравнивай Андрея со "средним дизайнером"
- для portfolio_value_argument объясняй пользу формата оценки, а не продавай кандидата общими словами
- для ai_format_value не начинай с "Его стоит смотреть"
- для assistant_case_navigation не начинай с "Его стоит смотреть"
- если предыдущий вопрос близок по теме, но у текущего другой QuestionSubject, не повторяй прошлый ответ дословно
- contribution_breakdown всегда отвечает про личный вклад кандидата, а не продает кейс целиком
- для case_strength не своди силу кейса только к красивому UI или визуалу
- для calibrated_unknown не подменяй отсутствие данных общей заглушкой и не приписывай кандидату дисциплину, ответственность или проблемы со сроками

Запрещено:
- выдумывать новые кейсы
- добавлять отсутствующие метрики
- писать "возможно", если этого нет во фактах
- пересказывать портфолио как резюме строка за строкой
`;

  const developerPromptChars = 1200;
  const userMessageChars = question.length;
  const ragContextChars = facts.map((fact) => `- ${fact}`).join('\n').length;
  const schemaChars = 500;
  const totalPayloadChars = prompt.length + schemaChars;

  const callId = logOpenAICallStart({
    route: 'synthesizeGeneralAnswer',
    model: getOpenAIModel(),
    systemPromptChars: 0,
    developerPromptChars,
    userMessageChars,
    ragContextChars,
    historyChars: 0,
    schemaChars,
    totalPayloadChars,
    estimatedInputChars: Math.round(totalPayloadChars / 4),
    retrievedChunksCount: facts.length,
    messagesCount: 1,
  });

  const startTime = Date.now();
  try {
    const result = await generateText({
      model: openai(getOpenAIModel()),
      temperature: 0.3,
      output: Output.object({ schema: synthesisSchema }),
      prompt,
    });

    const { output, usage, response } = result;

    logOpenAICallEnd(callId, {
      requestId: response.id,
      status: 'success',
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cachedInputTokens: usage.inputTokenDetails?.cacheReadTokens,
      durationMs: Date.now() - startTime,
    });

    return finalizeSnapshot(request, question, {
      answerStatus: output.answerStatus,
      title: output.title,
      intro: output.intro,
      sections: output.sections,
      bullets: output.bullets,
    });
  } catch (error: unknown) {
    logOpenAICallEnd(callId, {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });
    return buildFallbackSnapshot(request, question);
  }
}

export async function synthesizeGeneralAnswer(
  question: string,
  session: AssistantSession,
  topic: SynthesisTopic,
  answerType: AnswerType,
  queryScope: QueryScope,
  questionSubject: QuestionSubject,
  responseLength: ResponseLength = 'default',
): Promise<SynthesisSnapshot> {
  return synthesizeAnswerFromRequest(
    question,
    session,
    buildGlobalSynthesisRequest(
      question,
      topic,
      answerType,
      queryScope,
      questionSubject,
      responseLength,
      session,
    ),
  );
}

const CASE_FACET_TOPIC_MAP: Record<CaseFactFacet, SynthesisTopic> = {
  overview: 'fit',
  problem: 'fit',
  role: 'fit',
  research: 'decision_making',
  decisions: 'decision_making',
  constraints: 'fit',
  outcomes: 'fit',
  evidence: 'fit',
  strengths: 'strengths',
  risks: 'fit',
};

type FallbackOverride = {
  fallbackIntro: string;
  fallbackSections: Array<{
    title: string;
    body: string;
  }>;
  fallbackBullets: string[];
};

function normalizeFallbackText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[«»"'.!,?:;()—–-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeFallbackParagraphs(intro: string, paragraphs: string[]): string[] {
  const seen = new Set<string>([normalizeFallbackText(intro)]);

  return paragraphs.filter((paragraph) => {
    const normalized = normalizeFallbackText(paragraph);
    if (!normalized || seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

function dedupeFallbackSections(
  intro: string,
  paragraphs: string[],
  sections: Array<{ title: string; body: string }>,
): Array<{ title: string; body: string }> {
  const seen = new Set<string>([
    normalizeFallbackText(intro),
    ...paragraphs.map((paragraph) => normalizeFallbackText(paragraph)),
  ]);

  return sections.filter((section) => {
    const normalized = normalizeFallbackText(section.body);
    if (!normalized || seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

function asksForSpecificOutcomeEvidence(question: string): boolean {
  return /метрик|nps|feedback|фидбек|отзыв|ошиб|конверс|вырос|рост|улучшил|улучшились/i.test(question);
}

function hasConfirmedOutcomeEvidence(question: string, pack: CaseFactPack): boolean {
  const facts = [...pack.outcomes, ...pack.validation, ...pack.evidence].join(' ').toLowerCase();

  if (/nps/i.test(question)) {
    return /\bnps\b/i.test(facts);
  }

  if (/feedback|фидбек|отзыв/i.test(question)) {
    return /feedback|фидбек|отзыв|обратн.+связ|без отторжения/i.test(facts);
  }

  if (/ошиб/i.test(question)) {
    return /ошиб/i.test(facts);
  }

  return /%|₽|подписчик|доход|секунд|диалог|вдвое|x2|активн/i.test(facts);
}

function buildOutcomeGapOverride(question: string, pack: CaseFactPack): FallbackOverride | null {
  if (!asksForSpecificOutcomeEvidence(question) || hasConfirmedOutcomeEvidence(question, pack)) {
    return null;
  }

  const confirmedResult =
    pack.outcomes.find((outcome) => !/нет подтвержден|не хватает подтвержден/i.test(outcome.toLowerCase()))
    ?? pack.outcomes[0]
    ?? pack.recruiterSummary.followup
    ?? pack.recruiterSummary.intro;
  const missingMetric =
    pack.missing.find((item) => /метрик|feedback|фидбек|nps|запуск|production/i.test(item))
    ?? 'В портфолио это не подтверждено отдельными метриками, NPS или post-launch feedback.';

  return {
    fallbackIntro: 'По этому вопросу в материалах недостаточно подтверждений, чтобы отвечать уверенно.',
    fallbackSections: [
      {
        title: 'Что подтверждено',
        body: confirmedResult,
      },
      {
        title: 'Чего нет в фактах',
        body: missingMetric,
      },
    ].filter((section) => section.body),
    fallbackBullets: [],
  };
}

export async function synthesizeCaseAwareAnswer(
  question: string,
  session: AssistantSession,
  caseId: string,
  facet: CaseFactFacet,
  answerType: AnswerType,
  queryScope: QueryScope,
  questionSubject: QuestionSubject,
  responseLength: ResponseLength = 'default',
): Promise<SynthesisSnapshot | null> {
  const config = getCaseSynthesisConfig(caseId, facet);
  const pack = getCaseFactPack(caseId);
  if (!config) {
    return null;
  }

  const answerPlan = applyResponseLength(
    buildAnswerPlan(answerType, { targetCaseIds: [caseId], questionSubject }),
    responseLength,
  );
  const outcomeGapOverride =
    answerType === 'outcome_summary' && pack
      ? buildOutcomeGapOverride(question, pack)
      : null;
  const failureOverride =
    answerType === 'failure_postmortem' && pack
      ? {
          fallbackTitle: `Был ли неудачный кейс у ${caseId}`,
          fallbackIntro: `Да. ${pack.recruiterSummary.intro}`,
          fallbackFollowupParagraphs: [
            pack.outcomes[0] ?? '',
            pack.weaknessAngle[0] ?? pack.risks[0] ?? '',
            pack.recruiterTakeaway[0] ?? pack.hiringSignal[0] ?? '',
          ].filter(Boolean),
          fallbackSections: [],
          fallbackBullets: [],
        }
      : null;
  const behavioralEvidenceOverride =
    answerType === 'calibrated_unknown' && pack
      ? {
          fallbackTitle: `Что известно о сроках в кейсе ${caseId}`,
          fallbackIntro: `В материалах кейса ${caseId} нет данных о дедлайнах, просрочках или оценке сроков, поэтому утверждать, что Андрей их срывал или не срывал, нельзя.`,
          fallbackFollowupParagraphs: [
            pack.outcomes[0] ?? pack.evidence[0] ?? '',
            'Это подтверждает результат по кейсу, но не личную дисциплину по срокам. На интервью стоит спросить, как Андрей оценивал задачу и сообщал о риске срыва.',
          ].filter(Boolean),
          fallbackSections: [],
          fallbackBullets: [],
        }
      : null;
  const fallbackIntro = behavioralEvidenceOverride?.fallbackIntro ?? failureOverride?.fallbackIntro ?? outcomeGapOverride?.fallbackIntro ?? config.fallbackIntro;
  const fallbackFollowupParagraphs =
    behavioralEvidenceOverride?.fallbackFollowupParagraphs
    ?? failureOverride?.fallbackFollowupParagraphs
    ?? (outcomeGapOverride ? [] : null)
    ?? (!answerPlan.allowSections
      ? dedupeFallbackParagraphs(
          fallbackIntro,
          config.fallbackSections.map((section) => section.body).slice(0, Math.max(answerPlan.maxParagraphs - 1, 0)),
        )
      : []);
  const fallbackSections = dedupeFallbackSections(
    fallbackIntro,
    fallbackFollowupParagraphs,
    behavioralEvidenceOverride?.fallbackSections ?? failureOverride?.fallbackSections ?? outcomeGapOverride?.fallbackSections ?? config.fallbackSections,
  );

  return synthesizeAnswerFromRequest(question, session, {
    topic: CASE_FACET_TOPIC_MAP[facet],
    answerType,
    queryScope,
    questionSubject,
    responseLength,
    answerPlan,
    title: config.fallbackTitle,
    facts: config.facts,
    fallbackTitle: behavioralEvidenceOverride?.fallbackTitle ?? failureOverride?.fallbackTitle ?? config.fallbackTitle,
    fallbackIntro,
    fallbackFollowupParagraphs,
    fallbackSections,
    fallbackBullets: behavioralEvidenceOverride?.fallbackBullets ?? failureOverride?.fallbackBullets ?? outcomeGapOverride?.fallbackBullets ?? config.fallbackBullets,
    fallbackAnswerStatus: behavioralEvidenceOverride ? 'insufficient_facts' : failureOverride ? 'grounded' : outcomeGapOverride ? 'insufficient_facts' : config.fallbackAnswerStatus,
    chips: config.chips,
    previousUserQuestion: session.lastUserQuestion,
    previousAssistantAnswerPreview: session.lastAssistantAnswerPreview,
    previousQuestionSubject: session.lastQuestionSubject,
  });
}
