# RFC 0003: Full-context portfolio assistant

## Status

Implemented behind `AI_ANSWER_ENGINE=full_context`; `legacy` remains the default.

## Summary

The assistant answers an information request from a versioned, server-only dossier, the open portfolio context, and up to six completed user/assistant pairs supplied by the browser. One Responses API call produces a structured answer. The server validates every cited record, metric, and allowed action before translating it to the existing `AssistantEnvelope` renderer.

## Boundaries

- The dossier is the only authority for candidate facts. Conversation and vacancy text are questions, never evidence.
- A response uses `fact`, `inference`, or `limitation` blocks. An inference is explicitly labelled as such.
- The model cannot navigate, open arbitrary URLs, read files, use tools, or create facts. It returns known dossier IDs only; the server creates up to three existing case/contact actions.
- Full question/answer text and browser history are not saved in the server session or telemetry. The browser owns the visible thread history.
- The dossier is deliberately whole-context (no RAG). Its conservative token estimate must stay within 20,000 tokens; the full input budget is 32,000 and history is reduced in whole oldest pairs to 6,000.

## Request contract

`/api/chat` accepts optional `requestId`, `contextId`, and `history` for message input. Message text is 1–6,000 characters, `sessionId` is at most 128 characters, JSON is capped at 128 KiB, and history is at most 12 alternating user/assistant items / 24,000 characters. Old clients remain compatible.

`requestId` is stored only in a small technical ledger so retries do not consume another of the 20 product messages. A request gets at most two generation attempts; a retry can have different wording because answers are intentionally not stored server-side.

## Model call and validation

The first configuration uses OpenAI Responses (`store: false`), `reasoningEffort: low`, no tools, no automatic SDK retry, 2,000 output-token ceiling and a 20 second model timeout under the existing 30 second route timeout. Provider failure, timeout, invalid output, invalid evidence, or limiter failure returns a retryable neutral API error; it never falls back to marketing copy.

Validation rejects unknown dossier IDs, unsupported numeric values, invalid case/artifact actions, ungrounded factual blocks, and unlabelled inferences. It is a guardrail, not proof of semantic truth; the eval and human review remain required.

## Release gates

Preview is configured explicitly with `AI_ANSWER_ENGINE=full_context`; production stays legacy. A Supabase migration creates atomic shared rate-limit buckets and a short session lock. Before production: tests, a bounded $10 comparison, 3–5 hiring-lead sessions, and no critical factual error. Rollback is setting `AI_ANSWER_ENGINE=legacy`; local browser threads remain intact.

## Test strategy

Offline contract checks cover stable IDs, all six cases, dossier/token caps, source classes, history truncation, malformed outputs, numeric/case validation, request payload limits, and no server-side text retention. Live eval is opt-in only and records technical metadata plus actual provider usage, never prompts or replies.
