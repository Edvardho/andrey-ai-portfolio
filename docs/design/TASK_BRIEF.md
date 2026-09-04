# Task Brief — Conversational Portfolio Builder

## Problem

### Product thesis

Помочь специалисту превратить разрозненный опыт работы в доказуемое, понятное нанимающему человеку портфолио через структурированное интервью в чате.

### Why now

- **FACT:** текущий AI-портфолио Андрея уже доказывает, что структурированные факты + чат могут объяснять кейс и отвечать на вопросы по нему.
- **HYPOTHESIS:** у специалистов есть материал и опыт, но нет структуры, времени или навыка, чтобы оформить его как убедительное портфолио.
- **UNKNOWN:** готовы ли они проходить интервью с AI и считать финальный результат достаточным для публикации/отправки работодателю.

## Users And Context

- **Primary user (v1):** product designer / product manager с 2–8 годами опыта и 2–5 проектами, который готовится к поиску работы.
- **Secondary user:** карьерный консультант или hiring manager, который оценивает итоговое портфолио.
- **Later expansion:** аналитики, разработчики, маркетологи и другие профессии — только после подтверждения ядра сценария.
- **Usage context:** пользователь приходит с хаотичными воспоминаниями, скриншотами, ссылками и частично конфиденциальными данными; у него нет готовых кейсов.

## Goals

1. Провести человека через интервью и извлечь конкретные, проверяемые утверждения: контекст, задача, роль, решение, доказательства, ограничения, результат.
2. Показать в процессе, чего не хватает для убедительного кейса, вместо того чтобы генерировать гладкий текст из пустоты.
3. Собрать редактируемый published-портфолио-результат: профиль + 2–3 кейса + ссылки/контакт.
4. Позволить читателю итогового портфолио быстро понять ценность кандидата и задать уточняющий вопрос по подтвержденным материалам.

## Non-goals

- Не строить универсального «AI-рекрутера для любой профессии» в v1.
- Не обещать автоматическое трудоустройство, оценку зарплаты или прогноз карьерного успеха.
- Не подменять фактчекинг красивой генерацией текста.
- Не делать чат единственным интерфейсом: пользователь должен видеть извлеченные факты, пробелы и черновик результата.
- Не принимать/публиковать чувствительные данные работодателя без явного подтверждения пользователя.

## Constraints

- Existing foundation: Next.js/Vercel, Supabase session storage, bounded OpenAI assistant and fact-constrained answer pipeline.
- Existing data model is authored for one candidate and шести кейсов; он не является multi-tenant schema.
- В production нельзя тихо деградировать с Supabase на память: session-store error остаётся retryable `503`.
- Передача клиентских данных в модель и публикация материалов должны иметь явный opt-in и понятное удаление.
- Не начинать с «любая профессия»: разные профессии требуют разных evidence-моделей.

## Requirements

### v1 product wedge

**AI case-interviewer for product designers and product managers.**

Не «создай портфолио по промпту», а «помоги вспомнить, проверить и оформить сильные кейсы». Для v1 использовать общую evidence-модель:

1. Контекст и пользователь/бизнес-проблема.
2. Личная зона ответственности.
3. Исследование и решения.
4. Артефакты / ссылки / допустимые скриншоты.
5. Результаты и границы доказательств.
6. Что можно публиковать и что нужно обезличить.

### Core flow

1. Пользователь выбирает роль и цель: поиск работы, подготовка к интервью, обновление портфолио.
2. Чат начинает интервью с одного проекта, но после каждого блока обновляет видимую карту фактов.
3. Система маркирует факт как `provided`, `needs_evidence`, `sensitive`, `missing` — не выдумывает пропуски.
4. Пользователь проверяет/редактирует черновик и добавляет доказательства.
5. Генерируется приватная preview-страница; публикация возможна только после ручного подтверждения.
6. Портфолио-читатель видит краткий обычный кейс первым; AI Q&A — опциональный второй слой.

### Critical product rule

**Чат — механизм сбора материала, а не сам продуктовый результат.**
Если после 5–7 минут пользователь не видит карту извлечённых фактов и конкретную ценность, он бросит сценарий.

## State Inventory

- **Landing / role selection:** объясняет, какой результат будет создан и какие данные потребуются.
- **Empty interview:** нет проектов, есть пример вопроса и возможность импортировать текст/ссылку.
- **Active interview:** текущий вопрос, прогресс по evidence-модели, возможность пропустить/вернуться.
- **Fact review:** extracted facts, confidence/source, `missing`, `needs_evidence`, `sensitive`.
- **Insufficient evidence:** честный список того, чего не хватает; нет кнопки «придумать».
- **Draft generation:** генерация черновика с отображением использованных фактов.
- **Draft editing:** пользователь правит текст и подтверждает публикуемые цифры/формулировки.
- **Privacy review:** скрыть NDA-детали, обезличить компании/метрики, удалить вложения.
- **Preview:** приватная ссылка с ordinary portfolio reading flow.
- **Publish:** подтверждение видимости и контактов.
- **AI unavailable:** сохраняем ответы локально/в сессии, показываем retry без потери интервью.
- **Session restore:** reload возвращает в тот же проект и этап интервью.
- **Delete/export:** удалить аккаунт/данные или экспортировать материалы.

## Risks And Unknowns

| Risk / unknown | Why it matters | Validation before build |
| --- | --- | --- |
| Нанимающие не будут использовать Q&A | AI-слой может не давать ценности читателю | 5 hiring managers: дать обычный кейс и Q&A, спросить, что реально помогло |
| Пользователь не помнит деталей/метрик | Нельзя делать убедительный портфолио из общих слов | 5 кандидатов: пройти интервью, измерить долю заполненных evidence-полей |
| Конфиденциальность блокирует загрузку артефактов | Это частый стоп-фактор | Проверить, достаточно ли обезличенного режима и текстовых доказательств |
| Слишком широкий ICP | Размывает вопросы, шаблон результата и ценность | Стартовать только с product designer/PM и сравнить результаты |
| Chat-only fatigue | Пользователь не видит прогресса и бросает | Прототип с visible fact map, completion and drop-off interview |
| Генерация звучит правдоподобно, но недостоверно | Подрывает доверие и может навредить кандидату | Использовать only-user-provided facts + review gate before publish |

## Success Metrics

### Discovery gate — before a full build

- 5 кандидатов проходят 20–30-минутное прототипное интервью.
- 5 нанимающих менеджеров/лидов смотрят итог и называют минимум один полезный сигнал, которого не было бы в обычном резюме.
- Не менее 3 из 5 кандидатов готовы поделиться preview-портфолио или продолжить до публикации.

### v1 outcome metrics

- ≥60% начавших интервью создают черновик первого кейса.
- ≥40% черновиков доходят до ручного review, а не публикуются автоматически.
- ≥30% пользователей добавляют хотя бы одно доказательство/артефакт.
- 0 неподтвержденных чисел или фактов в published output на ручной QA-выборке.

## Recommended Next Actions

1. Не писать multi-tenant платформу. Сначала провести 5 интервью с кандидатами и 5 с нанимающими людьми.
2. Проверить самый рискованный вопрос: нужен ли пользователю AI-диалог для создания кейса, или ему нужна хорошая структурированная форма с AI-подсказками.
3. Сделать clickable prototype одного сценария: «из сырого рассказа о проекте → карта фактов → один черновик кейса».
4. Только если интервью подтверждают ценность, спроектировать multi-tenant data model, consent/privacy model и редактор кейсов.

## Immediate Published-Portfolio Correction

### Resolved implementation decisions — 2026-08-31

- The AI assistant is intentionally removed from the homepage. This is not a missing state and must not be replaced with another AI entry point during the homepage iteration.
- The current implementation scope is the homepage only. Mobile case detail and mobile assistant/workspace states exist as a later design iteration and are out of scope for this pass.
- At `375x812`, the contact CTA is fixed to the viewport bottom and remains in place while the page scrolls. The page content must include bottom clearance so the CTA does not cover the final card or footer.
- Desktop project cards use the supplied `fan -> row` interaction. Mobile project cards do not animate between fan and row states; they remain a horizontal touch-scroll rail.
- Onest is the canonical typography for this implementation. Keep its global setup unchanged; the Figma text metrics are adapted to Onest rather than triggering a font migration across case/workspace screens.
- The supplied portrait is the source asset for the homepage avatar. Use a real image crop; do not redraw or generate a replacement.
- CV download remains visually present but the final file/href will be provided after the new homepage is built. Until then it must have an explicit temporary disabled/not-wired state in development, not a fake download.
- The Alfa-Smart homepage result uses the corrected `1 month` period.

### Scope boundary for this iteration

- In scope: responsive desktop/mobile homepage, header, profile hero, experience timeline, project rail, desktop card animation, fixed mobile CTA, footer, contact interaction, and existing project identifiers/navigation hooks.
- Out of scope: mobile case layouts, mobile assistant workspace, backend/API behavior, CV document content, and redesign of existing desktop case/chat screens.

### Problem

- **FACT:** внешний лид не понял, где на портфолио найти базовый профессиональный сигнал: места работы и общий опыт.
- **FACT:** блок «Опыт работы» сейчас конкурирует с кейсами в левой навигации и визуально читается поздно.
- **HYPOTHESIS:** AI-ассистент воспринимается как лишний барьер, когда базовая информация о кандидате не находится в первые 10 секунд.

### Goal

Сделать главную страницу обычным, быстрым способом понять кандидата. AI Q&A остаётся вторым слоем только внутри открытого кейса.

### Homepage requirements

1. Под именем на первом экране показать короткий professional snapshot:
   - `Product Designer · 5+ лет опыта`;
   - `МТС Digital · Альфа-Банк · Positive Technologies`;
   - город / формат работы, только если Андрей готов это публично показать;
   - одна строка специализации: `Сложные B2B/B2C-сценарии: исследование, UX/UI, продуктовая логика и запуск`.
2. В шапке на каждой странице показать два независимых действия: `Скачать CV` и `Написать Андрею`. Обе ссылки должны работать без авторизации, VPN и внешних облачных дисков.
3. На главной показать компактный блок «Опыт работы» до основного контента кейсов. Он отвечает на вопрос «где и в какой роли работал Андрей», не дублируя все детали резюме.
4. Сохранить левый каталог кейсов: обратная связь подтверждает, что он удобен для просмотра и сравнения нескольких работ. Не заменять его блоком опыта.
5. В основной зоне главной показать «Избранные кейсы» (2–3 приоритетные работы); полный каталог по-прежнему доступен в левой навигации.
6. Убрать AI-ассистента и его entry point с главной страницы. Внутри кейса оставить как явно вторичный блок с нейтральной подписью «Уточнить по кейсу».
7. Показать отдельный компактный блок «Дополнительно» только если есть материалы, усиливающие образ кандидата: AI-пет-проект, работа с нейросетями, концепты / визуальные эксперименты. Он не должен конкурировать с опытом и продуктовыми кейсами.

### Target information hierarchy

1. Кто это и какую роль ищет.
2. Где работал и в каких типах продуктов.
3. Как связаться и где скачать CV.
4. Какие 2–3 кейса стоит открыть первыми.
5. Остальные кейсы — для сравнения и углубления.
6. AI Q&A — только после того, как человек уже читает конкретный кейс.

### Main-page layout requirements

#### Header

- Имя и роль не должны быть единственным способом идентифицировать кандидата: рядом нужен короткий professional snapshot.
- `Скачать CV` — самостоятельная заметная CTA, ведущая на статичный PDF из домена проекта; нельзя использовать Google Drive, Яндекс Диск, Notion или ресурс с доступом по приглашению.
- `Написать Андрею` — ведёт на проверенный Telegram/почту; внешняя ссылка открывается в новой вкладке или нативном приложении.
- На мобильном CTA не должна исчезать: допустим компактный вариант, но не скрытое меню без подписи.

#### Profile / professional snapshot

- Вмещается в первый экран desktop и mobile без необходимости читать кейс.
- Состоит максимум из четырёх коротких строк: роль и стаж, компании, специализация, город/формат при наличии.
- Не использовать маркетинговые эпитеты вроде «экспертный», «уникальный», «сильный» без доказательств.

#### Experience block

- Заголовок: `Опыт работы`.
- Показать 3–4 релевантные позиции в обратной хронологии.
- Одна позиция содержит: компания, роль, период (если подтверждён), тип продукта / контекст в одном предложении.
- Никаких длинных обязанностей, рейтингов компаний или неподтверждённых результатов.
- Отдельная ссылка `Подробнее об опыте` открывает существующий раздел опыта, если он остаётся в продукте.

#### Featured cases

- Заголовок: `Избранные кейсы`.
- 2–3 кейса с одной причиной, почему их стоит открыть: эффект, сложность сценария или личная зона ответственности.
- Левый список всех кейсов остаётся доступным как постоянная навигация desktop; на mobile — как понятный список/горизонтальный контрол, не перекрывающий основной контент.
- Каждый кейс можно открыть без взаимодействия с AI.

#### AI placement

- На главной отсутствуют: чат, поле ввода, «ИИ ассистент», quick prompts и любые призывы начать диалог.
- Внутри кейса AI расположен после основного рассказа о задаче, решении, роли и результате либо за нейтральной кнопкой `Уточнить по кейсу`.
- Задача блока — отвечать на вопросы о доказательствах, личном вкладе, решениях, ограничениях; не объяснять, кто кандидат.

#### Additional work

- Размещается после избранных кейсов и опыта.
- Возможные типы: AI-пет-проект, отдельная работа с нейросетями, концептуальные/визуальные работы.
- Для каждого материала указывать, что именно он демонстрирует: продуктовый подход, использование AI, визуальное мышление и т.д.
- Не смешивать дополнительные эксперименты с основными продуктовыми кейсами.

### Block anatomy: Experience

- Заголовок: `Опыт работы`.
- Подзаголовок: короткое позиционирование, не повторяющее hero.
- Карточки/строки: `Компания` → `Роль` → `период` → `что делал / в каком контексте`.
- Вторичная ссылка: `Посмотреть кейсы` ведёт к избранным работам, а не вынуждает разговаривать с AI.

### Functional and reliability requirements

- Production URL открывается без Vercel access request, без VPN и в приватном окне браузера.
- Все публичные ссылки доступны на desktop и mobile: CV, Telegram, email, LinkedIn, кейсы.
- Страница не требует Google/Яндекс-авторизации или доступа к корпоративному облаку для просмотра CV и ключевых материалов.
- Корректно отображаются desktop Chrome/Safari и mobile Safari/Chrome; отсутствуют горизонтальный скролл, обрезанные CTA и недоступные touch-targets.
- При шаринге в Telegram, LinkedIn и Slack отображаются корректные title, description и preview image.

### State inventory for this redesign

- **Desktop main page:** profile snapshot, contact/CV, experience, featured cases, left case navigation; AI отсутствует.
- **Mobile main page:** тот же порядок; навигация по кейсам не занимает весь первый экран и не ломает вертикальное чтение.
- **Case detail:** полный обычный кейс доступен без AI; AI — вторичный необязательный блок.
- **CV link unavailable:** пользователь видит понятное состояние ошибки/альтернативный контакт, а не пустую страницу или cloud-login.
- **External contact unavailable:** ссылка не маскируется как успешная; перед релизом должна быть проверена вручную.
- **Shared preview:** metadata заполнены, страница открывается без авторизации.

### Non-goals

- Не удалять AI-ассистента из продукта.
- Не обещать, что AI поможет оценить человека лучше, чем обычное знакомство с портфолио.
- Не превращать главную в полное резюме с длинным списком обязанностей.

### Validation

1. Попросить 3–5 новых людей открыть главную на 10 секунд и ответить без поиска: «Кто это? Где работал? В чём его сильная сторона? Как с ним связаться?» Если ответы неточны — иерархия всё ещё не работает.
2. Попросить их выбрать один кейс для чтения и объяснить, почему выбрали именно его. Если причина не совпадает с желаемым фокусом — пересмотреть featured cases и подписи.
3. Прогнать release-checklist: без VPN, с рабочим VPN, desktop/mobile, приватное окно, Telegram/LinkedIn/Slack share, CV download и все контакты.

## Resume Context

Current Andrey portfolio is a successful proof-of-concept for a bounded, fact-aware reader-side assistant. The proposed product reverses the direction: candidate-side evidence collection via an AI interview, then a human-reviewed portfolio. The strategic error to avoid is treating “any profession” as an MVP scope. Validate one role-specific wedge and the interview-to-draft loop before building accounts, billing, imports, multi-user storage, or a generalized AI platform.

## Proposed published-case entry correction — pending approval

### Problem

- **FACT:** a visitor enters a published case to read its authored material first, not to continue an implied chat conversation.
- **FACT:** direct project navigation does not append a stored user message, but compact workspace currently renders an `openingPrompt` as a presentational user bubble before the case content.
- **HYPOTHESIS:** the synthetic prompt makes the case feel AI-first and suggests that reading the case requires a chat interaction.

### Intended behaviour

- A direct opening of any of the six cases starts immediately with the authored case summary: product context, role, process, evidence and result.
- The same rule applies to desktop workspace and compact workspace. It is a case-entry rule, not six case-specific layout overrides.
- The composer remains available after the content as an optional way to ask a real follow-up question.
- A user bubble is shown only for text the visitor actually submitted, including a deliberate prompt-chip action. Real conversation history must remain intact.

### State inventory

- **New direct case open:** no synthetic user bubble; canonical structured summary is first.
- **Case restored from storage:** retain real submitted messages and their order; do not attempt to delete historic user text without reliable provenance.
- **Project switch:** selected case retains its own true conversation and disclosure state; a never-opened case follows the new direct-entry state.
- **Submitted question / chip action:** append user bubble once, then the assistant response; auto-scroll and error/retry policy stay unchanged.
- **Desktop / compact breakpoint switch:** same thread items, hence no new synthetic bubble or duplicated content.
- **Loading, error, session limit:** unchanged; they follow the summary or the visitor's actual question.

### Constraints and validation

- Do not change `/api/chat`, case data, session schema, or message persistence.
- Remove only the presentation-only entry prompt from the compact render path; do not filter all `kind: 'user'` items, because that would erase legitimate questions.
- Verify all six cases at desktop and compact widths, a direct open, drawer switch, reload with an existing real question, and a new composer submission.
- Success means a reader can begin reading immediately, while every intentional question still appears exactly once in the transcript.
