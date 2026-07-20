# Session Context: Assistant Routing Recovery

**Status:** IN_PROGRESS — routing recovery verified; worktree still needs review/commit. Do not merge or deploy yet.

## Paste This Into a New Task

```text
Resume the AI-assistant routing recovery in this repository. Read docs/SESSION_CONTEXT.md first. The real API/browser acceptance flow has been verified and the current dirty implementation passes; do not add another router branch or edit UI/assets. First review the existing diff and the API/browser regression scripts, then run the documented matrix. Only change production routing if a fresh persisted-session reproduction fails. Prepare the worktree for a focused commit; do not merge or deploy.
```

## Project Context

- Repository/worktree: `/Users/amakarevich/Desktop/My_Startap/.worktrees/ai-portfolio`
- Branch: `feat/ai-assistant-quality-pass`
- Last committed revision: `adba17e Prepare recruiter test release`
- Product: AI portfolio for Andrey Makarevich. It has a landing page, a chat workspace, six case workspaces, structured factual responses, and normal AI-backed synthesis for questions that are covered by facts.
- Product principle: answers must be constrained by verified case facts. If a fact is unavailable, say so plainly; do not invent it.

## What Has Been Built

- Semantic routing uses `intent + answerType + questionSubject + scope` rather than only a generic intent.
- Case-aware answer modes include case summary, personal contribution, evidence, strength, risks, research, decisions, constraints, and outcomes.
- The landing page has a curated structured entry answer: `Быстро оценить Андрея по кейсам`.
- That fast review is facts-based and shows three cases: Alfa-Smart, SIEBEL, and ChatPoint. It intentionally does not call OpenAI.
- Case content is dynamically loaded; images use an optimization pipeline and are displayed with shared card primitives.
- A reply-focus scroll policy was added so a new answer should open from its beginning instead of pinning the user to its bottom.
- UI/layout/image work has recently been touched repeatedly. It is out of scope for the current recovery unless a routing fix absolutely requires a small rendering change.

## Current Goal

Restore predictable compact-answer routing without changing the product's visual design.

Required contracts:

| Situation | Required result |
| --- | --- |
| In an opened case, `Коротко расскажи об этом кейсе` | Compact factual summary of the currently opened case. |
| In SIEBEL, `Емко: как Андрей исследовал проблему?` | Compact case-research answer for SIEBEL. |
| In ChatPoint, `Коротко: какую ошибку совершили?` | Compact risk answer for ChatPoint. |
| In fast review, no case is selected, `Коротко расскажи об этом кейсе` | Plain two-paragraph reference reply, not a guessed case and not a generic fallback. |
| After fast review, `Расскажи емко про Андрея` | Plain reference reply, not another structured fast review. |
| In an opened case, `Расскажи емко про Андрея` | Compact global answer about Andrey; keep the selected case and do not open fast review. |
| `Спасибо`, `Спасибо тебе большое`, `Спасибки`, `Благодарю` | One polite plain reply, no chips/CTA, no message-limit consumption, no model call. |
| `Спасибо, а где доказательства?` | A real evidence question, not the gratitude shortcut. |

## Verification Findings

1. The normal browser flow passes for fresh sessions and restored `localStorage/sessionId`: opening cases, compact case summaries, compact global answers, fast review, SIEBEL research, ChatPoint risk, gratitude, evidence follow-up, and reload restoration.
2. The real API/session contract passes through `src/app/api/chat/route.ts` and `src/app/api/assistant/bootstrap/route.ts`; selected case context survives persistence and bootstrap restoration.
3. A deliberately parallel action+message request can read the session before the action is persisted and return `ambiguous_question`. The client’s normal `ensureServerContextSynced` path serializes these requests. Do not add a server-side special case unless this reproduces in the normal browser flow.
4. The gratitude envelope intentionally uses `viewType: general_synthesis`, `presentationVariant: plain_text_reply`, empty answer metadata, and does not increment the message count. Do not assert a separate `gratitude` view type.

## Root-Cause Hypotheses To Verify First

These were the original evidence-backed hypotheses. The normal API/browser flow now passes; keep them as historical context, not as open diagnoses.

1. `engine.ts` has two paths for the same deictic compact-case request. One special helper path starts around line 430 and the generic `current_case_only` branch starts around line 493. This duplicated ownership makes a session-state mismatch likely.
2. `resolveCaseAwareSynthesis` falls back to `buildCaseContextRequiredEnvelope` when `synthesizeCaseAwareAnswer()` returns null at `src/lib/portfolio/engine.ts:261-263`. A valid selected case can therefore become a generic prompt instead of an honest case-specific response.
3. Fast-review detection uses `hasSeenCandidateFastReview && selectedContext.kind === 'none'` at `engine.ts:426-428`. This is historical state plus current context, not an explicit active-thread/view contract.
4. The existing verification simulates action -> engine calls directly. It does not confirm the actual UI/API hydration and persisted session sequence that caused the browser failure.

## Relevant Files

- `src/lib/portfolio/engine.ts`
  - Main routing and session persistence.
  - `resolveCaseAwareSynthesis`: lines 239-284.
  - Fast review state: lines 329-362.
  - Classification/router branch: lines 419-537.
  - Deictic compact helper: lines 540-564.
  - Gratitude detector: lines 691-740.
- `src/lib/portfolio/query-interpretation.ts`
  - Converts phrasing into intent, subject, scope, fact facet, answer type, and response length.
- `src/lib/portfolio/types.ts`
  - `QueryInterpretation`, `AnswerType`, `QuestionSubject`, session and envelope types.
- `src/lib/portfolio/session-store.ts`
  - Persistence and restoration of assistant session state.
- `src/lib/portfolio/presenters.ts`
  - Structured fast review, repeated fast review, generic fallback, and gratitude envelopes.
- `src/lib/portfolio/synthesis.ts`
  - Subject-aware facts selection and factual response construction.
- `src/data/portfolio-facts.ts`
  - Candidate and case facts. Do not fabricate missing facts here.
- `scripts/verify-assistant-reply-states.ts`
  - Current test coverage. Lines 60-71 directly exercise `resolveAction` then `resolveMessage` for every case; that test passes even when the browser path fails.
- `scripts/verify-assistant-api-session-flow.ts`
  - API-route integration contract for action → persisted session → message → bootstrap restoration.
- `scripts/verify-assistant-manual-flow.ts`
  - Headless browser acceptance flow covering the manual matrix and reload persistence.
- `src/components/portfolio-shell.tsx`, `src/components/portfolio-chat-workspace.tsx`, `src/components/portfolio-thread-view.tsx`
  - Client session/navigation/reply rendering. Inspect only to trace the actual request/session path. Do not restyle them in this task.

## Current Worktree State

There are uncommitted changes across 23 tracked files and two new verification scripts. The staged diff is inherited work; the additional unstaged additions are the API/browser contracts listed below. `HEAD` and `origin/feat/ai-assistant-quality-pass` remain at `adba17e Prepare recruiter test release`.

High-risk touched areas:

- Router and semantics: `engine.ts`, `query-interpretation.ts`, `intent.ts`, `synthesis.ts`, `types.ts`, `presenters.ts`, `portfolio-facts.ts`.
- Session and client path: `session-store.ts`, `client-seeds.ts`, `portfolio-shell.tsx`, `portfolio-chat-workspace.tsx`, `portfolio-thread-view.tsx`.
- Scroll behavior: `response-scroll-policy.ts` and new `scripts/verify-response-scroll-policy.ts`.
- Verification scripts and `package.json`.

Do not use `git reset`, `git checkout --`, or revert the dirty worktree. Read and preserve existing changes. First run `git status --short` before making any edit.

## Completed Recovery Procedure

1. Reproduced in the browser with a fresh session and captured the network request/response for:
   - open each case;
   - ask `Коротко расскажи об этом кейсе`;
   - repeat after a compact global answer and after fast review.
2. Inspected the real request path and final envelope metadata, including:
   - `session.currentView`
   - `session.selectedContext`
   - `session.hasSeenCandidateFastReview`
   - `interpretation.intent.type`
   - `interpretation.scope`
   - `interpretation.questionSubject`
   - `interpretation.answerType`
   - `interpretation.factFacet`
   - `interpretation.responseLength`
   - the envelope `viewType` and `assistantReplyState`.
3. The normal flow has one verified authoritative outcome for deictic compact-case requests; no additional router branch was added in this recovery pass.
4. A selected case plus a valid compact case summary returns a grounded case-specific synthesis, not the generic context-required envelope.
5. Keep the following concerns separate:
   - active selected case;
   - historical `hasSeenCandidateFastReview`;
   - whether the user is currently in the fast-review thread/view;
   - response-length modifiers.
6. Added API-level and browser-level regression contracts. Do not remove them or replace them with direct engine-only tests.
7. Run the complete matrix again after any production-code change, then review the dirty diff for commit scope.

## Explicit Non-Goals

- Do not add RAG, embeddings, more model prompting, or a new long-term memory layer.
- Do not introduce more one-off phrase regexes as the primary fix.
- Do not touch the landing page composition, modal sizing, images, hover effects, rail order, or case layout.
- Do not alter reply-focus or scroll code unless the reproduction proves the session failure originates there.
- Do not merge, deploy, or tell the user to push until the manual matrix passes.

## Verification

Run from the repository root:

```bash
cd /Users/amakarevich/Desktop/My_Startap/.worktrees/ai-portfolio
npm run typecheck
npm run verify:query-interpretation
npm run verify:recruiter-quality
npm run verify:assistant-reply-states
npm run verify:assistant-render-routing
npm run verify:assistant-api-session-flow
npm run verify:assistant-manual-flow
npm run verify:session-store-mode
npm run test:runtime
npm run build
```

If a script is missing, run `npm run` and record the missing script. Do not silently replace it with an unrelated check.

Manual acceptance matrix:

1. Fresh session -> `Быстро оценить Андрея по кейсам` -> structured review opens once.
2. In fast review -> `Коротко расскажи об этом кейсе` -> reference reply, no generic fallback.
3. Open each of the six cases -> `Коротко расскажи об этом кейсе` -> compact correct case summary.
4. SIEBEL -> `Емко: как Андрей исследовал проблему?` -> SIEBEL-specific research answer.
5. ChatPoint -> `Коротко: какую ошибку совершили?` -> ChatPoint-specific risk answer.
6. Any open case -> `Расскажи емко про Андрея` -> compact global candidate answer; case stays selected.
7. `Спасибо`, `Спасибо тебе большое!`, `Спасибки`, `Благодарю` -> one polite reply, no message decrement.
8. `Спасибо, а где доказательства?` -> grounded evidence response and normal message decrement.

## Resume Summary

The routing recovery has been verified through the actual API/session path and a headless browser flow, including persisted reload state. The worktree is not committed: it contains a broad inherited diff plus two regression scripts. The next task is review and commit preparation, not more visual polish or router complexity. If a fresh real-browser reproduction appears, capture request/session metadata first; otherwise preserve the current production behavior and keep the regression contracts.
