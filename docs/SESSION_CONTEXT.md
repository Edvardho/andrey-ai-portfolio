<!-- AI-CONTEXT:START -->
# Session Context

_Last updated: 2026-09-05_

### Status

IN_PROGRESS — implementation and local QA are complete; production validation is intentionally pending a Vercel deployment.

### Workstream

- **Mode:** release verification and handoff.
- **Goal:** ship a responsive portfolio with a shared content source, compact workspace, consistent profile imagery and validated case navigation.
- **Artifact:** `/Users/amakarevich/Desktop/My_Startap/.worktrees/ai-portfolio`.

### Progress

- [x] Replaced the mobile blocker with compact case and experience workspaces below 1280 px.
- [x] Added the shared `CaseAtAGlance` lead, responsive artifact rails, contact email action and image-viewer controls.
- [x] Centralized the portrait at `/profile/andrey-makarevich.png` with one `object-cover` focal position; all profile representations use it.
- [x] Fixed final-card reachability in horizontal case rails and the desktop project-fan shadow clipping.
- [x] Matched compact collapsed accordion rows to the approved Figma baseline.
- [x] Published the CV at `/cv/andrey-makarevich-product-designer.pdf` without changing public links.
- [ ] Deploy to Vercel and validate the public URL in a clean browser session.

### Key Files

- `src/data/portfolio-profile.ts` — canonical profile, portrait and focal position.
- `src/data/portfolio-global-content.ts` — experience summary preview configuration.
- `src/components/portfolio-shell.tsx` — desktop/compact workspace routing, composer and drawer behavior.
- `src/components/portfolio-case-collection.tsx` — shared horizontal artifact rail geometry.
- `src/components/portfolio-structured-case-summary.tsx` — case lead and accordion renderer.
- `scripts/structured-experience-contract.ts` — experience and portrait contract.
- `docs/design/RELEASE_QUALITY_HANDOFF.md` — current product acceptance criteria.

### Decisions

- Site facts are the canonical source; CV content follows them.
- Onest and the existing visual language remain unchanged.
- Drawer order is shared across landing, sidebar and compact navigation.
- The compact workspace changes layout only; case data, session storage and chat API remain compatibility boundaries.
- Compact accordion rows intentionally use the approved 32 px visual baseline; primary interactive controls remain at least 44×44 px.

### Blockers

No code blocker. A public Vercel URL is required for the last external acceptance check.

### Next Steps

1. Run the full local gate after any further change: `npm run verify`, `npm run build`, `npm run test:runtime`.
2. Deploy the current branch to Vercel.
3. In a clean browser session, validate landing, every case, compact drawer, experience, contact links, CV download and share preview.
4. Compare the public build against approved Figma frames at 1440, 1024, 430 and 375 px.

### Resume Context

The implementation is ready for production validation. The latest cleanup synchronized the experience-photo contract with the approved shared portrait crop and replaced stale documentation that still described a disabled CV and a mobile workspace blocker. Historical audits are deliberately left unchanged.
<!-- AI-CONTEXT:END -->
