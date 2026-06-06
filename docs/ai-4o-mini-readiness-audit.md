# AI 4o-mini Readiness Audit

## Executive Signal

FACT. Продукт уже неплохо зацементирован как stateful portfolio assistant, но еще не готов к широкому режиму "AI-мозги отвечают на все". Сейчас это не LLM-first product, а deterministic UI state machine с authored replies и model-assisted classification. Источники: `README.md:3-5`, `README.md:95-128`, `src/lib/portfolio/engine.ts:223-285`, `src/lib/portfolio/presenters.ts:290-390`.

FACT. Главная ошибка, которую легко совершить сейчас: думать, что осталось "просто подключить gpt-4o-mini". Это неверно. Модель уже частично участвует в classification fallback, но synthesis pipeline как отдельный режим ответа до сих пор не встроен в routing и restore. Источники: `src/lib/portfolio/intent.ts:504-567`, `docs/ai-logic-requirements.md:18-29`, `docs/ai-logic-requirements.md:42-49`, `src/lib/portfolio/engine.ts:356-393`.

HYPOTHESIS. Если сейчас без дополнительных ограничений пустить 4o-mini в роль главного "мозга", продукт быстро деградирует: начнутся размытые ответы, потеря current thread-context, слабая доказательность по кейсам и расхождение между authored UX и model behavior.

## What The Product Actually Is Today

FACT. V1 продукт строго ограничен как desktop-only, Russian-only, 20 user messages per session, с явными safety states. Это не generic chat app. Источники: `README.md:26-32`.

FACT. API контракт построен не вокруг freeform prose, а вокруг `AssistantEnvelope` с explicit UI intent. Источники: `README.md:97-128`.

FACT. В backend уже зацементирована intent taxonomy для conversational vs navigation behavior:

- `assistant_intro`
- `identity_intro`
- `experience_overview`
- `case_discovery`
- `mobile_overview`
- `strengths_assessment`
- `role_fit_assessment`
- `decision_process`
- `evidence_request`
- `risk_objection`
- `missing_case_request`
- `ambiguous_question`
- `unsupported_request`
- `navigation_action`

Источники: `src/lib/portfolio/intent.ts:8-22`.

FACT. Продукт уже внедрил важное UX-правило: `Покажи / Расскажи / Что / Какие` трактуются как conversational intents, а `Открой / Перейди / Смотреть` как explicit navigation. Источники: `src/lib/portfolio/intent.ts:52-56`, `src/lib/portfolio/intent.ts:441-499`.

FACT. Для большинства частых вопросов уже есть authored responses и policy layer, который держит thread и routing под контролем. Источники: `src/lib/portfolio/engine.ts:223-285`, `src/lib/portfolio/presenters.ts:348-390`, `src/lib/portfolio/eval-fixtures.ts:12-145`.

## What 4o-mini Is Already Doing

FACT. `gpt-4o-mini` уже является default model в конфиге. Проблема не в модели, а в том, как и где она подключена. Источники: `README.md:28-31`, `src/lib/portfolio/config.ts:3-9`.

FACT. Сейчас модель используется только в двух ролях:

1. classification fallback через `classifyMessageWithModel`
2. потенциальная facts-constrained synthesis через `synthesizeGeneralAnswer`

Источники: `src/lib/portfolio/intent.ts:504-567`, `src/lib/portfolio/synthesis.ts:70-131`.

FACT. Classification path уже зрелый: если есть `OPENAI_API_KEY`, model fallback работает внутри зацементированной taxonomy, а не как отдельный "умный роутер". Источники: `README.md:50-53`, `src/lib/portfolio/intent.ts:412-567`.

FACT. Facts-constrained synthesis primitive уже есть, включая anti-hallucination prompt. Источники: `src/lib/portfolio/synthesis.ts:13-17`, `src/lib/portfolio/synthesis.ts:86-111`.

## What Is Missing Before Real AI Integration

### 1. Synthesis is not wired into the message pipeline

FACT. `resolveMessage` делает safety, limit, deterministic classification, model classification и потом падает в `ambiguous`. Synthesis path вообще не вызывается. Источник: `src/lib/portfolio/engine.ts:356-393`.

FACT. Это уже зафиксировано в handoff spec как центральный незакрытый пробел. Источник: `docs/ai-logic-requirements.md:42-49`.

### 2. Synthesis state is not restorable

FACT. `buildGeneralSynthesisEnvelope` существует и умеет строить `viewType: general_synthesis`, но `rebuildCurrentViewEnvelope` для `general_synthesis` возвращает `entry`. Источники: `src/lib/portfolio/presenters.ts:153-195`, `src/lib/portfolio/engine.ts:124-197`.

FACT. `resolveBootstrap` сейчас всегда возвращает `entry`, игнорируя session state. Источник: `src/lib/portfolio/engine.ts:287-289`.

FACT. Значит даже если synthesis завтра подключить, продукт будет терять AI-answer после reload и некоторых переходов. Это не косметика. Это базовая поломка user trust.

### 3. Fact base is too thin for broad free-question quality

FACT. Shared knowledge base очень маленькая и generic: всего четыре shared facts. Источник: `src/data/portfolio-facts.ts:13-18`.

FACT. Case-specific evidence есть только для `alfa-smart`, `siebel`, `chatpoint`. Источник: `src/data/portfolio-facts.ts:20-36`.

FACT. Topic configs покрывают всего пять synthesis topics:

- `strengths`
- `decision_making`
- `product_approach`
- `collaboration`
- `fit`

Источники: `src/data/portfolio-facts.ts:38-172`, `src/lib/portfolio/synthesis.ts:19-40`.

FACT. Значит broad "спроси что угодно про портфолио" пока не имеет достаточной factual основы. Модель будет либо повторять authored copy, либо работать на узком наборе facts.

### 4. Current authored layer is stronger than the future synthesis layer

FACT. Уже существуют curated guides для:

- `assistantProfile`
- `identityProfile`
- `careerSummary`
- `caseDiscovery`
- `mobileSummary`
- `strengthsMap`
- `roleFit`
- `decisionMakingPatterns`
- `evidenceIndex`
- `risksAndLimits`

Источники: `src/lib/portfolio/presenters.ts:348-390`, `src/lib/portfolio/presenters.ts:290-311`.

FACT. Эти guides уже выражают нужную продуктовую модель: краткий ответ в текущем чате + при необходимости явный CTA на переход.

HYPOTHESIS. Если попытаться сразу заменить это synthesis-ответами, ты ухудшишь UX, а не улучшишь. Сначала нужно встроить synthesis как controlled fallback, а не как replacement.

### 5. Persistence exists, but its realism is deceptive

FACT. Session-store умеет хранить `lastSynthesis`, `selectedContext`, `currentView`, `recentHistory`, но synthesis state сейчас логически не используется. Источники: `src/lib/portfolio/session-store.ts:18-32`, `docs/ai-logic-requirements.md:22-29`.

FACT. При проблемах с Supabase store silently падает в in-memory fallback. Источники: `src/lib/portfolio/session-store.ts:74-109`, `src/lib/portfolio/session-store.ts:119-129`.

HYPOTHESIS. Это удобно для локального MVP, но опасно для самообмана: можно думать, что restore/stability проверены, хотя production-like persistence path реально не валидирован под AI-synthesis.

### 6. Regression protection is aimed at routing, not synthesis

FACT. В проекте уже есть хорошие guards:

- `typecheck`
- `smoke`
- `verify:case-layout`
- `verify:intent-policy`
- `eval:intents`

Источники: `package.json:5-20`.

FACT. Но `smoke-test` проверяет только bootstrap, case open, contact modal, safety, assistant intro, limit, no-match. Он не трогает synthesis вообще. Источник: `scripts/smoke-test.ts:6-45`.

FACT. Это означает, что как только synthesis реально подключат, без нового test harness он станет новой слепой зоной.

## Decision Map: What 4o-mini Should And Should Not Do

### What 4o-mini should do in the next iteration

FACT. Безопасная следующая роль модели:

1. оставаться fallback classifier внутри текущей taxonomy
2. давать facts-constrained synthesis только тогда, когда curated routing не дал уверенного authored ответа

Источники: `docs/ai-logic-requirements.md:119-131`, `src/lib/portfolio/intent.ts:441-499`.

### What 4o-mini must not do yet

FACT. Нельзя сейчас давать модели право:

- менять thread
- решать, показывать ли right panel
- подменять authored case/experience navigation
- генерировать ответы вне известных portfolio facts

Источники: `README.md:5`, `src/lib/portfolio/engine.ts:223-285`, `src/lib/portfolio/presenters.ts:153-195`, `src/lib/portfolio/intent.ts:441-499`.

HYPOTHESIS. Если сделать иначе, ты разрушишь предсказуемость, которую уже тяжело и дорого собрали в UI/state machine.

## Brutal Assessment

FACT. Ты ближе к хорошему deterministic hiring assistant, чем к реальному AI portfolio builder.

FACT. Это не плохо. Плохо было бы лгать себе и говорить, что "осталось только вставить API key".

FACT. На текущем этапе продукт готов к узкой AI-интеграции, но не готов к широкому "пусть 4o-mini отвечает за все":

- routing уже зрелый
- reply policy уже зрелая
- authored guides уже зрелые
- synthesis path не встроен
- synthesis restore сломан
- fact base узкий
- synthesis tests отсутствуют

## What Must Be Built Before Saying "4o-mini Is Integrated"

### Now

1. FACT. Встроить synthesis fallback в `resolveMessage` после deterministic + model classification, а не раньше. Источники: `docs/ai-logic-requirements.md:121-131`, `src/lib/portfolio/engine.ts:356-393`.
2. FACT. Сохранять `lastSynthesis` и выставлять `currentView: general_synthesis`. Источник: `docs/ai-logic-requirements.md:133-145`.
3. FACT. Починить `rebuildCurrentViewEnvelope` и `resolveBootstrap` для `general_synthesis`. Источники: `docs/ai-logic-requirements.md:149-172`, `src/lib/portfolio/engine.ts:124-197`, `src/lib/portfolio/engine.ts:287-289`.
4. FACT. Добавить synthesis-specific smoke/eval checks. Источники: `scripts/smoke-test.ts:6-45`, `package.json:11-18`.

### Next

1. FACT. Расширить factual base beyond `alfa-smart`, `siebel`, `chatpoint`. Источник: `src/data/portfolio-facts.ts:20-36`.
2. HYPOTHESIS. Добавить еще 3-5 synthesis topics только после того, как будет понятно, какие свободные вопросы реально задают пользователи.
3. FACT. Явно различать:
   - curated answer
   - facts-constrained synthesis
   - unsupported/fallback refusal

### Later

1. HYPOTHESIS. Строить настоящий interview-to-portfolio workflow для других пользователей.
2. HYPOTHESIS. Делать structured fact extraction из свободных ответов.
3. HYPOTHESIS. Подключать multi-step orchestration и richer personalization.

Это later, а не now.

## Missing Artifacts

UNKNOWN. Нет synthesis-specific regression matrix по сценариям:

- synthesis from entry
- synthesis inside current case
- reload restore of `general_synthesis`
- close modal while in synthesis
- limit reached after prior synthesis

UNKNOWN. Нет evidence, что current facts are sufficient for mobile questions beyond authored guides.

UNKNOWN. Нет product rule document, какой процент запросов должен оставаться authored, а какой допустимо отдавать synthesis.

## Recommendation

FACT. Правильный первый шаг не "подключить AI мозги", а "подключить узкий facts-constrained synthesis fallback без разрушения deterministic UX".

FACT. Если ты начнешь шире, чем это, ты не ускоришь продукт. Ты просто заменишь предсказуемую систему на дорогой шум.

HYPOTHESIS. Лучшее следующее решение:

1. реализовать spec из `docs/ai-logic-requirements.md`
2. добавить synthesis test harness
3. прогнать ручной QA на `entry`, `alfa-smart`, `chatpoint`
4. только после этого открывать следующий разговор про "AI brains"

Это и есть взрослая интеграция, а не демо с красивым самообманом.
