# Portfolio landing flow

## Homepage

1. A visitor opens the responsive homepage and sees the profile, experience timeline, and six case cards.
2. `Написать мне` opens the existing contact modal on every viewport.
3. `Скачать CV` downloads the public PDF from `/cv/andrey-makarevich-product-designer.pdf`.
4. A project card uses the existing case identifier and opens the responsive case/workspace state.

## Responsive contract

- Desktop (1280px and above): project cards start as a fan and expand on hover or keyboard focus.
- Tablet (768–1279px): static horizontal project rail.
- Mobile (below 768px): scrollable landing, vertical experience timeline, scroll-snap project rail, fixed contact CTA.
- Compact workspaces below 1280 px retain the same case and experience content, drawer navigation and composer as desktop; their layout changes, not their information architecture.

## Accessibility and motion

- Project cards and controls are keyboard reachable; fan expansion also occurs on `focus-within`.
- Arrow controls reflect disabled scroll boundaries.
- Reduced-motion users receive a static expanded desktop rail.
