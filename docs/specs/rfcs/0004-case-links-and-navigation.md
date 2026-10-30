# RFC 0004: Case links and persistent CV access

Status: implemented and locally verified; not committed or deployed. Scope approved: overflow-based arrows, shareable case URLs, desktop workspace CV. Do not change home experience navigation, mobile timeline, spacing, or assistant/session contracts.

## Contract

- Public case address: `/?case=<existing-case-id>`. Only the six existing IDs are accepted. Preserve unrelated query parameters and the hash when changing case.
- An explicit valid case URL wins over persisted selection; preserve existing threads, disclosure state, session ID and message quota. A matching existing thread is restored, not replaced.
- No case parameter: retain existing initial session restoration. Invalid/duplicate case parameters: show home and remove the invalid parameter, without silently choosing a stored case.
- Local navigation updates browser history without reload; Back/Forward reopen the addressed case or home. URL replay never adds another history entry. Async case loads must not reopen a case after navigation home.
- Opening a case from a URL uses existing local case loading/seeds. No OpenAI or chat API request merely to browse. Existing first-question context sync and production Supabase failure behavior remain intact.
- Arrows: visible only when the expanded row requires scrolling (mobile remains gesture-only). Measure after expansion, on resize and when content size changes; do not change row/card dimensions or spacing.
- Desktop workspace header: add the same direct PDF download used on home. Keep contact action and availability.

## Implementation/risk review

1. Pure allowlisted URL helpers and unit tests.
2. Bootstrap override uses restored data but changes the initial target when explicitly linked.
3. Client history sync and guarded popstate replay reuse local context navigation, with stale-load cancellation.
4. ResizeObserver updates rail overflow; CSS preserves control row height when arrows are hidden.
5. Add desktop CV link with existing focus/secondary styling.

Risks: URL/persistence loops (guard hydration/replay); cross-case session mix (reuse existing thread sync); stale lazy loads (existing generation counter plus home invalidation); changed layout (no section/spacing changes); invalid URLs (allowlist, no arbitrary imports).

## Acceptance tests (Given / When / Then)

- Each of six IDs, fresh desktop/mobile browser -> open URL -> correct canonical case, no chat API calls.
- Stored SIEBEL -> open Alpha-Smart URL -> Alpha-Smart; stored threads and quota retained.
- Open case -> switch case -> reload -> same case. Back/Forward and home restore correct screens, without duplicate history.
- Unknown/duplicate ID -> safe home, sanitized URL. Reset parameter continues to clear stored state.
- Widths 1440/1441/1600 -> overflowing expanded row has arrows; 1920/2048 -> no overflow, arrows hidden; live resize updates state. Mobile rules unchanged.
- Desktop case -> PDF link visible with download attribute and successful PDF response.
- Run typecheck, lint for touched files, existing rail, case/session routing and runtime regression gates. No live AI evaluation needed for this UI-only integration.

## Verification results

- URL unit policy; all six cases at375/1440px with fresh storage and reload; no chat API calls during browsing: passed.
- Back/Forward, fresh navigation after history replay, unrelated query/hash preservation, explicit URL overriding stored selection, retained threads/session/quota, invalid/duplicate IDs, reset: passed.
- First question from linked SIEBEL syncs SIEBEL; forced503 retains case/URL and retry; late case load cannot reopen workspace after home: passed.
- Rail20 viewport/motion combinations and live1920→1600→1920 resize; PDF response/signature: passed.
- Typecheck, lint for touched files, context-sync recovery, production session-store, release-quality, compact-workspace, case-layout and runtime smoke: passed.
- Production build: passed (required network access to fetch the project's existing Google Fonts).
