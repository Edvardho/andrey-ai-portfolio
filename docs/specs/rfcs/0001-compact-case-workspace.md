# RFC 0001: Compact case workspace

Status: Implemented

## Summary

Replace the case-only desktop blocker below 1280px with a shared compact workspace that renders the existing case threads, structured summaries, galleries, disclosure state, composer, modals, and session data. The landing and the desktop workspace remain visually and behaviorally unchanged.

## Motivation

The portfolio landing is responsive, but opening a case below 1280px currently reaches a blocker. Figma defines a reusable one-column case experience with a sticky case header, projects drawer, internal conversation scroll, touch galleries, and bottom composer. Reusing the current content and state prevents six divergent mobile implementations and preserves case code splitting.

## Technical design

- Resolve one workspace layout mode: `compact` through 1279px and `desktop` from 1280px.
- Render only one workspace branch. A hydration-safe unresolved state uses a neutral skeleton.
- Compact workspace is a viewport-height grid containing header, one scroll viewport, and composer dock. Document scrolling is locked only while this branch is active.
- The drawer uses lightweight landing thumbnails and the canonical rail data; it never imports every case module.
- Structured case rendering receives `layoutMode`. Existing desktop defaults remain unchanged.
- Compact collections use 280x160 evidence previews and 202x202 showcase previews with 12px gaps and scroll snap.
- Existing thread, disclosure, modal, submit, persistence, lazy loading, and API flows remain authoritative.

## Acceptance criteria

1. At 375px and 1279px a case renders the compact workspace without the desktop blocker; at 1280px the existing desktop workspace renders.
2. The drawer lists six cases in Figma order, identifies the active case, switches cases, returns home, traps focus, and restores focus when closed.
3. All six structured summaries render from existing data. Multiple disclosure rows can remain expanded per context.
4. Horizontal galleries do not increase document width and artifact buttons keep opening the existing preview modal.
5. The compact composer sends text once, keeps existing keyboard rules, and remains visible above the mobile keyboard/safe area.
6. Desktop layout, API payloads, stored session format, case IDs, and case code splitting do not change.

## Test strategy

- Contract tests cover the breakpoint, drawer order, navigation metadata, and compact collection dimensions.
- Runtime browser smoke covers landing-to-case, drawer switching/home/contact/CV, composer states, horizontal overflow, and the 1279/1280 boundary.
- Existing structured-summary, case-layout, code-splitting, scroll-policy, typecheck, lint, build, smoke, runtime, and verify commands remain green.
- Visual QA covers 375x812, 390x844, 768x1024, 1024x768, 1279x800, 1280x800, and 1440x900.

## Known design corrections

- Use the canonical UX/UI WannabeLike title instead of the copied sharing title.
- Normalize ChatPoint to Latin characters and render the compact composer consistently.
- Keep CV disabled until a real PDF is provided.
- Add the approved `На главную` action to the drawer and use a send icon instead of a waveform icon.
