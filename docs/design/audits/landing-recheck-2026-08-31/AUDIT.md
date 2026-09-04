# Landing implementation recheck

## Scope

Responsive homepage, project fan/rail, contact modal, mobile case handoff, footer, and basic keyboard/semantic behavior.

## Accepted flow

1. Desktop landing default — healthy. The full fan is visible without clipping at 1920×1080.
2. Desktop expanded project row — healthy. Hover expands the fan, the rail scrolls by 294px, and arrow disabled states update.
3. Mobile landing 375×812 — healthy. Header and hero follow the compact Figma composition; tag scrollbar is hidden; fixed CTA remains visible.
4. Contact modal — healthy. Existing focus management and close behavior are retained; contact copy is corrected.
5. Mobile case handoff — healthy for the current iteration. The desktop-only message appears and now includes a direct return to the homepage.
6. Mobile footer — healthy. No horizontal body overflow; the fixed CTA does not cover the footer.

## Fixes made during the recheck

- Corrected the mobile header, hero alignment, responsive name, CV label, typography, and portrait size.
- Removed the visible tag-rail scrollbar.
- Prevented the outer desktop fan cards from being clipped.
- Corrected `Destop` and both `в течении` copy errors.
- Added a visible `Вернуться на главную` action to the mobile case blocker.
- Extended the runtime smoke test to cover the mobile blocker and return flow.

## Evidence limits

- Screenshot inspection does not prove full WCAG compliance or screen-reader behavior.
- The CV remains intentionally disabled until the PDF is supplied.
- Mobile case content remains out of scope; only the blocker and recovery path were verified.
