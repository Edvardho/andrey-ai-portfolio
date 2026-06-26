# AI Portfolio Assistant

Desktop-only V1 backend and local MVP shell for Андрей Макаревич's portfolio assistant.

This is not a generic chat app. The contract is a **stateful portfolio assistant** that returns explicit UI states:

- `entry`
- `case_summary`
- `case_detail`
- `case_route`
- `experience_summary`
- `experience_detail`
- `experience_route`
- `mobile_experience_overview`
- `mobile_case_summary`
- `mobile_case_detail`
- `additional_cases_overview`
- `contact_modal`
- `image_modal`
- `loading`
- `ambiguous_question`
- `no_matching_case`
- `safety_refusal`
- `limit_reached`

## Product boundaries

- Desktop-only in V1.
- Russian-only content in V1.
- `gpt-4o-mini` by default.
- 20 user messages per session, then redirect to contact flow.
- Safety states are first-class: toxic, prompt injection, private/salary, unsupported, ambiguous.

## Stack

- Next.js App Router
- Tailwind CSS v4
- AI SDK + OpenAI provider
- Supabase for session persistence when configured
- In-memory fallback store for local MVP

## Environment

Copy `.env.example` into `.env.local` and fill the values:

```bash
cp .env.example .env.local
```

Required for model classification:

- `OPENAI_API_KEY`

Optional for persistence:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SESSION_TABLE`

Do not use a public anon key for server-side session persistence in production. The current backend writes server state and should use a server-only key.

## Important security note

If you ever pasted a real OpenAI key into chat or Git history, rotate it immediately. Do not keep compromised keys in local env files, docs, screenshots, or commits.

## Supabase schema

Apply:

```sql
\i supabase/schema.sql
```

Or copy the SQL from `/supabase/schema.sql` into the Supabase SQL editor.

## Run locally

Use a writable npm cache if your default cache has permission issues:

```bash
export npm_config_cache=/Users/amakarevich/Desktop/My_Startap/.npm-cache
npm install
npm run dev
```

## Verification

```bash
npm run typecheck
npm run smoke
```

`npm run verify` runs both.

## API surface

### `GET /api/assistant/bootstrap`
Returns the initial desktop entry state.

### `POST /api/chat`
Accepts:

```json
{
  "sessionId": "optional-session-id",
  "input": {
    "type": "message",
    "text": "Расскажи про самый сильный кейс"
  }
}
```

Or:

```json
{
  "sessionId": "optional-session-id",
  "input": {
    "type": "action",
    "action": {
      "type": "open_case_summary",
      "caseId": "alfa-smart"
    }
  }
}
```

Returns an `AssistantEnvelope` with explicit UI intent instead of freeform chat prose.

## Content model

The source of truth is split by responsibility:

- `/src/data/portfolio-index.ts` — lightweight index for entry and case discovery.
- `/src/data/cases/*.ts` — per-case presentation content, images, and layout metadata.
- `/src/data/portfolio-case-facts.ts` — normalized AI fact layer for case-aware synthesis.
- `/src/data/portfolio-facts.ts` — global person-level facts and synthesis topics.
- `/src/lib/portfolio/types.ts` — shared contracts for the assistant and UI state.

Legacy flat `portfolio-content.ts` is intentionally removed.
