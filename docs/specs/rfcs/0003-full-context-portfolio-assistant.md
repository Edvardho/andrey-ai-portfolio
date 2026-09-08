# RFC 0003: Full-context portfolio assistant

## Status

Implemented behind `AI_ANSWER_ENGINE=full_context`; reliability revision `2026-09-08.1` is in Preview validation. `legacy` remains the default and rollback path.

## Summary

The assistant answers an information request from a versioned, server-only dossier, the open portfolio context, and up to six completed user/assistant pairs supplied by the browser. One Responses API call normally produces a structured answer. One correcting call is allowed only after a structural or evidence-validation failure and only while at least five seconds remain. The server validates every cited record, canonical metric, and allowed action before translating it to the existing `AssistantEnvelope` renderer.

## Boundaries

- The dossier is the only authority for candidate facts. Conversation and vacancy text are questions, never evidence.
- A response uses `fact`, `inference`, `limitation`, or `explanation` blocks. The presenter labels inferences and professional explanations; model wording is not used as the guardrail.
- The model cannot navigate, open arbitrary URLs, read files, use tools, or create facts. It returns known dossier IDs only; the server creates up to three existing case/contact actions.
- Full question/answer text and browser history are not saved in the server session or telemetry. The browser owns the visible thread history.
- The dossier is deliberately whole-context (no RAG). Its conservative token estimate must stay within 20,000 tokens; the full input budget is 32,000 and history is reduced in whole oldest pairs to 6,000.

## Request contract

`/api/chat` accepts optional `requestId`, `contextId`, and `history` for message input. Message text is 1–6,000 characters, `sessionId` is at most 128 characters, JSON is capped at 128 KiB, and history is at most 12 alternating user/assistant items / 24,000 characters. Old clients remain compatible.

`requestId` is stored only in a small technical ledger so retries do not consume another of the 20 product messages. A request gets at most two generation attempts; a retry can have different wording because answers are intentionally not stored server-side.

## Model call and validation

The first configuration uses OpenAI Responses (`store: false`), `reasoningEffort: low`, no tools, `maxRetries: 0`, a 2,000 output-token ceiling and a 20 second total generation budget under the existing 30 second route timeout. The first call is capped at 15 seconds. Provider failure and timeout go to manual retry; only validation failures may use the correcting call. Failure never falls back to marketing copy.

Validation rejects unknown dossier IDs, free-form numeric claims, metrics without their source record, invalid case actions, and ungrounded factual or inference blocks. Numeric wording is inserted server-side from a typed registry, so a correct number cannot be relabelled as another unit or project. An optional invalid artifact action is removed without discarding otherwise valid text. Validation remains a guardrail, not proof of semantic truth; the eval and human review remain required.

`contextId` supplied by the browser has priority for that request. Older clients without it continue from server session context. This prevents a background case switch or another tab from changing which dossier context answers the current question.

Legacy word filters run only on the legacy answer path. Full context locally blocks prompt exfiltration, while ordinary questions containing words such as «пошёл», «телефон», «приватность» or «развилки» reach the model and are answered or bounded from dossier evidence.

## Release gates

Preview is configured explicitly with `AI_ANSWER_ENGINE=full_context`; production stays legacy. A Supabase migration creates atomic shared rate-limit buckets and a short session lock. Before production: tests, a bounded $10 comparison, 3–5 hiring-lead sessions, and no critical factual error. Rollback is setting `AI_ANSWER_ENGINE=legacy`; local browser threads remain intact.

## Test strategy

Offline contract checks cover stable IDs, all six cases, real o200k token counts, source classes, history truncation, malformed outputs, numeric/case validation, request payload limits, per-attempt rate limiting, explicit context priority, strict configuration, and no server-side text retention. Live eval is opt-in only, requires an explicit remaining-dollar budget, uses synthetic sessions outside the production session table, and saves its synthetic answers locally for blind review.
