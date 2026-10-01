# BlueMind Web Service — frontend infrastructure

Temporary connectivity test only. No product features or UI design.

Requires Node.js 22. Run `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`.
Open http://localhost:3000 with the backend running on port 4000.
Validate with `npm run build` and `npm run typecheck`.

Deploy this repository root to Vercel. Set production `NEXT_PUBLIC_API_BASE_URL` to the verified HTTPS Render service origin and redeploy: public variables are embedded at build time. Never put credentials in a NEXT_PUBLIC variable. Do not use the localhost value in production.

The page performs a browser request directly to `/api/health` and validates the response. A timeout or invalid response shows Failed.
