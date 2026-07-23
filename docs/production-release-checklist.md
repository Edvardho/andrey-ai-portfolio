# Production Release Checklist

Use this checklist before sharing the portfolio with external testers.

## Vercel

- Deploy a reviewed commit to the `Production` environment, not a preview deployment.
- Confirm the public production domain opens in a private/incognito desktop window without a Vercel login.
- Set `AI_MODE=live`.
- Set `OPENAI_API_KEY` and the intended `OPENAI_MODEL`.
- Set the Supabase URL, server/service-role key, and session table used by the session store. Production does not fall back to in-memory sessions; a store outage must return a retryable 503 instead of losing the active case context.
- Redeploy after changing environment variables.

## Automated Gate

```bash
npm run verify:assistant-v1
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
