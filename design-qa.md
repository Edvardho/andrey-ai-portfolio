# Design QA — project cards

- Scope: landing section `Что делал`, Figma node `4171:6564`.
- Reference: `docs/design/qa-project-cards/design-qa-reference.png` (direct Figma node export).
- Desktop implementation: `docs/design/qa-project-cards/design-qa-projects.png`, viewport `1920×1080`, collapsed fan state.
- Mobile implementation: `docs/design/qa-project-cards/design-qa-projects-mobile.png`, viewport `375×812`.
- Font: Onest by product decision; no Inter substitution.

## Comparison

- Card width is `270px`; preview height is `180px`; radius is `24px`.
- Preview/info surface uses `#F7F8FA` with `4px` white top and side borders.
- Key result is a separate white surface with `16px 16px 12px` horizontal/bottom padding and `8px` top padding.
- All six images use the exact Figma source assets and the node's percentage sizing/positioning.
- Result bullets from the previous implementation are removed; positive/caution colors match the node.
- Fan rotations match the six individual Figma transforms.
- Measured transformed card bounds are consistently about `2px` taller than the Inter reference because the approved Onest font has different normal line metrics. No clipping or rhythm break is visible.
- Mobile rail keeps all cards at `270px`; document width remains `375px`, so there is no body overflow.

## Interaction checks

- Hover expands the desktop fan over `700ms` with `cubic-bezier(0.22, 1, 0.36, 1)`.
- Every desktop experience item, including the final MTS item, keeps the `1.5px` timeline line after its dot.
- Card activation still opens the existing case workspace.
- Mobile cards remain a touch-scroll rail and the fixed contact CTA stays at the viewport bottom.

## Automated checks

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run verify`: reaches the pre-existing SIEBEL structured-summary crop assertion; the failure is outside this card change.
- `npm run test:runtime`: landing/card interactions pass until the existing forced storage-write failure scenario; this change does not touch storage or case state.

final result: passed
