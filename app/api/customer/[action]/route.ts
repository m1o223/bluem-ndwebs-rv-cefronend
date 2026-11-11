import { NextRequest, NextResponse } from "next/server";
import { CUSTOMER_COOKIE, CUSTOMER_TTL, customerRequest, isCustomer } from "../../../lib/customer/session";

export const dynamic = "force-dynamic";
const result = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" } });
const cookie = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };
async function handler(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  if (action !== "login" && action !== "logout" && action !== "session" && action !== "overview" && action !== "messages" && action !== "messages-read" && action !== "message" && action !== "profile" && action !== "contact" && action !== "password") return result({ code: "missing" }, 404);
  const readOnly = action === "session" || action === "overview" || action === "messages";
  if (request.method !== (readOnly ? "GET" : "POST")) return result({ code: "method" }, 405);
  if (!readOnly) {
    const origin = request.headers.get("origin");
    const allowed = process.env.VERCEL ? ["https://bluemindwebservice.com", "https://www.bluemindwebservice.com"] : [request.nextUrl.origin];
    if (!origin || origin !== request.nextUrl.origin || !allowed.includes(origin) || request.headers.get("sec-fetch-site") === "cross-site") return result({ code: "forbidden" }, 403);
  }
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (action !== "login" && action !== "logout" && !token) return result({ code: "credentials" }, 401);
  let body: string | undefined;
  if (action === "login" || action === "profile" || action === "contact" || action === "password" || action === "message" || action === "messages-read") {
    const maximum = action === "login" ? 2048 : 20000;
    if (request.headers.get("content-type")?.split(";")[0] !== "application/json" || Number(request.headers.get("content-length")) > maximum) return result({ code: "invalid" }, 400);
    const reader = request.body?.getReader();
    if (!reader) return result({ code: "invalid" }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0, expired = false;
    const timer = setTimeout(() => { expired = true; void reader.cancel(); }, 10000);
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (expired) throw new Error("timeout");
        if (done) break;
        size += value.length;
        if (size > maximum) throw new Error("size");
        chunks.push(value);
      }
      const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      if (action === "login") {
        if (typeof parsed.email !== "string" || typeof parsed.password !== "string" || parsed.email.length > 254 || Buffer.byteLength(parsed.password) > 72) throw new Error("invalid");
        body = JSON.stringify({ email: parsed.email, password: parsed.password, ...(["private", "company"].includes(parsed.customerType) ? { customerType: parsed.customerType } : {}) });
      } else body = JSON.stringify(parsed);
    } catch { return result({ code: "invalid" }, 400); }
    finally { clearTimeout(timer); await reader.cancel().catch(() => {}); reader.releaseLock(); }
  }
  try {
    const upstream = await customerRequest(action, token, body, request.signal);
    if (!upstream.ok) {
      const code = upstream.status === 401 ? "credentials" : upstream.status === 429 ? "rate" : upstream.status === 400 ? "invalid" : "unavailable";
      const response = result({ code }, [400, 401, 429].includes(upstream.status) ? upstream.status : 503);
      if (upstream.status === 429) response.headers.set("Retry-After", "900");
      if (action === "session" && upstream.status === 401) response.cookies.set(CUSTOMER_COOKIE, "", { ...cookie, maxAge: 0 });
      return response;
    }
    if (action === "logout" || action === "password") {
      const response = result({ success: true });
      response.cookies.set(CUSTOMER_COOKIE, "", { ...cookie, maxAge: 0 });
      return response;
    }
    const data = await upstream.json();
    if (action === "overview") return result({ profile: data.profile, project: data.project, notifications: data.notifications });
    if (action === "messages") return result({ messages: Array.isArray(data.messages) ? data.messages : [], unread: Number.isSafeInteger(data.unread) ? data.unread : 0 });
    if (action === "messages-read") return result({ success: data.success === true });
    if (action === "message") return result({ message: data.message, duplicate: data.duplicate === true });
    if (action === "profile" || action === "contact") return result({ success: data.success === true, ...(action === "contact" ? { emailNotified: data.emailNotified === true } : {}) });
    if (!isCustomer(data.user)) return result({ code: "unavailable" }, 503);
    const response = result({ user: data.user });
    if (action === "login") {
      if (typeof data.token !== "string" || !/^[a-f0-9]{64}$/.test(data.token)) return result({ code: "unavailable" }, 503);
      response.cookies.set(CUSTOMER_COOKIE, data.token, { ...cookie, maxAge: CUSTOMER_TTL });
    }
    return response;
  } catch { return result({ code: "unavailable" }, 503); }
}
export { handler as GET, handler as POST };
