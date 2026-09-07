# Product / data audit: AI-ассистент портфолио

Дата аудита: 2026-09-05  
Область: backend, маршрутизация вопросов, факты, генерация ответов, сессии, eval и ценность для нанимающего лида.

## Executive signal

- **[FACT] Текущее решение — не открытый ассистент по знаниям портфолио.** Это конечная онтология из 28 `QuestionSubject`, 15 `AnswerType`, четырёх scope и набора заранее написанных fallback-ответов. До неё вопрос проходит через 137 regex-проверок в `intent.ts`, `query-interpretation.ts` и `synthesis.ts`. Источники: `src/lib/portfolio/types.ts:82-147`, `src/lib/portfolio/intent.ts:31-57`, подсчёт по репозиторию от 2026-09-05.
- **[FACT] Модель не ищет доказательства по всей базе знаний.** Сервер сначала выбирает тему или facet, затем передаёт модели заранее собранный массив фактов. Embeddings, vector search и semantic retrieval в проекте отсутствуют. Источники: `src/data/portfolio-facts.ts:5-14,28-44,489-495`, `src/lib/portfolio/synthesis.ts:813-836`.
- **[FACT] Детерминированные правила имеют приоритет над семантической моделью.** Semantic router вызывается в active-режиме только если regex-классификатор вернул `null`; следовательно, модель не может исправить уверенную, но неверную regex-классификацию. Источник: `src/lib/portfolio/engine.ts:714-747`.
- **[FACT] Более свободный semantic router и проверяемая grounded-генерация выключены по умолчанию.** Значения по умолчанию — `off` и `legacy`; локально на момент аудита настроены `AI_MODE=live`, `AI_SEMANTIC_ROUTER_MODE=shadow`, `AI_GROUNDED_OUTPUT_MODE=legacy`. Shadow не влияет на видимый ответ и принудительно отключается в production. Production-конфигурация Vercel не проверена. Источники: `src/lib/portfolio/config.ts:8-45`, `docs/specs/rfcs/0002-openai-semantic-grounded-synthesis.md:3-25`.
- **[HYPOTHESIS] Для подготовленной демонстрации ассистент выглядит сильным, а для свободного интервью нанимающего лида — хрупким.** Он хорошо отвечает на формулировки, которые уже представлены в правилах и fixtures, но теряет смысл на новых способах задать тот же вопрос.
- **[UNKNOWN] Нет данных, что реальные нанимающие лиды вообще пользуются Q&A, задают второй вопрос или после ответа чаще открывают CV/контакты.** В репозитории нет продуктовой аналитики этого funnel и нет корпуса реальных вопросов. Сам `TASK_BRIEF` ранее фиксировал это как риск и предлагал проверку на пяти hiring managers: `docs/design/TASK_BRIEF.md:94,106,118`.

**Вердикт:** пользовательская проблема сформулирована верно. Дальнейшее расширение regex и готовых ответов — тупиковая инвестиция. Оно повышает результат на собственных fixtures, но не способность понимать новые вопросы. Нужен переход от «вопрос → шаблон» к «вопрос → релевантные атомарные факты → проверяемый ответ».

## Что продукт фактически делает сейчас

1. **[FACT]** API принимает свободный `sessionId` и сообщение: `src/app/api/chat/route.ts:28-47`.
2. **[FACT]** Safety, благодарность, лимит и trust challenge обрабатываются до AI: `src/lib/portfolio/engine.ts:674-712`.
3. **[FACT]** Большое дерево regex пытается назначить intent: `src/lib/portfolio/intent.ts:159-866`.
4. **[FACT]** Если правило не сработало, legacy classifier или semantic router выбирает только одно из конечного списка значений: `src/lib/portfolio/intent.ts:31-57,1057-1164`.
5. **[FACT]** `interpretQuery` повторно прогоняет текст через cue/regex-логику и назначает scope, subject, answer type, topic и facet: `src/lib/portfolio/query-interpretation.ts:1300-1503`.
6. **[FACT]** По назначенной категории выбирается готовый набор фактов и fallback-копирайт; live-модель может переформулировать только этот материал: `src/lib/portfolio/synthesis.ts:607-810,813-1034`.
7. **[FACT]** В legacy-режиме не проводится post-generation проверка ссылок на факты. Проверка fact IDs, чужих кейсов и чисел действует только в v2: `src/lib/portfolio/synthesis.ts:829-839,1037-1115`, `src/lib/portfolio/grounding.ts:87-140`.

Это не плохая архитектура для безопасного prototype. Это плохая архитектура для обещания «спросите что угодно о кандидате».

## Проверка покрытия

2026-09-05 выполнен изолированный прогон существующих fixtures в `fallback/off/legacy`, без сетевых вызовов:

| Набор | Результат | Что это реально доказывает |
|---|---:|---|
| Curated | 37/41, 90% | Работают заранее предусмотренные формулировки |
| Dirty Russian | 41/41, 100% | Работают подготовленные опечатки и разговорные варианты |
| Objection core | 9/10, 90% | Основные заранее выбранные возражения покрыты |
| Objection exploratory tail | 9/14, 64% | Это 14 fallback-проверок классификации, а не оценка production-ассистента; за пределами ядра покрытие быстро деградирует |

**[FACT]** Среди непокрытых формулировок уже есть естественные вопросы лида: «чем он сильнее обычного продуктового дизайнера?», «пока выглядит как нормальный мидл, почему это не так?», «если сравнивать с сильным senior, где у него зазор?», «что в нём не банально?». Источник: `src/lib/portfolio/eval-fixtures.ts`, локальный прогон 2026-09-05.

**[FACT]** Дополнительные новые вопросы показали ошибки не только intent, но и смысла ответа:

- «Как Андрей понял, что проблему действительно стоит решать?» не получил классификацию и не получил `AnswerType`;
- «Что он бы сделал иначе, если бы начинал Альфа-Смарт заново?» превратился в обычный `case_summary`, хотя пользователь спрашивал о ретроспективе;
- «Как менялся его подход от МТС к Positive Technologies?» был сведён к общему `decision_breakdown`, без специальной поддержки сравнения во времени.

**[HYPOTHESIS]** Реальное покрытие будет ниже, чем результаты curated fixtures: набор создан той же командой, которая писала regex, и не является независимой выборкой речи нанимающих лидов.

## Главные bottlenecks

### P0. Смысл ограничен онтологией, а не фактами

- **[FACT]** Даже semantic router обязан выбрать один из 18 intent и 28 subject; нового типа вопроса для него не существует: `src/lib/portfolio/intent.ts:31-57`.
- **[FACT]** `resolveIntentClassification` требует заранее определённые `answerType/topic/factFacet`; иначе возвращает clarification/context-required вместо попытки ответить по доступным данным: `src/lib/portfolio/engine.ts:297-338,472-603`.
- **[HYPOTHESIS]** Добавление новых intent будет бесконечной гонкой за формулировками и увеличит количество конфликтов между правилами.

### P0. Нет настоящего retrieval

- **[FACT]** `getPortfolioFacts(topic)` возвращает статический массив. Case answer получает статический facet config. Поиска по вопросу нет: `src/data/portfolio-facts.ts:489-495`, `src/lib/portfolio/synthesis.ts:1404-1493`.
- **[FACT]** Термин `retrievedChunksCount` в telemetry вводит в заблуждение: это количество уже выбранных статических фактов, а не результат retrieval: `src/lib/portfolio/synthesis.ts:976-997,1056-1068`.
- **[HYPOTHESIS]** Для шести кейсов vector database пока не нужна. Весь нормализованный набор атомарных фактов можно дешёво ранжировать моделью или embeddings in-memory; Supabase pgvector имеет смысл только после роста корпуса.

### P0. Grounded v2 содержит скрытую ошибку отбора

- **[FACT]** `buildCaseGroundedFacts` складывает весь fact pack в фиксированном порядке, после чего synthesis берёт первые 15 записей независимо от вопроса: `src/lib/portfolio/grounding.ts:21-47`, `src/lib/portfolio/synthesis.ts:1043-1052`.
- **[FACT]** В фактическом прогоне все case packs содержат 30-58 фактов. В первые 15 у всех кейсов входят overview/problem/role/research; facets `outcomes`, `risks`, `evidence` туда не попадают. Поэтому включение v2 может ухудшить ответы именно на вопросы о результате, слабых местах и доказательствах.

### P0. Нет независимого feedback loop

- **[FACT]** Production telemetry намеренно не хранит текст вопроса и регистрирует только технические метаданные: `src/lib/portfolio/logger.ts:174-210`.
- **[FACT]** В интерфейсе/API не найдено события helpful/not helpful, question-to-contact funnel или answer fallback rate в продуктовой аналитике.
- **[FACT]** При этом `recentHistory` сохраняет первые 120 символов пользовательского сообщения в session payload, до 12 записей: `src/lib/portfolio/engine.ts:700-704`, `src/lib/portfolio/session-store.ts:262-263`. Это создаёт странный компромисс: сырые фрагменты уже хранятся в Supabase, но не используются как контролируемый набор улучшения качества.
- **[HYPOTHESIS]** Без opt-in сбора обезличенных вопросов команда будет продолжать проектировать диалог по собственному воображению.

### P1. Контекст диалога слишком бедный

- **[FACT]** Router видит только текущее сообщение и label выбранного контекста; `historyChars=0`: `src/lib/portfolio/intent.ts:83-121`.
- **[FACT]** Synthesis видит только последний вопрос, последний `QuestionSubject` и 280-символьный preview ответа, а не несколько полных turns: `src/lib/portfolio/synthesis.ts:917-920,1489-1492`.
- **[HYPOTHESIS]** Follow-up вроде «а где это видно?», «почему?», «что бы он сделал иначе?» будет работать только для специально предусмотренных анафор, а не как настоящий диалог.

### P1. Лимит расходов обходится

- **[FACT]** Лимит 20 сообщений привязан к session: `src/lib/portfolio/config.ts:1`, `src/lib/portfolio/engine.ts:700-707`.
- **[FACT]** API принимает любой непустой `sessionId`, без max length, подписи, IP/device rate limit или bot protection: `src/app/api/chat/route.ts:28-47`, `src/lib/portfolio/session-store.ts:235-245`.
- **[HYPOTHESIS]** Публичный endpoint можно использовать для генерации неограниченного числа новых сессий и расходования AI-бюджета. До публичного трафика нужны внешний rate limit и bounded input schema.

### P1. Eval не герметичен

- **[FACT]** `scripts/eval-intents.ts` безусловно перезаписывает process env значениями из `.env.local`: строки 4-16. Поэтому команда `AI_MODE=fallback npm run eval:intents` всё равно запускала live OpenAI calls; прогон пришлось остановить.
- **[HYPOTHESIS]** Такой eval сложно безопасно запускать в CI и легко случайно сделать платным или недетерминированным.

## Насколько это работает для нанимающего лида

### Что уже ценно

- **[FACT]** Сервер не даёт модели менять UI/state и держит явный scope кейса: `docs/specs/rfcs/0002-openai-semantic-grounded-synthesis.md:27-35`.
- **[FACT]** Факты по кейсам структурированы по роли, решениям, ограничениям, результатам и доказательствам: `src/data/portfolio-case-facts.ts:24-75` и далее.
- **[FACT]** Для неподтверждённых сроков и метрик есть calibrated unknown/fallback, а не выдуманная уверенность: `src/lib/portfolio/synthesis.ts:699-715,1443-1454`.
- **[HYPOTHESIS]** Это уже полезный второй слой после чтения кейса, особенно для типовых вопросов о роли, метриках и процессе.

### Где обещание ломается

- **[HYPOTHESIS]** Лид ожидает, что чат поймёт намерение, сравнит кейсы, разберёт trade-off и честно отделит факт от вывода. Текущая система ожидает, что лид угадает одну из заранее предусмотренных категорий.
- **[HYPOTHESIS]** Повторяющийся fallback-копирайт быстро выдаёт механику и снижает доверие: пользователь понимает, что общается с интерактивным FAQ, а не с аналитиком портфолио.
- **[UNKNOWN]** Не измерено, помогает ли ассистент принять решение об интервью быстрее или только добавляет любопытный интерфейсный слой.

## Целевая архитектура

Принцип: **свободу дать пониманию вопроса и композиции ответа; ограничения оставить только на фактах, scope, безопасности и действиях.**

### 1. Evidence store вместо Q&A-template store

Каждый факт хранить атомарно:

```ts
type EvidenceFact = {
  id: string;
  caseId?: string;
  company?: string;
  period?: string;
  facet: 'role' | 'problem' | 'decision' | 'constraint' | 'research' | 'outcome' | 'risk' | 'artifact';
  claim: string;
  evidenceUrl?: string;
  confidence: 'confirmed' | 'inferred' | 'missing';
  numericTokens?: string[];
};
```

Готовые ответы оставить только для safety, session limit, service states и деградации при отказе модели.

### 2. Semantic-first для информационных вопросов

- Детерминированно обрабатывать только safety, UI actions, благодарность, лимит и явно названный кейс.
- Все информационные вопросы отдавать одному semantic interpreter, который возвращает: `normalizedQuestion`, `scope`, `candidateCaseIds`, `facets`, `answerability`, `needsClarification`.
- Regex оставить как fallback при timeout, но не как первичный интеллект.

### 3. Retrieval по смыслу вопроса

- Для текущих ~200-300 атомарных фактов начать без отдельной vector DB: embeddings/in-memory ranking или один bounded model rerank.
- Фильтровать сначала по разрешённому scope, затем ранжировать по смыслу; выбирать 6-10 фактов, а не первые 15.
- Для сравнительных вопросов разрешать несколько case IDs и требовать факт для каждой стороны сравнения.

### 4. Grounded answer с прозрачной границей знания

Ответ должен иметь три режима:

- `supported`: прямой ответ + cited fact IDs;
- `partially_supported`: что подтверждено + что является выводом;
- `unknown`: данных нет + один полезный вопрос Андрею на интервью.

Проверять все новые числа, case scope и fact IDs. Не требовать заранее угаданный `AnswerType`, если релевантные факты уже найдены.

### 5. Реальный conversation memory

Передавать последние 4-6 turns или структурированную память: `lastEntity`, `lastClaim`, `lastCaseIds`, `lastFacet`, `unresolvedQuestion`. Это позволит понимать «а почему?», «а в другом кейсе?», «что бы он изменил?» без отдельных regex.

### 6. Защита публичного endpoint

- max длина `sessionId` и message в Zod;
- серверный signed/issued session ID вместо доверия клиентскому ID;
- rate limit по IP + session/device;
- лимит tokens/cost/day и circuit breaker;
- TTL/cleanup для Supabase sessions;
- CAPTCHA/Turnstile только после подозрительного поведения, не на первом вопросе.

## Приоритеты

### Now — доказать ценность и убрать архитектурный тупик

1. Провести 5-8 коротких тестов с реальными дизайн-лидами/нанимающими менеджерами. Не подсказывать формулировки. Собрать вопросы, ответ ассистента, оценку полезности и решение «позвал бы на интервью / чего не хватило».
2. Добавить opt-in feedback: `Полезно / Не помогло`, категорию fallback и privacy-safe question ID. Сырой текст хранить только при явном согласии и с retention policy.
3. Исправить eval, чтобы `.env.local` не перезаписывал явно заданные env vars.
4. Добавить input bounds и rate limiting до расширения live AI.
5. Не писать новые regex, кроме критических safety/navigation bugs.

### Next — один вертикальный срез semantic retrieval

1. Нормализовать существующие case fact packs в `EvidenceFact` без переписывания UI/API envelope.
2. Реализовать semantic-first interpreter и retrieval для трёх наиболее ценных классов: сравнение кейсов, trade-offs/решения, пробелы/риски.
3. Включить grounded validation после исправления facet-aware retrieval.
4. Собрать независимый eval минимум из 100 реальных и синтетически не подсказанных перефразировок; разделить train/dev/test.

### Later — только после подтверждённого использования

1. pgvector/Supabase embeddings при росте корпуса или нескольких портфолио.
2. Более длинная conversation memory.
3. Автоматическое пополнение evidence store из новых кейсов с ручным approval.

## Метрики решения

Минимальный dashboard для нанимающего funnel:

- доля посетителей кейса, задавших вопрос;
- доля ответов `supported / partial / unknown / clarification / fallback`;
- helpful rate;
- second-question rate;
- CV/contact conversion после Q&A против посетителей без Q&A;
- p50/p95 latency, timeout и model fallback rate;
- cost per engaged visitor;
- factual validation failure rate;
- coverage на независимом holdout-корпусе.

Не оптимизировать только intent accuracy. Главные качества: **полезность для решения о найме, factual precision, корректное признание пробелов и способность выдержать новый способ задать вопрос.**

## Missing artifacts / unknowns

- **[UNKNOWN]** Реальные значения AI flags в Vercel Production.
- **[UNKNOWN]** Production volume, OpenAI cost, p95 latency и fallback rate.
- **[UNKNOWN]** Список реальных вопросов нанимающих лидов.
- **[UNKNOWN]** Q&A-to-contact/CV conversion.
- **[UNKNOWN]** Retention policy и consent для фрагментов вопросов в Supabase sessions.
- **[MISSING]** Независимый holdout eval, не использованный при написании правил.
- **[MISSING]** Rate limiting/cost circuit breaker.
- **[MISSING]** Facet-aware semantic retriever.
- **[MISSING]** Product analytics и answer feedback.

## Источники и confidence

- Репозиторий и локальная конфигурация worktree, проверены 2026-09-05 — **high confidence**.
- Custom fallback eval существующих fixtures, 2026-09-05 — **high confidence для текущих fixtures, low confidence для реального трафика**.
- Поведение нанимающих лидов и влияние на найм — **unknown до пользовательских тестов и production analytics**.
