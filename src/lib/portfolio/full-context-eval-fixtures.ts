export type FullContextEvalScenario = {
  id: string;
  split: 'working' | 'holdout';
  turns: string[];
  synthetic: true;
  expectedMeaning: string;
  allowedSources: string[];
  requiredCaveats: string[];
  forbiddenClaims: string[];
};

const workingQuestions = [
  'Какой у Андрея опыт?', 'Что он сделал в Альфа-Смарте?', 'Почему в SIEBEL сократилось время диалога?', 'Что не получилось в ChatPoint?', 'Какие ограничения были у семейной подписки?', 'Где видно личный вклад?', 'Какие исследования проводил?', 'Какие результаты измерены?', 'Что из опыта подходит для B2B?', 'Что из опыта подходит для финтеха?', 'Как он работал с командой?', 'Какие артефакты есть по Альфа-Смарту?', 'Сравни Альфа-Смарт и SIEBEL', 'Что проверять на интервью?', 'Какая роль была в MTS Digital?', 'Какой кейс показывает mobile?', 'Есть ли опыт web?', 'Почему mobile-first?', 'Какие риски в кейсе?', 'Что Андрей не делал лично?', 'Что подтверждено, а что вывод?', 'Какой опыт в enterprise?', 'Как он передавал решения в разработку?', 'Какие метрики не стоит приписывать лично?', 'Что было до релиза?', 'Какая публичная почта?', 'Сравни сложность сценариев', 'Что показывает UX/UI WannabeLike?', 'Где есть незапущенный проект?', 'Какой кейс открыть первым?', 'Почему нужна была проверка гипотез?', 'Что известно о сроках работы?', 'Какие компании в опыте?', 'Чем подтверждён дизайн-чек?', 'Какие пробелы в данных?', 'Почему нельзя назвать его готовым для любой роли?', 'Как обсуждать его seniority?', 'Какие компромиссы были в банке?', 'Что было целью подписки?', 'Какие сильные стороны видны без оценочных слов?', 'Почему приглашали участников по ссылке?', 'Что менялось в расходах держателей?', 'Что известно о багбаунти?', 'Какие вопросы задать про ChatPoint?', 'Какие кейсы имеют численные результаты?', 'Где есть исследовательская работа?', 'Какие решения связаны с монетизацией?', 'Что значит 1,1 млн рублей?', 'Что неизвестно о тестированиях?', 'Что доступно для связи?', 'Как описать его опыт рекрутеру?', 'В чём граница данных по зарплате?', 'Что видно о взаимодействии с разработкой?', 'Какой был outcome в MTS?', 'Что можно вывести о подходе?', 'Почему кейс не только про UI?', 'Что важнее: экран или сценарий?', 'Какие кейсы стоит сравнить для вакансии?', 'Какие данные подтверждены автором?', 'В каком месте нужно уточнение у Андрея?',
];
const holdoutSingles = [
  'Чем он сильнее обычного продуктового дизайнера?', 'Пока выглядит как мидл — почему не так?', 'Если сравнить с сильным senior, где зазор?', 'Что в нём не банально?', 'Как он понял, что проблему стоит решать?', 'Что бы он сделал иначе в Альфа-Смарте?', 'Как менялся подход от МТС к Positive?', 'Можно ли доверить критичный дедлайн?', 'Какая у него зарплата?', 'Какой у Андрея телефон?', 'Почему приглашали по телефону?', 'Какие выводы о роли можно сделать?', 'Что именно сделал не он?', 'Какие доказательства релиза?', 'Какой опыт релевантен моей вакансии?', 'Где у него был enterprise?', 'Какие результаты команды нельзя считать личными?', 'Что неизвестно про PMF ChatPoint?', 'Почему вы считаете этот кейс сильным?', 'А если в вакансии нужен research?', 'Как он работает с неопределённостью?', 'Сопоставь web и mobile опыт', 'Что нужно проверить на интервью?', 'Какой риск у подписочного сценария?', 'Можно ли увидеть артефакт?', 'Какие предположения здесь нельзя делать?', 'Что ответить лиду кратко?', 'Где его опыт не подтверждён?',
];
const holdoutDialogs = [
  ['Расскажи про Альфа-Смарт', 'Почему это важно?', 'Где это видно?'], ['Что было в SIEBEL?', 'А метрики?', 'А в другом кейсе?'], ['Что не так с ChatPoint?', 'Почему?', 'Что спросить на интервью?'], ['Есть ли B2B опыт?', 'А enterprise?', 'Какие доказательства?'], ['Какая роль у Андрея?', 'А что лично сделал?', 'Что осталось за рамками?'], ['Сравни два кейса', 'Почему такой вывод?', 'На чём он основан?'], ['Подходит ли он на роль?', 'Какие риски?', 'Что уточнить?'], ['Где есть research?', 'Что именно проверяли?', 'Что неизвестно?'], ['Что он делал в mobile?', 'А на web?', 'Какой trade-off?'], ['Что было с подпиской?', 'Что получилось?', 'А что не подтвердилось?'], ['Почему кейс сложный?', 'Как он решал?', 'Чем это доказано?'], ['Какой кейс открыть?', 'Почему?', 'А если мне нужен B2B?']];
const commonForbiddenClaims = [
  'invented biography, role, action or result',
  'metric attached to another project or unit',
  'vacancy text or previous assistant reply used as factual evidence',
];

function allowedSourcesFor(turns: string[]): string[] {
  const text = turns.join(' ').toLocaleLowerCase('ru-RU');
  const sources = new Set<string>();
  if (/альфа|подпис/.test(text)) sources.add('case:alfa-smart');
  if (/siebel|оператор|мтс/.test(text)) sources.add('case:siebel');
  if (/chatpoint|pmf|закрыл/.test(text)) sources.add('case:chatpoint');
  if (/расход|держател/.test(text)) sources.add('case:expenses-card-holders');
  if (/шеринг|приглаш|ссылк/.test(text)) sources.add('case:subscription-sharing');
  if (/wannabe|research|исслед|mobile|мобил/.test(text)) sources.add('case:ux-ui-wannabelike');
  if (/опыт|компан|роль|почт|телефон|зарплат|ваканс|senior|рекрутер/.test(text)) sources.add('profile');
  if (!sources.size || /сравн|кейс|доказ|результ|личн|андре/.test(text)) sources.add('portfolio:dossier');
  return [...sources];
}

function caveatsFor(turns: string[]): string[] {
  const text = turns.join(' ').toLocaleLowerCase('ru-RU');
  const caveats: string[] = [];
  if (/сделал бы иначе|можно ли доверить|подходит|senior|сильнее|вывод/.test(text)) caveats.push('separate inference from confirmed fact');
  if (/зарплат|телефон|неизвест|не подтвержд|пробел|что не/.test(text)) caveats.push('state the concrete missing data');
  if (/результ|метрик|эффект|выруч|подпис/.test(text)) caveats.push('separate personal contribution from team or product outcome');
  return caveats;
}

function scenario(id: string, split: FullContextEvalScenario['split'], turns: string[], expectedMeaning: string): FullContextEvalScenario {
  return {
    id,
    split,
    turns,
    synthetic: true,
    expectedMeaning,
    allowedSources: allowedSourcesFor(turns),
    requiredCaveats: caveatsFor(turns),
    forbiddenClaims: commonForbiddenClaims,
  };
}

export const fullContextEvalFixtures: FullContextEvalScenario[] = [
  ...workingQuestions.map((question, index) => scenario(`working-${index + 1}`, 'working', [question], 'Directly answer the question using only allowed dossier sources.')),
  ...holdoutSingles.map((question, index) => scenario(`holdout-single-${index + 1}`, 'holdout', [question], 'Give a direct supported answer or name the exact missing information.')),
  ...holdoutDialogs.map((turns, index) => scenario(`holdout-dialog-${index + 1}`, 'holdout', turns, 'Continue each follow-up within this dialogue and re-check every factual claim against the dossier.')),
];
