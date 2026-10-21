# BlueMind AI: protected Preview integration

The website's Next.js Node route `/api/ai/chat` calls the official OpenAI SDK and
Responses API. The browser calls only that same-origin route. The existing Render
order/payment API, mobile app backend, authentication and database are untouched.

## Configuration

Revoke any key previously posted in chat. Create a dedicated replacement project
key and configure it directly in Vercel, never in source code or chat:

- Project: `bluemind-web-service`
- Environment: Preview only
- Git branch: `preview/about-exterior-3d`
- `OPENAI_API_KEY`: replacement key, Secret/Sensitive type
- `AI_ENABLED`: `true`
- `OPENAI_MODEL`: optional, defaults to `gpt-5.4-mini`

Redeploy that Preview after changing its environment. Do not set a public-prefixed
key. For local development put these values in `.env.local`, which is gitignored.
`.env.example` intentionally contains no key and disables AI by default.

The endpoint is hard-disabled whenever `VERCEL_ENV=production`, regardless of
credentials or enable flag. Removing that guard requires a separately approved
Production release and security review. Do not promote this Preview automatically.

## Security and limitations

- Protected Vercel Preview is required. Do not disable Deployment Protection.
- Strict same-origin JSON POSTs; no permissive CORS and no user-selected model,
  system prompt, response ID, tool or provider URL.
- 80 KB streamed body limit and five-second body-read timeout.
- User messages: 4,000 characters; context: 20 turns / 18,000 characters.
- Output: 2,000 tokens, additionally capped at 12,000 displayed characters.
- 55-second server deadline; disconnect and navigation abort the provider request.
- SDK retries are disabled to avoid automatic repeated paid requests.
- Per-instance limits: 10 requests/minute/client, one concurrent request/client,
  four concurrent requests total, 200 requests/day; bounded temporary hashed-IP map.
  These reset on process restart and are NOT distributed rate limits or a hard
  spending cap. A shared limiter and provider project budgets/spend controls are
  required before public Production use. Origin validation is not authentication.
- No tools, browsing, uploads or private database access. Model text is rendered as
  React text, never HTML. Messages are not written to app logs or a database.
- `store:false` disables Responses application-state storage. This is not a claim
  of zero provider retention; OpenAI account data policies still apply.
- The UI informs users that messages go to OpenAI and discourages sensitive input.
- Company grounding is imported from existing package, Care plan and Care FAQ
  sources. No guarantee that a model is hallucination-free; review company answers.
- Requests may consume tokens before cancellation/failure. Logs emit only request
  ID, outcome, duration, allowlisted failure category/status and completed-response token counts. Use OpenAI project
  usage reporting for full billing, including interrupted/failed requests.

## Verification

`npm run test:ai-server`: isolated SDK/endpoint/security tests, no billed calls.
`npm run test:ask-ai`: layout and client tests with explicitly labeled test-only
fixtures. No runtime mock mode or fallback assistant responses ship in the app.
`npm run typecheck` and `npm run build`: frontend/server compilation.

After configuring a replacement key, run the existing Playwright config against
the exact protected Preview URL with `AI_LIVE_TEST=true` and filter `REAL OpenAI`.
The smoke test sends two billed requests and verifies a real reply plus follow-up context.
The acceptance test adds 11 paced real requests for introductions, BlueMind identity,
website/restaurant planning, memory, general knowledge, Swedish, Arabic, text-only
capabilities and truthful model attribution. Review its response artifact for quality;
keyword assertions alone do not establish personality quality or factual accuracy.
Use scoped Vercel OIDC headers; never record secret-bearing traces. Do not claim
live functionality until this real-provider test succeeds.

History is session-memory only. New Chat starts with no old context. Older context
is bounded; incomplete responses are labeled and excluded from follow-ups.
Switching chats cancels in-flight work; retry requires an explicit user click.

## Operational diagnosis

Missing configuration returns HTTP 503 before any OpenAI call. Once per server
instance, a safe `bluemind_ai` log identifies `missing_api_key`, `feature_disabled`
or `production_disabled`. No secret values are logged or returned to the browser.
Provider failures have allowlisted diagnostics: authentication (401), permission
(403), unavailable model (404), invalid request (400/422), rate limit (429), quota,
connection, timeout or incomplete response. Quota exhaustion is not described as
a one-minute rate limit. Raw provider messages, headers and request bodies are never
logged. An enabled flag is not proof of successful API authentication or available
billing; verify with the opt-in real tests after saving and redeploying credentials.

The assistant is general-purpose with website design/development expertise. Its
server instructions keep BlueMind branding, multilingual friendly responses,
non-pushy customer help, honest underlying-model attribution and text-only limits.

Official implementation references:
- https://developers.openai.com/api/docs/guides/streaming-responses
- https://developers.openai.com/api/docs/models/gpt-5.4-mini
