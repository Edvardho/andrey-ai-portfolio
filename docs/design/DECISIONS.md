# Design Decisions

## 2026-09-05 — Compact workspace and release assets

### Decision

- The responsive compact workspace replaces the earlier mobile blocker below 1280 px. It renders case and experience content, navigation drawer and composer from the same data and session model as desktop.
- The portrait source is centralized in `src/data/portfolio-profile.ts`; every profile representation uses `/profile/andrey-makarevich.png` with the same `object-cover` focal point.
- The public CV is available at `/cv/andrey-makarevich-product-designer.pdf`; all existing links retain that path.
- Local implementation and contract checks are the release baseline. External acceptance still requires a Vercel deployment check.

### Why

The earlier homepage-only scope was superseded by the approved compact Figma frames and the release-quality RFC. Keeping that earlier decision below preserves its historical context, but its mobile-blocker constraint no longer applies.

## 2026-08-31 — Separate responsive landing from desktop workspace

### Context

The new homepage is responsive and scrollable. The existing case/chat workspace is a fixed-height desktop application shell and currently blocks widths below 1280px. This iteration covers only the homepage; mobile case/chat screens are deferred.

### Options considered

1. **Mode-specific shells inside the existing page.** Render the landing as a normal responsive document. Apply `100dvh + overflow-hidden` and the mobile blocker only after entering the existing workspace.
2. **Separate routes now.** Move the landing to `/` and the existing assistant/workspace to a dedicated route, with project routes or query state.
3. **Make the entire workspace responsive now.** Remove the blocker and redesign every workspace column for mobile.

### Decision

Use option 1 for this iteration.

It keeps the change frontend-only, avoids rewriting existing assistant/session behavior, and removes the blocker from the homepage without pretending the deferred mobile workspace is complete. Structure the landing as an independent component so it can later move to route-based navigation without a second visual rebuild.

### Implementation consequences

- Landing root: normal document flow, `min-height: 100dvh`, vertical page scroll.
- Workspace root: retain fixed viewport height and internal scrolling.
- Mobile blocker: shown only when a mobile user attempts to enter an out-of-scope case/workspace state, never on the homepage.
- Fixed mobile CTA: viewport-fixed at the bottom with safe-area padding; landing content receives matching bottom padding.
- Project IDs and existing click handlers remain stable so the next iteration can replace the temporary mobile destination without rebuilding cards.

## 2026-08-31 — Desktop project-card animation

### Decision

- Desktop default: six overlapping cards with the rotations defined in Figma.
- Section `hover` or `focus-within`: cards expand into a zero-rotation horizontal row with 24px spacing.
- Use a 700ms CSS transform transition with `cubic-bezier(0.22, 1, 0.36, 1)`; retain Framer Motion only if visual QA shows CSS cannot reproduce the target reliably.
- Keep the desktop flex track geometry stable and build the overlap with per-card transforms only. Reset horizontal scroll immediately before collapse so flex reflow and smooth scrolling cannot distort the return animation.
- Reserve `24px` of inline padding inside the desktop project track so the scroll container does not clip the first and last card shadows in the expanded state; offset the collapsed fan by the same amount to preserve its composition.
- Keyboard focus expands the row before a card action.
- `prefers-reduced-motion: reduce` shows the expanded row immediately with no animation.
- Mobile uses a static, zero-rotation, scroll-snap rail. No fan animation.

### Why

CSS keeps pointer and keyboard hit areas aligned with the visible cards and avoids adding new state to the page. The existing code already uses Framer Motion, but this interaction does not require JavaScript unless screenshot comparison proves otherwise.

## 2026-08-31 — Homepage delivery constraints

- Onest remains the global font; no Inter migration is planned.
- The supplied portrait is used as a public static asset without AI processing.
- `Скачать CV` downloads the public PDF from `/cv/andrey-makarevich-product-designer.pdf`.
- The homepage and compact workspace are implementation-complete; production release waits only for external Vercel validation.
