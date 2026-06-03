# Требования по доработке AI-логики

## Цель

Подключить в `ai-portfolio` рабочую AI-логику для свободных вопросов пользователя так, чтобы:

- ассистент отвечал не заглушками, а факт-ограниченным synthesis-ответом;
- ответы не ломали уже существующий intent-routing;
- состояние AI-ответа корректно восстанавливалось после reload, переключения контекста и закрытия modal;
- ответы опирались на реальные кейсы и не галлюцинировали.

Этот документ предполагает, что к моменту начала работ:

- все оставшиеся кейсы уже заполнены подходящими данными;
- summary / detail / context panel / artifacts по кейсам уже приведены в порядок;
- навигация по кейсам и контекстам уже работает стабильно.

## Ключевой вывод

Проблема не только в отсутствии `OPENAI_API_KEY`.

Сейчас в проекте уже существуют:

- `detectSynthesisTopic`
- `synthesizeGeneralAnswer`
- `buildGeneralSynthesisEnvelope`
- `lastSynthesis` в session state

Но synthesis-ветка не встроена в message pipeline, поэтому AI-логика по факту не работает.

## Что уже есть

### Реализовано

- fallback / model intent classification;
- safety-фильтрация;
- лимит в `20` пользовательских сообщений;
- progressive text / typewriter для `plain_text_reply` и `bullet_reply`;
- loading row на фронтенде во время запроса;
- synthesis prompt с жестким ограничением на выдумывание фактов.

### Не реализовано или реализовано неполно

- synthesis не вызывается из `resolveMessage`;
- `lastSynthesis` не сохраняется в session;
- `general_synthesis` не восстанавливается через `rebuildCurrentViewEnvelope`;
- bootstrap всегда возвращает `entry`, а не текущее состояние сессии;
- fallback synthesis без OpenAI не учитывает case-specific context;
- текущий план смешивает backend-задачи и UI polish, хотя это разные этапы.

## Scope первой AI-итерации

Первая итерация должна закрыть только логику ответа и восстановления состояния.

В scope входят:

- backend routing для synthesis-ответов;
- сохранение synthesis snapshot в session;
- восстановление AI-ответа после reload / close modal / возврата в контекст;
- ограничение ответов фактами из портфолио;
- тесты на новый pipeline.

В scope не входят:

- новые визуальные эффекты;
- переделка текущих authored ответов;
- расширение safety beyond текущей логики;
- изменение лимита сообщений;
- радикальная переработка контентной модели кейсов.

## Требования к реализации

### 1. Конфигурация окружения

#### 1.1. Обязательный ключ OpenAI

В `.env.local` должна быть добавлена переменная:

```env
OPENAI_API_KEY=...
```

Без этого ключа synthesis будет работать только через локальный fallback.

#### 1.2. Модель по умолчанию

`OPENAI_MODEL=gpt-4o-mini` можно указать явно, но это не блокер.

Сейчас в коде уже есть дефолт:

```ts
process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini'
```

Следовательно:

- отсутствие `OPENAI_MODEL` не ломает интеграцию;
- отсутствие `OPENAI_API_KEY` ломает реальную model-based synthesis.

### 2. Встраивание synthesis в backend pipeline

#### 2.1. Подключить synthesis в `resolveMessage`

Нужно импортировать в `src/lib/portfolio/engine.ts`:

- `detectSynthesisTopic`
- `synthesizeGeneralAnswer`
- `buildGeneralSynthesisEnvelope`

#### 2.2. Правильный порядок роутинга

Synthesis нельзя бездумно ставить самым первым шагом перед всей существующей классификацией.

Причина:

- часть вопросов уже правильно покрыта authored flows;
- если поставить synthesis раньше, он начнет перехватывать вопросы, которые сейчас корректно идут в curated `decision_process`, `strengths_assessment`, `role_fit_assessment` и другие ручные ветки.

Требование:

1. Сначала выполнить `safety`.
2. Затем увеличить счетчик сообщений и проверить `limit_reached`.
3. Затем прогнать deterministic classification.
4. Затем прогнать model classification.
5. Только если curated routing не дал уверенного результата, запускать synthesis fallback.

Допустимый альтернативный вариант:

- запускать synthesis раньше только для строго ограниченного набора вопросов, которые точно не должны попадать в authored flows.

Но базовое решение для первой итерации: synthesis как fallback, а не как главный маршрут.

#### 2.3. Сохранение результата synthesis

После успешного synthesis-ответа нужно:

- сохранить `lastSynthesis`;
- установить `currentView: 'general_synthesis'`;
- сохранить `recentHistory`;
- не сбрасывать `selectedContext`.

Ожидаемый результат:

- AI-ответ становится частью session state;
- система понимает, что текущий экран не `entry`, а `general_synthesis`.

### 3. Восстановление состояния

#### 3.1. Починить `rebuildCurrentViewEnvelope`

Для ветки:

```ts
case 'general_synthesis'
```

нужно возвращать:

- `buildGeneralSynthesisEnvelope(session, session.lastSynthesis)`, если `lastSynthesis` существует;
- fallback на `buildEntryEnvelope(session)`, только если snapshot реально отсутствует.

Иначе после закрытия modal или других локальных переходов AI-ответ теряется.

#### 3.2. Починить `resolveBootstrap`

`resolveBootstrap` не должен всегда возвращать `entry`.

Требование:

- bootstrap обязан восстанавливать envelope из текущего session state;
- если сессия находится в `general_synthesis`, bootstrap должен вернуть именно этот ответ;
- для остальных экранов bootstrap должен использовать уже существующую логику `rebuildCurrentViewEnvelope`.

### 4. Контекстность ответов

#### 4.1. Минимальное требование

Если пользователь находится внутри кейса, synthesis должен учитывать факты этого кейса.

Сейчас это частично заложено через:

```ts
const contextualFacts = session.selectedContext.kind === 'case'
  ? getContextualCaseFacts(session.selectedContext.id)
  : [];
```

Но это нужно проверить и закрепить тестами.

#### 4.2. Важное ограничение

Текущая реализация не изолирует кейс полностью. Она смешивает:

- topic-level facts;
- case-level facts.

Это значит, что ответ получается "общий с контекстом кейса", а не "строго только по текущему кейсу".

Для первой итерации допускается оставить именно такой режим, если он формализован явно:

- `case-aware synthesis`, а не `case-only synthesis`.

Если позже понадобится strict mode, его нужно проектировать отдельно.

#### 4.3. Fallback без OpenAI

Текущий fallback snapshot не использует case-specific facts.

Требование:

- либо документировать это как сознательное ограничение локального fallback;
- либо доработать fallback, чтобы он учитывал `selectedContext.kind === 'case'`.

Для первой итерации достаточно задокументированного ограничения, если основной режим предполагает наличие `OPENAI_API_KEY`.

### 5. Антигаллюцинационные ограничения

Системный prompt synthesis уже содержит правильное ограничение:

> Тебе нельзя придумывать кейсы, цифры, роли, процессы или выводы, которых нет во входных фактах.

Требование:

- сохранить это ограничение;
- не ослаблять его в угоду "красивым" ответам;
- не добавлять world knowledge и внешние источники в первую итерацию.

### 6. Safety и лимиты

#### 6.1. Safety

Текущую логику `safety.ts` нужно сохранить без расширения scope.

AI-synthesis не должен обходить:

- prompt-injection guardrails;
- private/salary restrictions;
- toxic-abuse handling.

#### 6.2. Limit

Лимит в `20` сообщений сохраняется.

После исчерпания лимита приоритет остается у `limit_reached`, а не у synthesis.

То есть:

- сначала limit;
- потом уже любые AI-ответы.

### 7. Frontend

#### 7.1. Что уже считать закрытым

Для первой AI-итерации не нужно перепроектировать:

- `PortfolioProgressiveText`;
- progressive reveal policy;
- loading row во thread view.

Это уже в достаточной степени подготовлено.

#### 7.2. Что проверить после интеграции backend

После включения synthesis нужно убедиться, что:

- `general_synthesis` с `plain_text_reply` рендерится через текущий progressive mode;
- `general_synthesis` с `bullet_reply` тоже рендерится корректно;
- во время запроса loading state не мигает и не ломает scroll / animation behavior.

## Тестовые требования

Без тестов интеграцию AI-логики считать незавершенной.

Минимальный набор:

### 1. Backend smoke / integration tests

Нужно добавить проверки на:

- synthesis fallback path для свободного вопроса;
- сохранение `lastSynthesis` в session;
- возврат `viewType: 'general_synthesis'`;
- восстановление synthesis через `rebuildCurrentViewEnvelope`;
- восстановление synthesis через `resolveBootstrap`.

### 2. Контекстные тесты

Нужно добавить тест на сценарий:

1. открыть кейс `siebel`;
2. задать свободный follow-up вопрос;
3. убедиться, что ответ идет в `general_synthesis`;
4. убедиться, что `selectedContext` остается `case:siebel`.

### 3. Регрессионные тесты на authored flows

Нужно доказать, что synthesis не сломал текущие curated маршруты.

Обязательные регрессионные сценарии:

- `Как он принимает решения?` не должен неожиданно уйти в synthesis, если должен остаться в `decision_process`;
- `Почему его стоит позвать?` не должен сломать `strengths_assessment`;
- `На какой он уровень?` не должен сломать `role_fit_assessment`.

### 4. Existing evals

После интеграции должны по-прежнему проходить:

- `npm run smoke`
- `npm run typecheck`
- `npm run eval:intents`
- `npm run eval:intents:objections:core`

## Критерии приемки

Работа считается завершенной только если выполнены все пункты:

1. Свободный вопрос, не покрытый curated routing, возвращает `general_synthesis`.
2. При активном кейсе synthesis сохраняет case-aware context.
3. `lastSynthesis` сохраняется в session.
4. После reload текущий AI-ответ восстанавливается.
5. После закрытия modal текущий AI-ответ не теряется.
6. Existing intent-evals не деградируют.
7. Safety и limit продолжают работать раньше synthesis.
8. При наличии `OPENAI_API_KEY` используется OpenAI synthesis.
9. При отсутствии `OPENAI_API_KEY` поведение остается предсказуемым и не ломает UX.

## Порядок реализации

### Этап 1. Backend

1. Подключить synthesis в `engine.ts` как fallback.
2. Сохранять `lastSynthesis`, `currentView` и history.
3. Починить `rebuildCurrentViewEnvelope`.
4. Починить `resolveBootstrap`.

### Этап 2. Tests

1. Добавить smoke/integration checks на synthesis.
2. Добавить case-context scenario.
3. Прогнать существующие eval scripts.

### Этап 3. Verification

1. Проверить free-form вопросы без явного case routing.
2. Проверить follow-up внутри `SIEBEL`.
3. Проверить reload.
4. Проверить close modal.
5. Проверить limit reached.

## Что не делать в первой итерации

- Не переписывать весь intent-layer.
- Не переносить authored ответы на LLM.
- Не делать synthesis главным маршрутом для всех вопросов.
- Не раздувать scope до RAG с внешним хранилищем, embeddings и retrieval pipeline.
- Не тратить время на дополнительный UI polish, пока backend integration не закрыта.

## Рабочее решение на потом

Когда все кейсы будут наполнены, следующий шаг:

1. Реализовать этот spec.
2. Прогнать smoke / typecheck / eval.
3. Проверить реальные сценарии в UI.
4. Только после этого обсуждать тонкую настройку phrasing, fallback quality и strict case-only mode.
