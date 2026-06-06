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
