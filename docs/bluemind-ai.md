# BlueMind AI: Render integration preparation

The website sends JSON directly to the existing Render service
`bluemind-web-service-backend` at `/api/ai/chat`. Render calls the OpenAI Responses
API and streams normalized events back to the browser. Existing design, local
conversation history, context, cancellation and explicit retry behavior remain.
This implementation is prepared locally; it is not evidence of a live deployment.

## Frontend configuration

Set Vercel Preview `NEXT_PUBLIC_AI_API_BASE_URL` to
`https://bluemind-web-service-backend.onrender.com` and rebuild the Preview.
The public variable contains only the origin, never a key. Keep the existing
general `NEXT_PUBLIC_API_BASE_URL` unchanged. Requests omit cookies and reject
redirects. They never fall back to Vercel after a Render error.

A configured URL is not proof that Render credentials or billing work. Missing or
invalid configuration produces a safe error, not a fabricated assistant response.

The Vercel implementation is retained dormant until real Render verification.
It requires explicit `AI_LEGACY_VERCEL_ENABLED=true`, is disabled in Production,
and is disabled whenever the Render URL is set. Leave the opt-in off. Do not
configure OpenAI secrets on Vercel for this migration. Remove the legacy path only
after a successful real Render request and separately reviewed cleanup.

## Backend configuration

Use the existing service's Environment editor to securely configure:

- `OPENAI_API_KEY`: a new private project key, never the previously exposed key.
- `OPENAI_MODEL`: `gpt-5.4-mini`, subject to project access verification.
- `AI_ENABLED`: `false` until approved activation, then `true`.
- `AI_ALLOWED_ORIGINS`: exact approved Preview origins, comma-separated, with
  HTTPS and no trailing slash, path or wildcard.

Do not change general backend CORS to accommodate AI. The new route has its own
allowlist. No production origin, service deployment or environment change is
approved by these files. The backend repository's `docs/ai-integration.md`
describes staged activation, limits, monitoring and rollback.

CORS is not authentication. Protected Vercel Preview does not protect a public
Render endpoint from scripts. Current quotas are bounded, in-process, reset on
restart and may group clients behind a Render proxy. They are not a distributed
limiter or hard spending cap. Public activation needs a separate abuse-control
and provider usage review.

## Verification

Run `npm run test:ai-server`, `npm run typecheck`, `npm run build` and
`npm run test:ask-ai` with no Render URL for the existing isolated UI regressions.
The additional separate-process browser suite exercises a real cross-origin Node
HTTP connection, with a clearly labeled injected test provider:

```powershell
$env:NEXT_PUBLIC_AI_API_BASE_URL='http://127.0.0.1:4198'
npm.cmd run build
$env:AI_TEST_BACKEND_DIR='<absolute path to the prepared backend>'
npm.cmd run test:render-ai
Remove-Item Env:NEXT_PUBLIC_AI_API_BASE_URL
Remove-Item Env:AI_TEST_BACKEND_DIR
```

The fixture binds loopback only and refuses Render/Vercel execution. It does not
call OpenAI. Restore the intended environment and rebuild after fixture testing.
Backend tests independently cover provider errors, validation, streaming,
cancellation, upload limits, rate limits and unchanged existing routes.

After an approved Render deployment and fresh credential configuration, run the
existing Playwright suite against the protected Preview with `AI_LIVE_TEST=true`,
filtering `REAL OpenAI`. The smoke test sends two billed requests. The acceptance
test adds 11 paced requests covering identity, website planning, memory, general
knowledge, Swedish, Arabic, text-only capabilities and truthful model attribution.
Review actual answers, not just keyword assertions. Keep scoped Vercel protection
headers restricted to the Preview origin; never forward them to Render.

No real-provider success is claimed until those tests pass. API errors never show
raw private diagnostics, and no runtime mock fallback exists in the application.
