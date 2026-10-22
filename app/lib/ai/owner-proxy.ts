import { NextRequest, NextResponse } from "next/server";

const BACKEND = "https://bluemind-web-service-backend.onrender.com";
const SITE = "https://bluemind-web-service.vercel.app";
const secure = process.env.NODE_ENV === "production";
const COOKIE = secure ? "__Host-bluemind_ai_owner" : "bluemind_ai_owner";
const cookieOptions = { httpOnly: true, secure, sameSite: "strict" as const, path: "/" };
const error = (status: number, code: string) => NextResponse.json({ code }, { status, headers: { "Cache-Control": "no-store" } });

async function readBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) throw new Error("invalid");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid");
  const chunks: Uint8Array[] = [];
  let size = 0;
  let expired = false;
  const timer = setTimeout(() => { expired = true; void reader.cancel().catch(() => {}); }, 5000);
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (expired) throw new Error("timeout");
      if (done) break;
      size += value.length;
      if (size > limit) throw new Error("invalid");
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString("utf8");
  } finally { clearTimeout(timer); await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

// This route forwards only AI traffic. The OpenAI key and execution stay on Render.
export async function proxyAi(request: NextRequest, session: boolean) {
  const origin = request.headers.get("origin");
  const expected = secure ? SITE : new URL(request.url).origin;
  if ((request.method === "POST" || request.method === "DELETE") && origin !== expected) return error(403, "invalid");
  const token = request.cookies.get(COOKIE)?.value;
  if ((!session || request.method === "GET") && !token) return error(401, "unauthorized");
  if (request.method === "POST" && request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return error(415, "invalid");
  let body: string | undefined;
  try { if (request.method === "POST") body = await readBody(request, session ? 2048 : 80000); }
  catch { return error(400, "invalid"); }
  try {
    const response = await fetch(`${BACKEND}/api/ai/${session ? "session" : "chat"}`, {
      method: request.method, body, redirect: "error", cache: "no-store",
      headers: { Origin: SITE, "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(session ? 15000 : 60000)]),
    });
    if (!response.ok) {
      const value = await response.json().catch(() => null);
      const allowed = ["invalid", "unavailable", "unauthorized", "failed", "timeout", "rate"];
      const result = error(response.status, allowed.includes(value?.code) ? value.code : "failed");
      if (response.status === 401) result.cookies.set(COOKIE, "", { ...cookieOptions, maxAge: 0 });
      if (response.status === 429) result.headers.set("Retry-After", "60");
      return result;
    }
    if (session) {
      const value = await response.json();
      const result = NextResponse.json({ authenticated: request.method !== "DELETE" }, { headers: { "Cache-Control": "no-store" } });
      if (request.method === "POST") {
        if (typeof value.token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value.token)) return error(502, "failed");
        result.cookies.set(COOKIE, value.token, { ...cookieOptions, maxAge: 1800 });
      }
      if (request.method === "DELETE") result.cookies.set(COOKIE, "", { ...cookieOptions, maxAge: 0 });
      return result;
    }
    if (!response.headers.get("content-type")?.startsWith("application/x-ndjson")) {
      await response.body?.cancel();
      return error(502, "failed");
    }
    return new Response(response.body, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store, no-transform", "X-Content-Type-Options": "nosniff" } });
  } catch { return error(503, "unavailable"); }
}
