# Production Release Checklist

Use this checklist before sharing the portfolio with external testers.

## Vercel

- Deploy a reviewed commit to the `Production` environment, not a preview deployment.
- Confirm the public production domain opens in a private/incognito desktop window without a Vercel login.
- Set `AI_MODE=live`.
- Keep `AI_ANSWER_ENGINE=legacy` in Production until the frozen eval and 3–5 hiring-lead sessions pass. Preview uses `AI_ANSWER_ENGINE=full_context` and `AI_FULL_CONTEXT_MODEL=gpt-5.4-mini`.
- Set `OPENAI_API_KEY` and the intended `OPENAI_MODEL`.
- Set a private `RATE_LIMIT_HMAC_SECRET` and apply `supabase/migrations/20260906_full_context_ai_rate_limits.sql` before enabling full context.
- Set the Supabase URL, server/service-role key, and session table used by the session store. Production does not fall back to in-memory sessions; a store outage must return a retryable 503 instead of losing the active case context.
- Redeploy after changing environment variables.

## Automated Gate

```bash
npm run verify:assistant-v1
npm run verify:assistant-backend-reliability
npm run verify:assistant-api-reliability
npm run verify:full-context-rate-limit
npm run verify:full-context-assistant
npm run verify:full-context-eval
npm run verify:dossier-export
npm run smoke
npm run test:runtime
npm run build
DEPLOYMENT_SMOKE_URL="https://your-production-domain.vercel.app" npm run smoke:deployment
```

The deployment smoke must report `AI_MODE=live` and `sessionStoreMode=supabase`. A fallback or memory mode is not a valid release state for external testing.

## Manual Desktop QA

Run this in Chrome and Safari on macOS at `1280px`, `1440px`, and `1680px` widths.

- Open the landing page and each of the six cases.
- Check first and repeated case transitions, skeletons, context panel, horizontal galleries, and image modals.
- Scroll long cases to the end; content must not go behind the composer.
- Click the header name to return to the landing page.
- Check the composer: gray and disabled when empty; black with a white arrow after text is entered.
- Ask: `Нравится ли Андрею работа дизайнером?`, `Какую ошибку совершил Андрей на ChatPoint?`, `Что делал в web?`, and `Что делал в мобилке?`.
- In an opened SIEBEL case, ask both `Коротко расскажи о кейсе` and `Емко расскажи о кейсе`; both must return a SIEBEL summary.
- Check the contact CTA and the 20-message limit.

Do not share a link until every item above passes.
