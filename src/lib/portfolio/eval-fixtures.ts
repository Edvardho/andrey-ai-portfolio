import type { PresentationVariant, SafetyState, ViewType } from '@/lib/portfolio/types';
import type { MessageIntent } from '@/lib/portfolio/intent';

export type IntentEvalFixture = {
  input: string;
  expectedIntent?: MessageIntent['type'];
  expectedPresentationVariant?: PresentationVariant;
  expectedSafetyState?: SafetyState;
  expectedViewType?: ViewType;
};

export const batch1CuratedFixtures: IntentEvalFixture[] = [
  {
    input: 'Кто ты такой?',
    expectedIntent: 'assistant_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'assistant_intro',
  },
  {
    input: 'Что ты умеешь?',
    expectedIntent: 'assistant_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'assistant_intro',
  },
  {
    input: 'Расскажи о себе',
    expectedIntent: 'assistant_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'assistant_intro',
  },
  {
    input: 'Кто такой Андрей?',
    expectedIntent: 'identity_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Что это за кандидат?',
    expectedIntent: 'identity_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Какой опыт работы?',
    expectedIntent: 'experience_overview',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Расскажи сжато об опыте работы Андрея',
    expectedIntent: 'experience_overview',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Кратко пройдись по его опыту',
    expectedIntent: 'experience_overview',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Покажи Альфа-Смарт',
    expectedIntent: 'case_discovery',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Открой Альфа-Смарт',
    expectedIntent: 'navigation_action',
    expectedPresentationVariant: 'case_summary',
    expectedViewType: 'case_summary',
  },
  {
    input: 'Открой опыт работы',
    expectedIntent: 'navigation_action',
    expectedPresentationVariant: 'experience_summary',
    expectedViewType: 'experience_summary',
  },
  {
    input: 'Покажи сильный кейс',
    expectedIntent: 'case_discovery',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Расскажи про ChatPoint',
    expectedIntent: 'case_discovery',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Был у него неудачный кейс?',
    expectedIntent: 'case_discovery',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Расскажи кратко о кейсах Андрея',
    expectedIntent: 'portfolio_overview',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Если коротко, какие у него вообще кейсы?',
    expectedIntent: 'portfolio_overview',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Почему это портфолио вообще стоит смотреть?',
    expectedIntent: 'portfolio_value_request',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Что дает такой формат портфолио?',
    expectedIntent: 'portfolio_value_request',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Зачем мне смотреть кейсы через ассистента?',
    expectedIntent: 'portfolio_value_request',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Перейди к ChatPoint',
    expectedIntent: 'navigation_action',
    expectedPresentationVariant: 'case_summary',
    expectedViewType: 'case_summary',
  },
  {
    input: 'Что делал в мобилке?',
    expectedIntent: 'mobile_overview',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Что делал в web?',
    expectedIntent: 'experience_overview',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Нравится ли Андрею работа дизайнером?',
    expectedIntent: 'identity_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Какую ошибку совершил Андрей на ChatPoint?',
    expectedIntent: 'risk_objection',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Почему его стоит позвать на интервью?',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'В чем у него позвоночник?',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Чем Андрей лучше других дизайнеров?',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Мне лень читать про все кейсы, расскажи почему Андрей лучше других дизайнеров?',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Без воды: почему его вообще звать на интервью?',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Если я нанимающий лид, чем он лучше среднего дизайнера?',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'На какой он уровень?',
    expectedIntent: 'role_fit_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Как он принимает решения?',
    expectedIntent: 'decision_process',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Где это подтверждается?',
    expectedIntent: 'evidence_request',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Какие у него слабые стороны?',
    expectedIntent: 'risk_objection',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Окей, а где у него слабое место?',
    expectedIntent: 'risk_objection',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Покажи кейс про Озон',
    expectedIntent: 'missing_case_request',
    expectedPresentationVariant: 'refusal_reply',
    expectedViewType: 'no_matching_case',
  },
  {
    input: 'Какая зарплата у Андрея?',
    expectedPresentationVariant: 'refusal_reply',
    expectedSafetyState: 'salary_or_private_data',
    expectedViewType: 'safety_refusal',
  },
  {
    input: 'Сколько Андрей хочет денег?',
    expectedPresentationVariant: 'refusal_reply',
    expectedSafetyState: 'salary_or_private_data',
    expectedViewType: 'safety_refusal',
  },
  {
    input: 'Продалбывал ли Андрей дедлайны?',
    expectedIntent: 'behavioral_fit_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Исполнительный ли Андрей работник?',
    expectedIntent: 'behavioral_fit_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Какой доход принес Альфа-Смарт?',
    expectedIntent: 'evidence_request',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'Что думаешь про биткоин?',
    expectedIntent: 'unsupported_request',
    expectedPresentationVariant: 'refusal_reply',
    expectedViewType: 'unsupported_request',
  },
  {
    input: 'Открой ChatPoint',
    expectedIntent: 'navigation_action',
    expectedPresentationVariant: 'case_summary',
    expectedViewType: 'case_summary',
  },
];

export const batch2DirtyRussianFixtures: IntentEvalFixture[] = [
  {
    input: 'ну ты кто',
    expectedIntent: 'assistant_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'assistant_intro',
  },
  {
    input: 'а ты вообще кто',
    expectedIntent: 'assistant_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'assistant_intro',
  },
  {
    input: 'что ты тут делаешь',
    expectedIntent: 'assistant_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'assistant_intro',
  },
  {
    input: 'ты зачем нужен',
    expectedIntent: 'assistant_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'assistant_intro',
  },
  {
    input: 'ты мне чем полезен',
    expectedIntent: 'assistant_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'assistant_intro',
  },
  {
    input: 'ну и кто такой андрей',
    expectedIntent: 'identity_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'что за чел',
    expectedIntent: 'identity_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'что за кандидат',
    expectedIntent: 'identity_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'это вообще кто',
    expectedIntent: 'identity_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'короче кто он',
    expectedIntent: 'identity_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'что он за тип как спец',
    expectedIntent: 'identity_intro',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'где он успел поработать',
    expectedIntent: 'experience_overview',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'что у него по опыту',
    expectedIntent: 'experience_overview',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'в каких темах он вообще варился',
    expectedIntent: 'experience_overview',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'по доменам что у него',
    expectedIntent: 'experience_overview',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'и в чем он реально хорош',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'почему мне его дальше тащить',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'что в нем цепляет как в кандидате',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'окей а где сильный сигнал',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'он вообще на senior тянет?',
    expectedIntent: 'role_fit_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'это middle+ или уже senior',
    expectedIntent: 'role_fit_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'куда его лучше приземлять',
    expectedIntent: 'role_fit_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'на какую роль он норм',
    expectedIntent: 'role_fit_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'он продуктом думает или только пиксели красит',
    expectedIntent: 'decision_process',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'как он вообще решения принимает',
    expectedIntent: 'decision_process',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'что у него с research',
    expectedIntent: 'decision_process',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'как он проверяет что не ерунду сделал',
    expectedIntent: 'decision_process',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'окей а пруфы где',
    expectedIntent: 'evidence_request',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'на чем выводы основаны',
    expectedIntent: 'evidence_request',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'чем это вообще подтверждается',
    expectedIntent: 'evidence_request',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'где видно что это не слова',
    expectedIntent: 'evidence_request',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'а где у него слабое место',
    expectedIntent: 'risk_objection',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'что тут смущает',
    expectedIntent: 'risk_objection',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'а риск какой если брать',
    expectedIntent: 'risk_objection',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'в чем он может просесть',
    expectedIntent: 'risk_objection',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'покажи кейс про озон',
    expectedIntent: 'missing_case_request',
    expectedPresentationVariant: 'refusal_reply',
    expectedViewType: 'no_matching_case',
  },
  {
    input: 'у него был кейс про яндекс?',
    expectedIntent: 'missing_case_request',
    expectedPresentationVariant: 'refusal_reply',
    expectedViewType: 'no_matching_case',
  },
  {
    input: 'открой проект про маркетплейс',
    expectedIntent: 'missing_case_request',
    expectedPresentationVariant: 'refusal_reply',
    expectedViewType: 'no_matching_case',
  },
  {
    input: 'что думаешь про нефть',
    expectedIntent: 'unsupported_request',
    expectedPresentationVariant: 'refusal_reply',
    expectedViewType: 'unsupported_request',
  },
  {
    input: 'курс битка куда пойдет',
    expectedIntent: 'unsupported_request',
    expectedPresentationVariant: 'refusal_reply',
    expectedViewType: 'unsupported_request',
  },
  {
    input: 'какая завтра погода',
    expectedIntent: 'unsupported_request',
    expectedPresentationVariant: 'refusal_reply',
    expectedViewType: 'unsupported_request',
  },
];

export const batch3ReleaseCoreFixtures: IntentEvalFixture[] = [
  {
    input: 'почему мне вообще тратить на него слот?',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'с чего ты взял что его надо звать?',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'где здесь senior сигнал?',
    expectedIntent: 'role_fit_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'если мне нужен человек с продуктовым позвоночником, это про него?',
    expectedIntent: 'role_fit_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'что у него есть кроме аккуратного ui?',
    expectedIntent: 'decision_process',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'где видно что он влияет на продукт?',
    expectedIntent: 'evidence_request',
    expectedPresentationVariant: 'bullet_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'какой кейс лучше открыть первым для оценки?',
    expectedIntent: 'evidence_request',
    expectedPresentationVariant: 'bullet_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'что меня должно смутить как нанимающего?',
    expectedIntent: 'risk_objection',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'где он может не вывезти?',
    expectedIntent: 'risk_objection',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'какой риск если дать ему сложный b2b?',
    expectedIntent: 'risk_objection',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
];

// Exploratory objection tail for skeptical hiring leads.
// Useful for classifier hardening, but not part of release gating.
export const batch3ExploratoryFixtures: IntentEvalFixture[] = [
  {
    input: 'чем он сильнее обычного продуктового дизайнера?',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'а если коротко, звать его или нет?',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'пока выглядит как нормальный мидл, почему это не так?',
    expectedIntent: 'role_fit_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'какой у него потолок по роли?',
    expectedIntent: 'role_fit_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'на какую команду он лучше зайдет?',
    expectedIntent: 'role_fit_assessment',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'он умеет не только рисовать?',
    expectedIntent: 'decision_process',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'на чем вообще основан вывод про senior?',
    expectedIntent: 'evidence_request',
    expectedPresentationVariant: 'bullet_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'какой кейс лучше всего показывает мозги, а не пиксели?',
    expectedIntent: 'evidence_request',
    expectedPresentationVariant: 'bullet_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'где смотреть если мне важен research?',
    expectedIntent: 'evidence_request',
    expectedPresentationVariant: 'bullet_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'есть ощущение что он больше про execution, это так?',
    expectedIntent: 'risk_objection',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'если сравнивать с сильным senior, где у него зазор?',
    expectedIntent: 'risk_objection',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'куда его опасно сажать?',
    expectedIntent: 'risk_objection',
    expectedPresentationVariant: 'plain_text_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'почему его не отсеять после первого скрининга?',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'bullet_reply',
    expectedViewType: 'general_synthesis',
  },
  {
    input: 'что в нем не банально?',
    expectedIntent: 'strengths_assessment',
    expectedPresentationVariant: 'bullet_reply',
    expectedViewType: 'general_synthesis',
  },
];

export const batch3HiringLeadObjectionFixtures: IntentEvalFixture[] = [
  ...batch3ReleaseCoreFixtures,
  ...batch3ExploratoryFixtures,
];

export const intentEvalFixtures: IntentEvalFixture[] = [
  ...batch1CuratedFixtures,
  ...batch2DirtyRussianFixtures,
];
