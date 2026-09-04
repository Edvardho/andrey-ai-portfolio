# Portfolio landing: Figma vs current implementation

Date: 2026-08-31

## Scope

- Figma section: `4298:7898`, file `wHXHuzCUgP3OUViuKVbV2K`.
- Current implementation: the landing state of the Next.js portfolio at `1920x1080` and `375x812`.
- This audit covers frontend/UI only. Existing assistant and case backend behavior is treated as an integration boundary, not as implementation scope.

## Evidence

- `figma-desktop-step-1.png`: desktop default / overlapping card state.
- `figma-desktop-step-2.png`: desktop expanded card grid.
- `figma-animation-spec.png`: interaction specification for desktop cards.
- `figma-mobile-812.png`: mobile viewport with fixed bottom CTA.
- `figma-mobile-1053.png`: full mobile landing with footer.
- `current-entry-desktop-1920x1080.png`: current clean landing state.
- `current-mobile-375x812.png`: current mobile blocker.
- `current-desktop-1920x1080.png`: current persisted case/chat state.

## Verdict

The Figma work is not a visual polish pass over the current landing. It replaces the landing's information architecture.

The current landing is assistant-first: identity, metadata chips, AI explanation, composer, then a simple case carousel. The Figma landing is portfolio-first: personal value proposition, experience timeline, richer project cards, CV/contact actions, desktop card choreography, and a real mobile landing.

Implementation should therefore replace the landing view while preserving the existing case/chat workspace as a separate mode. Trying to patch the existing `PortfolioEntryView` incrementally will leave assistant-specific layout and state responsibilities tangled into the new landing.

## Decision update — 2026-08-31

- AI is intentionally absent from the homepage.
- This pass covers the homepage only; mobile case/workspace states are deferred.
- The `375x812` contact CTA is viewport-fixed while scrolling.
- Mobile project cards have no fan/row animation.
- Inter is the canonical font; the current Onest code setup is the mismatch.
- A source portrait has been provided. CV will be provided after the homepage layout is complete.
- The Alfa-Smart result period has been corrected to one month.

## Main gaps

### Structure and content

- Header: Figma uses `Download CV` + `Contact`; current UI uses availability status + `Contact`.
- Hero: Figma adds a portrait, a two-line value proposition, and five text chips. Current UI has no portrait/value proposition and uses four icon chips with different content.
- Experience: the three-role timeline is entirely missing from the implementation.
- Assistant entry: the current composer and assistant explanation are absent from Figma. Its future entry point is undefined.
- Project cards: Figma cards contain image, name, description, and result; current cards contain image and one title only.
- Desktop card behavior: Figma starts with six overlapping/rotated cards and expands them into a 24 px grid on section hover. Current cards stay in a horizontal carousel and only rise 2 px / scale the image on individual hover.
- Mobile: Figma defines a 375 px landing; current implementation deliberately blocks every viewport below 1280 px.
- Footer: present in the full mobile Figma frame, absent from the current landing.

### Visual system

- Figma uses Inter (`Regular`, `Medium`, `Semi Bold`); the implementation uses Onest globally.
- Figma desktop content is based on a 1124 px center column. The current landing uses a frame up to 1584 px and a 932 px assistant column.
- Figma desktop hero title is 68 px; current title is 78 px and has a different vertical rhythm.
- Figma project cards are 270x313 px. Current project cards are 286x286 px.
- Card radius, shadow, copy hierarchy, result colors, spacing, and image crops need to be rebuilt to match the design.

## Interaction and implementation risks

1. **Assistant entry is unresolved.** Removing the composer removes the current primary transition into the assistant. Decide whether AI moves to a header action, a project/detail screen, or is intentionally removed from the landing.
2. **Mobile ends at the landing.** Figma shows the mobile homepage, but not the mobile case/chat experience reached after tapping a project. The existing case workspace is desktop-oriented, so project-card behavior on mobile is a blocker until its destination is defined.
3. **The two mobile frames disagree.** The 812 px frame has a fixed bottom CTA and scrollable content below it; the 1053 px frame has a footer but no fixed CTA. Define whether the CTA is always sticky, viewport-dependent, or disappears near the footer.
4. **Desktop hover is not a complete interaction contract.** The spec defines mouse enter/leave, 400 ms spring-like easing and reduced motion, but does not define keyboard focus, touch, card click during movement, arrow disabled states, or what happens at intermediate widths.
5. **Landing and chat need different responsive shells.** The current root is `h-screen` and overflow-hidden, which suits the chat workspace. The new landing needs normal document scrolling on mobile and possibly on shorter desktop heights. These modes should not share the same overflow contract.
6. **Fonts must be scoped.** Changing the global font from Onest to Inter would also restyle all existing assistant/case screens. Use a landing-scoped typography layer unless the whole portfolio is intentionally migrating.
7. **Missing assets.** There is no CV file and no portrait/avatar source in `public`. The portrait can be exported from Figma; the CV needs a real destination and file.
8. **Content facts conflict.** Figma says `32K subscribers in 3 months`, while repository content says `32,111 subscriptions in 1 month after launch`. Do not ship both versions without deciding which is correct.

## Recommended implementation plan

### Phase 0 — close product decisions

- Decide where AI entry lives after the redesign.
- Define mobile card destinations and whether deep case/chat views remain desktop-only.
- Confirm sticky CTA behavior and provide the CV target/file.
- Approve canonical metric wording for each card.

### Phase 1 — prepare landing data and assets

- Introduce one frontend landing model for identity, experience timeline, tags, project descriptions, results, and result tone.
- Export the portrait and verify all six card images/crops.
- Keep case IDs aligned with the existing navigation handlers.

### Phase 2 — rebuild desktop landing

- Create a dedicated landing component instead of extending the assistant-first `PortfolioEntryView`.
- Implement the 1124 px layout, Figma typography, header actions, hero, timeline, and project-card content.
- Preserve the current chat workspace and contact modal behind existing handlers.

### Phase 3 — implement desktop card choreography

- Default: overlapping cards with per-card rotation.
- Hover/focus-within: six-card 24 px grid with zero rotation.
- Use the specified 400 ms easing and reduced-motion fallback.
- Keep every card clickable and keyboard reachable throughout the transition.

### Phase 4 — implement the mobile landing

- Remove the blanket mobile blocker for the landing route only.
- Build the 375 px layout with horizontal tag, experience, and project rails.
- Add scroll snapping/touch behavior and the agreed sticky CTA/footer behavior.
- Keep the desktop chat blocker if no mobile destination has been designed.

### Phase 5 — integration and QA

- Verify contact, CV, project navigation, browser back/home behavior, persisted sessions, and assistant entry.
- Compare screenshots at 1920x1080, 1440x900, 375x812, and 390x844.
- Test keyboard focus, touch scrolling, reduced motion, long copy, and short viewport heights.
- Run typecheck, lint, existing verification scripts, and a production build.

## Priority

- P0: interaction/product decisions, landing shell split, mobile destination contract.
- P1: desktop visual rebuild, content model, card choreography.
- P1: mobile landing.
- P2: intermediate breakpoints and polish after the four reference viewport checks pass.
