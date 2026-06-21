# RFC-0001: Case content code splitting

## Summary

Move each portfolio case into its own client-loadable module. The entry route must only ship the portfolio index and global content. Full case content is loaded after an explicit case action and cached for the rest of the browser session.

## Motivation

`portfolio-content.ts` currently mixes entry metadata, six complete cases, server AI content, and client presentation data. Any client import pulls every case into the initial JavaScript graph, even when the user never opens those cases.

## Technical design

- `portfolio-index.ts` contains lightweight navigation metadata.
- `portfolio-global-content.ts` contains non-case content.
- `cases/*.ts` contains one `CaseContent` export per case.
- `portfolio-case-loader.client.ts` uses explicit dynamic imports and caches promises/results.
- `portfolio-content.server.ts` statically composes all cases for API, presenter, and verification code.
- Client components can only read cases already loaded by the client loader.
- Case selection loads the module before creating the local envelope. Server session synchronization remains a background operation.
- No hover or focus prefetch is introduced.

## Loading states

- The selected case gets a dedicated pending state while its module loads.
- A failed chunk load keeps the previous context intact and exposes the existing retry path.
- Rapid A -> B clicks must not allow the slower A request to replace B.
- Reopening a loaded case must not issue another module request.

## Test strategy

- Verify all six case modules and dynamic import entries exist.
- Verify client files cannot import the server registry or legacy monolith.
- Verify every module resolves to the expected case ID.
- Verify repeated loads return the cached object.
- Build successfully and inspect emitted chunks for six case modules.
- In browser Network: initial entry loads no closed-case context/showcase/disclosure images; clicking one case loads only that case.

## Acceptance criteria

- `portfolio-content.ts` no longer exists.
- Entry client graph has no static dependency on any `cases/*.ts` module.
- Only the clicked case becomes available to case-aware client renderers.
- Existing AI, modal, persistence, and case navigation behavior remains intact.
