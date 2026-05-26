import { Output, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

import { getOpenAIKey, getOpenAIModel } from '@/lib/portfolio/config';
import type { AssistantSession, UIAction } from '@/lib/portfolio/types';

type DeterministicIntent = {
  action: UIAction;
};

const caseAliases: Array<{ caseId: string; patterns: RegExp[] }> = [
  {
    caseId: 'alfa-smart',
    patterns: [
      /альфа/i,
      /смарт/i,
      /флагман/i,
      /сильн(ый|ого|ом|ые|ых)?.+кейс/i,
      /сам(ый|ого|ом)?.+сильн(ый|ого|ом)?.+кейс/i,
      /подписк/i,
    ],
  },
  { caseId: 'siebel', patterns: [/siebel/i, /оператор/i, /мтс/i] },
  { caseId: 'chatpoint', patterns: [/chatpoint/i, /чатпойнт/i, /anti-case/i] },
  { caseId: 'expenses-card-holders', patterns: [/держател/i, /расход/i, /истори/i] },
  { caseId: 'subscription-sharing', patterns: [/шаринг/i, /подписк.+ссыл/i, /приглаш/i] },
  { caseId: 'ux-ui-wannabelike', patterns: [/wannabelike/i, /superapp/i, /миш/i, /структур/i, /ux\/ui/i] },
];

function findCaseId(text: string): string | null {
  const lowered = text.toLowerCase();

  for (const alias of caseAliases) {
    if (alias.patterns.some((pattern) => pattern.test(lowered))) {
      return alias.caseId;
    }
  }

  return null;
}

export function classifyMessageDeterministically(
  text: string,
  session: AssistantSession,
): DeterministicIntent | null {
  const lowered = text.trim().toLowerCase();

  if (!lowered) {
    return null;
  }

  if (/как(ой|ого).+опыт|где.+работал|опыт работы|career/i.test(lowered)) {
    return { action: { type: 'open_experience_summary' } };
  }

  if (/подробн|по компани|траектор/i.test(lowered) && session.selectedContext.kind === 'experience') {
    return { action: { type: 'open_experience_detail' } };
  }

  if (/мобил/i.test(lowered) || /mobile/i.test(lowered)) {
    const caseId = findCaseId(lowered);
    if (caseId && ['expenses-card-holders', 'subscription-sharing', 'ux-ui-wannabelike', 'alfa-smart'].includes(caseId)) {
      return { action: { type: 'open_mobile_case_summary', caseId } };
    }
    return { action: { type: 'open_mobile_experience_overview' } };
  }

  if (/кроме|еще делал|шире|дополнительн/i.test(lowered)) {
    return { action: { type: 'open_additional_cases_overview' } };
  }

  if (
    (lowered.includes('кейс') && lowered.includes('сильн')) ||
    lowered.includes('флагман')
  ) {
    return { action: { type: 'open_case_summary', caseId: 'alfa-smart' } };
  }

  if (/контакт|связа|написа/i.test(lowered)) {
    return { action: { type: 'open_contact_modal', source: 'message' } };
  }

  const caseId = findCaseId(lowered);
  if (caseId) {
    if (/подробн|длинн|детал/i.test(lowered)) {
      if (session.selectedContext.kind === 'experience') {
        return { action: { type: 'open_experience_route', caseId } };
      }

      if (['expenses-card-holders', 'subscription-sharing', 'ux-ui-wannabelike'].includes(caseId)) {
        return { action: { type: 'open_mobile_case_detail', caseId } };
      }

      return { action: { type: 'open_case_detail', caseId } };
    }

    if (/маршрут|почему этот кейс|стоит открыть|что это доказывает/i.test(lowered)) {
      if (session.selectedContext.kind === 'experience') {
        return { action: { type: 'open_experience_route', caseId } };
      }
      return { action: { type: 'open_case_route', caseId } };
    }

    if (['expenses-card-holders', 'subscription-sharing', 'ux-ui-wannabelike'].includes(caseId)) {
      return { action: { type: 'open_mobile_case_summary', caseId } };
    }

    return { action: { type: 'open_case_summary', caseId } };
  }

  if (/кто.+андрей|о себе|портфолио/i.test(lowered)) {
    return { action: { type: 'open_entry' } };
  }

  return null;
}

const classificationSchema = z.object({
  action: z.enum([
    'open_entry',
    'open_case_summary',
    'open_case_detail',
    'open_case_route',
    'open_experience_summary',
    'open_experience_detail',
    'open_experience_route',
    'open_mobile_experience_overview',
    'open_mobile_case_summary',
    'open_mobile_case_detail',
    'open_additional_cases_overview',
    'open_contact_modal',
    'ambiguous_question',
    'no_matching_case',
  ]),
  caseId: z.string().optional(),
  source: z.string().optional(),
});

const CLASSIFIER_PROMPT = `
Ты — классификатор для backend AI portfolio assistant. 
Тебе нельзя придумывать новые действия.
Ты должен выбрать только одно action из списка и, если нужен caseId, вернуть один из:
- alfa-smart
- siebel
- chatpoint
- expenses-card-holders
- subscription-sharing
- ux-ui-wannabelike

Правила:
- Если запрос про опыт работы -> open_experience_summary или open_experience_detail.
- Если запрос про мобильные кейсы в целом -> open_mobile_experience_overview.
- Если запрос про конкретный кейс из мобильных -> open_mobile_case_summary или open_mobile_case_detail.
- Если запрос про флагманский кейс Андрея -> alfa-smart.
- Если запрос про breadth / другие кейсы -> open_additional_cases_overview.
- Если запрос про контакт -> open_contact_modal.
- Если нельзя уверенно понять, что хочет пользователь -> ambiguous_question.
- Если кейса в базе нет -> no_matching_case.

Текущий выбранный контекст: {currentContext}
Последнее сообщение пользователя: {message}
`;

export async function classifyMessageWithModel(
  text: string,
  session: AssistantSession,
): Promise<DeterministicIntent | null> {
  if (!getOpenAIKey()) {
    return null;
  }

  const prompt = CLASSIFIER_PROMPT.replace(
    '{currentContext}',
    session.selectedContext.label ?? 'none',
  ).replace('{message}', text);

  try {
    const { output } = await generateText({
      model: openai(getOpenAIModel()),
      temperature: 0,
      output: Output.object({ schema: classificationSchema }),
      prompt,
    });

    switch (output.action) {
      case 'open_entry':
        return { action: { type: 'open_entry' } };
      case 'open_case_summary':
        return output.caseId ? { action: { type: 'open_case_summary', caseId: output.caseId } } : null;
      case 'open_case_detail':
        return output.caseId ? { action: { type: 'open_case_detail', caseId: output.caseId } } : null;
      case 'open_case_route':
        return output.caseId ? { action: { type: 'open_case_route', caseId: output.caseId } } : null;
      case 'open_experience_summary':
        return { action: { type: 'open_experience_summary' } };
      case 'open_experience_detail':
        return { action: { type: 'open_experience_detail' } };
      case 'open_experience_route':
        return output.caseId ? { action: { type: 'open_experience_route', caseId: output.caseId } } : null;
      case 'open_mobile_experience_overview':
        return { action: { type: 'open_mobile_experience_overview' } };
      case 'open_mobile_case_summary':
        return output.caseId ? { action: { type: 'open_mobile_case_summary', caseId: output.caseId } } : null;
      case 'open_mobile_case_detail':
        return output.caseId ? { action: { type: 'open_mobile_case_detail', caseId: output.caseId } } : null;
      case 'open_additional_cases_overview':
        return { action: { type: 'open_additional_cases_overview' } };
      case 'open_contact_modal':
        return { action: { type: 'open_contact_modal', source: output.source || 'message' } };
      default:
        return null;
    }
  } catch {
    return null;
  }
}
