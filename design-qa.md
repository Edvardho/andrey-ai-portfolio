# Case fan expansion QA

Scope: only the landing case fan's expansion geometry and animation. Existing copy, assets, card dimensions, typography and page sections are intentionally preserved.

- Source: `/var/folders/lc/1ydt0jhs1d9fznl3xlzt5c6h0000gn/T/codex-clipboard-f66399d4-5bef-45b7-aa97-d326a11dcf18.png`
- Implementation: `/tmp/centered-cases-expanded.png`
- Source pixels: 3870 × 2330, interpreted at 2× density (1935 × 1165 CSS viewport).
- Implementation: 1935 × 1165 pixels, 1× density, expanded desktop state in the in-app browser. Keyboard focus outline is expected in this capture.
- Source and implementation were displayed together in the same comparison tool result. The source card row and rendered card row were inspected as the focused region; full-page vertical offsets are not part of this animation-only change.

## Comparison history

1. [P1, fixed] The expanded row started at the content column's left edge and hid the last card even at 1920px. The new regression failed with first=398, last=2138.
2. Added an animated desktop rail gutter based on the actual card count and existing card width/gap. Kept the collapsed fan transforms unchanged.
3. Post-fix browser evidence at 1935px: first card starts at 97.5px, last card ends at 1837.5px; equal 97.5px outer margins. All six cards are visible, ordered as in the source. Automated tests assert movement to both sides and return to the original fan transforms.

## Fidelity surfaces

- Typography: existing family, sizes, weights, wrapping and line height unchanged; no typography changes requested.
- Spacing/layout: centered expanded row, 270px cards, 24px gaps; smooth 700ms animation shared with the existing fan. Narrow desktop keeps reachable horizontal scrolling instead of shrinking cards.
- Colors/tokens: existing background, borders, radii and shadows preserved.
- Images: original case assets and crops preserved; no generated or replacement images.
- Copy: all case titles, subtitles and results unchanged.

## Interaction checks

- Viewports: 375, 768, 1024, 1280, 1428, 1440, 1441, 1600, 1920, 2048px, with normal and reduced motion.
- Superseding follow-up approved after UI audit: controls follow actual expanded-row overflow, including at 1600px; hide when the row fits. Existing mobile gesture-only behavior is preserved. The controls retain their layout space, so no section moves vertically.
- Additional approved fixes: case addresses use `?case=<id>` and override stored selection without resetting session/threads; desktop workspace header includes direct CV download. Detailed home experience entry, mobile timeline and vertical spacing remain unchanged.
- Checks: viewport-edge rail, shadow clearance with larger text, last-card reachability, scroll arrows where overflow exists, centered wide row, two-direction expansion, original fan restored on exit.
- In-app browser: expanded state inspected and console error list empty.
- No backend, assistant, session, CV or public contract changes.

## Findings

No remaining P0/P1/P2 differences within the requested animation scope. The reference is a still image: its exact timing is unknown, so the existing 700ms duration and easing are retained.

final result: passed

---

## Previous QA report (preserved)

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
