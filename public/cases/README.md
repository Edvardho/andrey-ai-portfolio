# Case Asset Contract

Все изображения кейсов собраны здесь, чтобы их можно было заменять без поиска по коду.

Главное правило: заменяй картинку новым файлом с тем же именем. Тогда код менять не нужно.

## Folders

- `alfa-smart` — Альфа-Смарт.
- `chatpoint` — ChatPoint.
- `siebel` — SIEBEL.
- `expenses-card-holders` — Расходы держателей.
- `subscription-sharing` — Шаринг подписки.
- `ux-ui-wannabelike` — UX/UI WannabeLike.
- `experience` — Опыт работы.

## Shared File Names

- `rail.png` — изображение карточки в левом rail `Мои проекты`.
- `entry.png` — изображение карточки на главной странице.
- `context.png` — изображение в правом блоке контекста.
- `intro-preview.png` — изображение в intro-блоке structured summary.
- `disclosure-*.png` — изображения внутри раскрывающихся блоков.
- `showcase-*.png` — изображения в горизонтальных showcase-блоках.
- `*-overlay.png` — дополнительный слой поверх основного изображения.

## Replacement Rules

1. Если нужно заменить изображение без изменения верстки, положи новый файл поверх старого с тем же именем.
2. Если у нового изображения другой crop, масштаб или композиция, одной замены файла может быть недостаточно.
3. Геометрия изображения задается в `src/data/portfolio-content.ts` через `imageClassName`, `overlayImageClassName`, `backgroundColor` и `borderColor`.
4. Не переименовывай файлы, если не готов одновременно обновить все ссылки на этот файл в коде.
5. Старые папки `public/entry`, `public/context-panel` и `public/structured-summary` пока оставлены как архивный источник. Рабочий контракт для кейсов теперь находится в `public/cases`.

## Automated Replacement Workflow

Если нужно заменить картинку в кейсе, не клади тяжелый файл сразу в `public/cases`. Используй входящую папку:

```bash
asset-inbox/<caseId>/<targetFileName>
```

Примеры:

```bash
asset-inbox/alfa-smart/disclosure-requirements.png
asset-inbox/chatpoint/showcase-routing.png
asset-inbox/siebel/context.png
```

Потом запусти:

```bash
npm run assets:optimize
npm run verify:case-assets
```

Скрипт проверит, что кейс существует, что файл с таким именем уже есть в `public/cases/<caseId>/`, сожмет изображение без апскейла и заменит рабочий файл. После успешной замены исходник из `asset-inbox` удаляется.

Если ты не знаешь точное имя файла, сначала посмотри список слотов:

```bash
find public/cases/<caseId> -maxdepth 1 -type f | sort
```

## Optimization Rules

- `rail.png` — максимум 360px по длинной стороне.
- `entry.png`, `context.png`, `intro-preview.png` — максимум 960px по длинной стороне.
- `showcase-*`, `disclosure-*`, `*-overlay.png` — максимум 1800px по длинной стороне.
- Формат файла сохраняется прежним, чтобы не переписывать ссылки в `src/data/portfolio-content.ts`.
- Если новая картинка с другим crop/composition, после замены может понадобиться правка `imageClassName` в `src/data/portfolio-content.ts`.

## Batch Optimization

Чтобы сжать уже существующие картинки:

```bash
npm run assets:optimize:all
npm run verify:case-assets
```

Этот режим перезаписывает файлы в `public/cases` оптимизированными версиями с теми же именами. После него обязательно проверь визуально ключевые кейсы и image modal.
