import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { CUSTOMER_COOKIE, CUSTOMER_TTL, customerRequest, isCustomer } from "./session";

export const GOOGLE_SITE = "https://bluemindwebservice.com";
export const GOOGLE_CALLBACK_URL = `${GOOGLE_SITE}/api/auth/callback/google`;
const FLOW_COOKIE = "__Host-bluemind_google_flow";
const cookie = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };
const headers = { "Cache-Control": "no-store, private", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
const opaque = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const localTest = () => !process.env.VERCEL && !!process.env.CUSTOMER_AUTH_BACKEND_URL?.match(/^http:\/\/127\.0\.0\.1:\d+$/);
function validHost(request: NextRequest) { return request.nextUrl.origin === GOOGLE_SITE || localTest(); }
function fail(code: string, status = 400) { return NextResponse.json({ code }, { status, headers }); }

export async function startGoogle(request: NextRequest) {
  if (!validHost(request) || request.headers.get("origin") !== request.nextUrl.origin || request.headers.get("sec-fetch-site") === "cross-site") return fail("forbidden", 403);
  // Only an optional account type is accepted; email/password never enter this flow.
  const customerType = request.nextUrl.searchParams.get("customerType");
  try {
    const upstream = await customerRequest("google-start", undefined, JSON.stringify({ ...(["private", "company"].includes(customerType || "") ? { customerType } : {}) }), request.signal);
    if (!upstream.ok) return fail(upstream.status === 429 ? "rate" : "google_unavailable", upstream.status === 429 ? 429 : 503);
    const data = await upstream.json();
    const url = new URL(data.authorizationUrl);
    if (!opaque(data.browserToken) || url.origin !== "https://accounts.google.com" || url.pathname !== "/o/oauth2/v2/auth" || url.searchParams.get("redirect_uri") !== GOOGLE_CALLBACK_URL || !opaque(url.searchParams.get("state"))) return fail("google_unavailable", 503);
    const response = NextResponse.json({ authorizationUrl: url.href }, { headers });
    response.cookies.set(FLOW_COOKIE, data.browserToken, { ...cookie, maxAge: 600 });
    return response;
  } catch { return fail("google_unavailable", 503); }
}

export async function finishGoogle(request: NextRequest) {
  if (!validHost(request)) return fail("forbidden", 403);
  const browserToken = request.cookies.get(FLOW_COOKIE)?.value;
  const state = request.nextUrl.searchParams.get("state"), code = request.nextUrl.searchParams.get("code");
  const clear = (response: NextResponse) => { response.cookies.set(FLOW_COOKIE, "", { ...cookie, maxAge: 0 }); return response; };
  const destination = (path: string) => new URL(path, localTest() ? request.nextUrl.origin : GOOGLE_SITE);
  const failure = (reason: "cancelled" | "link_required" | "unavailable" | "failed") => {
    console.warn(JSON.stringify({ event: "customer_google_callback", outcome: reason }));
    return clear(NextResponse.redirect(destination(`/sign-in?google=${reason}`), { status: 303, headers }));
  };
  if (!opaque(state) || !opaque(browserToken)) {
    console.warn(JSON.stringify({ event: "customer_google_callback", outcome: "invalid_browser_binding", statePresent: opaque(state), flowCookiePresent: opaque(browserToken) }));
    return clear(fail("invalid_google_callback"));
  }
  if (request.nextUrl.searchParams.has("error")) return failure("cancelled");
  if (!code || code.length > 2048 || request.nextUrl.searchParams.getAll("code").length !== 1 || request.nextUrl.searchParams.getAll("state").length !== 1) return failure("failed");
  try {
    const upstream = await customerRequest("google-callback", request.cookies.get(CUSTOMER_COOKIE)?.value, JSON.stringify({ code, state, browserToken }), request.signal);
    if (!upstream.ok) return failure(upstream.status === 409 ? "link_required" : upstream.status === 503 ? "unavailable" : "failed");
    const data = await upstream.json();
    if (!opaque(data.token) || !isCustomer(data.user)) return failure("failed");
    const response = clear(NextResponse.redirect(destination("/dashboard"), { status: 303, headers }));
    response.cookies.set(CUSTOMER_COOKIE, data.token, { ...cookie, maxAge: CUSTOMER_TTL });
    console.info(JSON.stringify({ event: "customer_google_callback", outcome: "session_cookie_set", destination: "/dashboard" }));
    return response;
  } catch { return failure("unavailable"); }
}
