# RFC 0003: Portfolio release quality

Status: Implementation complete — production validation pending

## Summary

Unify profile facts, add a scannable `CaseAtAGlance` lead to every case, present direct experience entry as editorial content, align navigation order, add email contact and visible mobile image zoom controls, and close accessibility gaps without changing chat APIs or persisted sessions.

## Technical design

- A lightweight profile source owns name, positioning, experience, contact data, and the public case order.
- Every `CaseContent` owns a required `atAGlance` object containing title, problem, role, period, outcome, and outcome tone. Existing structured sections remain the detailed source below it.
- Assistant identity is hidden only for the first canonical case or experience summary when no user item precedes it. Real replies keep the identity.
- The composer remains mounted and visible in desktop and compact workspaces.
- Contact options add an email variant rendered as `mailto:` in the same modal.
- Mobile image preview keeps pinch/double-tap and adds 44px zoom-out, fit, and zoom-in controls with an accessible live scale label.
- The existing desktop workspace, case lazy loading, API payloads, and storage schema remain unchanged.

## Acceptance criteria

1. Landing, sidebar, and compact drawer use the same case order.
2. All six cases render a scannable lead before detailed sections.
3. Direct case and experience entry do not show assistant identity; a real answer does.
4. Experience and landing facts use the canonical source and the public CV matches those facts.
5. Email is available in the contact modal without a new tab.
6. Menu, send, compact CTA, and image controls expose at least a 44x44px hit area.
7. No body overflow or regression occurs at 375, 430, 768, 1279, 1280, and 1440px.

## Test strategy

- A release-quality contract validates canonical facts, order, contact options, case leads, and identity policy.
- Existing compact, structured case/experience, code-splitting, scroll-policy, runtime, typecheck, lint, and build checks remain green.
- The replacement PDF is rendered and inspected, then its text and links are verified programmatically.
