# Портфолио: release-quality handoff

## Цель

Главная, кейсы и опыт должны восприниматься как один продукт. На прямом входе пользователь читает авторский материал; AI появляется только после реального вопроса и не маскируется под автора.

## Канонический контент

- 6 лет опыта.
- Positive Technologies: июнь 2024 — сейчас.
- Альфа-Банк: май 2023 — июнь 2024.
- MTS Digital: апрель 2021 — май 2023.
- Альфа-Смарт: 32 111 подписок за первый месяц; 1,1 млн ₽ выручки.
- MTS Digital: 900 → 580 секунд на диалог; 1000 → 2000 диалогов в обработке.
- Email: `andrew.makarevitch@yandex.ru`.

## Экранные решения

### Главная

- Заголовок проектной секции — «Кейсы».
- На desktop сохраняется веер с раскрытием по hover/focus.
- До 1279 px теги двигаются плавной бесконечной строкой; при reduced motion становятся обычным touch-rail.
- Опыт на mobile — горизонтальный rail: карточка 216 px, gap 12 px, gutters 16 px, snap по началу.

### Кейсы

- Каждый кейс начинается с `Коротко о кейсе`: ведущий артефакт, задача, роль, период, результат.
- Первый canonical summary не содержит user bubble и заголовок «ИИ ассистент».
- После настоящего вопроса остаются один user bubble и идентифицированный AI-ответ.
- Заголовки accordion переносятся; chevron и зона нажатия сохраняются.

### Опыт

- Direct entry начинается как авторская страница без AI identity.
- Карточки позиционирования: «6 лет опыта», «Продуктовый подход», «AI в работе».
- Переходы в кейсы и CTA «Написать Андрею» сохраняются.

### Drawer

Единый порядок без группировки: Альфа-Смарт, Расходы держателей, Шаринг подписки, SIEBEL, ChatPoint, UX/UI WannabeLike, Опыт работы. Обязательные состояния: default, hover, focus-visible, pressed, active, disabled.

### Contact

- Telegram, LinkedIn, email.
- Email открывается через `mailto:` в текущем контексте.
- Mobile — bottom sheet с safe area и полноценной opening/closing анимацией; desktop — modal.

### Image viewer

- Fit, zoomed и max-scale состояния.
- Pinch и double tap на mobile.
- Видимые действия: увеличить, уменьшить, вписать целиком.
- Минимальная hit area — 44×44 px; текущий масштаб озвучивается assistive technology.
- Название артефакта остаётся доступно без закрытия viewer.

### Composer

- Всегда смонтирован на desktop и compact workspace.
- Состояния: empty, ready, sending, error, session limit.
- Дисклеймер: «Ответы сформированы ИИ и могут содержать неточности».

## Контрольные разрешения

- 1440×900: главная, закрытый/раскрытый веер, кейс, опыт.
- 1024×768: кейс и опыт.
- 430×932 и 375×812: главная, кейс, опыт, drawer, contact sheet, image viewer.
- Граница архитектур: compact до 1279 px включительно, desktop с 1280 px.

## Motion и accessibility

- Menu, composer send, compact CTA and image controls have hit areas не меньше 44×44 px. Compact accordion rows retain the approved Figma 32 px visual baseline.
- Все декоративные дубликаты marquee — `aria-hidden`.
- Focus trap, Escape, возврат фокуса и scroll lock обязательны для модальных слоёв.
- При `prefers-reduced-motion` отключаются reveal, marquee, slide и scale transitions; содержимое остаётся полностью доступным.

## Release gate

- CV опубликован по прежнему пути `/cv/andrey-makarevich-product-designer.pdf`.
- Все contract, build и runtime smoke проходят.
- Нет horizontal overflow на 375, 430, 768, 1024, 1279 и 1280 px.
- Финальный Figma diff выполняется после получения утверждённых кадров на перечисленных разрешениях.
- Production-проверка в Vercel (включая CV, контакты и share preview в чистой сессии) остаётся последним внешним шагом.
