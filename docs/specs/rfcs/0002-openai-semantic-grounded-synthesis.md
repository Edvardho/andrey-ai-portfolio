# RFC 0002: OpenAI semantic routing and grounded synthesis

## Status

Proposed. The feature is disabled by default and is introduced behind two server-side flags.

## Goal

Allow OpenAI to understand free-form Russian questions, while keeping case scope, session state,
allowed facts, and the right to show an answer under deterministic backend control.

## Configuration

- `AI_SEMANTIC_ROUTER_MODE=off|shadow|active` (default `off`)
- `AI_GROUNDED_OUTPUT_MODE=legacy|shadow|v2` (default `legacy`)
- `OPENAI_ROUTER_MODEL`, falling back to `OPENAI_MODEL`
- `OPENAI_SYNTHESIS_MODEL`, falling back to `OPENAI_MODEL`

The production model is not changed automatically. Candidate model IDs must pass the same quality,
latency, token, and cost gates before promotion.

Each request has a `ModelExecutionBudget`: at most two provider calls and a twelve-second total
deadline. Router work is capped at 2.5 seconds; synthesis receives only the remaining budget. Shadow
is forcibly disabled in Production. In v2, timeout, invalid structured output, or validator failure
returns the authored fallback and never makes a second legacy synthesis call.

## Authority and boundaries

The model may interpret language and draft a fact-grounded answer. It may not execute UI actions,
change the selected case, mutate the session, choose a scope, or introduce facts. The server policy
resolver remains authoritative in this order: explicit named case, explicit portfolio-wide scope,
selected case, last valid case context, then clarification.

Safety, message limits, gratitude, trust challenges, and explicit navigation guards run before model
interpretation. A router timeout or malformed output uses the existing deterministic path.

## Semantic candidate

The router returns a strict internal candidate containing intent, question subject, scope hint,
optional named case, response length, clarification need, and confidence. In `shadow` the candidate
is compared with the existing interpretation and never changes the user-visible answer. In `active`
it may resolve genuinely free-form language, but server cues and context precedence still win.

## Grounded synthesis

Facts are assigned stable server-side IDs in the form `caseId:facet:index`. A v2 draft includes
supporting fact IDs for each meaningful block, including titles. Before rendering, the server verifies that every ID
exists, belongs to the permitted scope, supports every new numeric claim, and does not introduce a
foreign case. Any failure returns the existing authored/fact-constrained fallback. The public chat
contract, session envelope, Supabase table, and UI components remain unchanged.

OpenAI conversation state and reasoning are not persisted. Supabase remains the source of session
context. Production Supabase failures continue to return retryable `503 SESSION_STORE_UNAVAILABLE`.

## Rollout and release gates

1. Run deterministic and validator tests with `off/legacy`.
2. Enable router `shadow` on Preview and compare agreement, p95 latency, tokens, and cost.
3. Enable `active/legacy` on Preview, then `active/v2` after a curated live eval.
4. Promote router first in Production; promote grounded output only after clean smoke tests.

Required gates are full `verify:assistant-v1`, typecheck, build, runtime smoke, no cross-case facts,
no unsupported new metrics, 98% release-core routing, and 90% dirty-Russian routing. Telemetry may
contain only technical metadata such as intent, scope, model, latency, token usage, and fallback
reason; production question text is not logged.
