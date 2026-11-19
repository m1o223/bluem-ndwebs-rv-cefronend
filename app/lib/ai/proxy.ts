import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { FILE_LIMITS } from "./attachments";

const BACKEND = "https://bluemind-web-service-backend.onrender.com";
const SITE = "https://bluemindwebservice.com";
const TEST_SITE = process.env.TEST_SITE === "true";
const ALLOWED_SITES = new Set([SITE, "https://bluemindwebservice.com", "https://www.bluemindwebservice.com"]);
export const AI_VISITOR_COOKIE = "__Host-bluemind_ai_visitor";
const CUSTOMER_COOKIE = "__Host-bluemind_customer";
const VISITOR_MAX_AGE = 60 * 60 * 24 * 30;
const secure = process.env.NODE_ENV === "production";
const error = (status: number, code: string) => NextResponse.json({ code }, { status, headers: { "Cache-Control": "no-store" } });
function cookieValue(request: Request, name: string) {
  const cookies = request.headers.get("cookie") || "";
  const pair = cookies.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return pair ? pair.slice(name.length + 1) : "";
}
function validToken(value: string) { return /^[a-f0-9]{64}$/.test(value); }
function visitorCookie(token: string) { return `${AI_VISITOR_COOKIE}=${token}; Path=/; Max-Age=${VISITOR_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`; }
function requestIdentity(request: Request, visitorToken: string) {
  const customer = cookieValue(request, CUSTOMER_COOKIE);
  return {
    ...(validToken(customer) ? { Authorization: `Bearer ${customer}` } : {}),
    ...(validToken(visitorToken) ? { "x-ai-visitor-token": visitorToken } : {}),
  };
}

function isTestRequest(request: NextRequest) {
  return TEST_SITE || request.nextUrl.hostname.endsWith(".vercel.app");
}

function testResponse(request: NextRequest) {
  const locale = (request.headers.get("accept-language") || "").toLowerCase();
  const text = locale.startsWith("ar")
    ? "رد تجريبي: أستطيع مساعدتك في ترتيب فكرة موقعك، واختيار الصفحات التي تحتاجها، وتجهيز تفاصيل مشروعك."
    : locale.startsWith("sv")
      ? "Testsvar: Jag kan hjälpa dig att strukturera din webbplatsidé, välja sidor och förbereda projektdetaljer."
      : "Test response: I can help organize your website idea, choose the pages you need, and prepare your project details.";
  const encoder = new TextEncoder();
  const words = text.split(" ");
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (let index = 0; index < words.length; index += 1) {
          controller.enqueue(encoder.encode(JSON.stringify({ type: "delta", text: `${index ? " " : ""}${words[index]}` }) + "\n"));
          await new Promise(resolve => setTimeout(resolve, 28));
        }
        controller.enqueue(encoder.encode('{"type":"done"}\n'));
        controller.close();
      } catch { controller.error(new Error("test stream failed")); }
    },
  });
  return new Response(stream, { status: 200, headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store, no-transform", "X-Content-Type-Options": "nosniff" } });
}

async function readBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) throw new Error("invalid");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid");
  const chunks: Uint8Array[] = [];
  let size = 0;
  let expired = false;
  const timer = setTimeout(() => { expired = true; void reader.cancel().catch(() => {}); }, 15000);
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
export async function proxyAi(request: NextRequest) {
  const testSite = isTestRequest(request);
  const origin = request.headers.get("origin");
  if (request.method !== "POST") return error(405, "invalid");
  const requestOrigin = new URL(request.url).origin;
  if (!origin || (secure ? (testSite ? origin !== requestOrigin : !ALLOWED_SITES.has(origin)) : origin !== requestOrigin)) return error(403, "invalid");
  if (request.method === "POST" && request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return error(415, "invalid");
  if (testSite) {
    await request.clone().text().catch(() => "");
    return testResponse(request);
  }
  let body: string | undefined;
  let attachments = false;
  try {
    body = await readBody(request, FILE_LIMITS.bodyBytes);
    const parsed = JSON.parse(body);
    attachments = Array.isArray(parsed?.messages) && parsed.messages.some((message: { attachments?: unknown[] }) => message?.attachments?.length);
    if (!attachments && Buffer.byteLength(body) > 80000) return error(400, "invalid");
  }
  catch { return error(400, "invalid"); }
  try {
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(60000)]);
    const existingVisitor = cookieValue(request, AI_VISITOR_COOKIE);
    const visitorToken = validToken(existingVisitor) ? existingVisitor : randomBytes(32).toString("hex");
    let session = "";
    if (attachments) {
      // Anonymous upload authorization stays server-to-server, never in the browser bundle.
      const authorization = await fetch(`${BACKEND}/api/ai/attachment-session`, { method: "POST", body: "{}", redirect: "error", cache: "no-store",
        headers: { Origin: SITE, "Content-Type": "application/json" }, signal });
      if (!authorization.ok) return error(authorization.status === 429 ? 429 : 503, authorization.status === 429 ? "rate" : "unavailable");
      const value = await authorization.json();
      if (typeof value?.token !== "string" || !/^[A-Za-z0-9_.-]{50,150}$/.test(value.token)) return error(503, "unavailable");
      session = value.token;
    }
    const response = await fetch(`${BACKEND}/api/ai/chat`, {
      method: request.method, body, redirect: "error", cache: "no-store",
      headers: { Origin: SITE, "Content-Type": "application/json", ...requestIdentity(request, visitorToken),
        ...(session ? { "x-ai-attachment-session": session } : {}),
        ...(request.headers.get("x-ai-conversation-id") ? { "x-ai-conversation-id": request.headers.get("x-ai-conversation-id")! } : {}),
        ...(request.headers.get("x-ai-source") ? { "x-ai-source": request.headers.get("x-ai-source")! } : {}) },
      signal,
    });
    if (!response.ok) {
      const value = await response.json().catch(() => null);
      const allowed = ["invalid", "unavailable", "failed", "timeout", "rate", "attachment_invalid", "attachment_limit", "attachment_session"];
      const result = error(response.status, allowed.includes(value?.code) ? value.code : "failed");
      if (response.status === 429) result.headers.set("Retry-After", "60");
      return result;
    }
    if (!response.headers.get("content-type")?.startsWith("application/x-ndjson")) {
      await response.body?.cancel();
      return error(502, "failed");
    }
    const result = new Response(response.body, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store, no-transform", "X-Content-Type-Options": "nosniff" } });
    if (!validToken(existingVisitor)) result.headers.set("Set-Cookie", visitorCookie(visitorToken));
    return result;
  } catch { return error(503, "unavailable"); }
}

export async function proxyConversations(request: NextRequest, path = "") {
  const testSite = TEST_SITE || request.nextUrl.hostname.endsWith(".vercel.app");
  const origin = request.headers.get("origin");
  // Same-origin GET requests commonly omit Origin (notably in Safari). The
  // backend still requires the customer/visitor identity, so an absent
  // Origin is safe here; explicit cross-site origins remain rejected.
  const fetchSite = request.headers.get("sec-fetch-site");
  const requestOrigin = new URL(request.url).origin;
  if (fetchSite === "cross-site" || (origin && (secure ? (testSite ? origin !== requestOrigin : !ALLOWED_SITES.has(origin)) : origin !== requestOrigin))) return error(403, "invalid");
  if (request.method !== "GET") return error(405, "invalid");
  if (testSite) return path ? error(404, "invalid") : NextResponse.json({ conversations: [] }, { headers: { "Cache-Control": "no-store, private" } });
  const visitorToken = cookieValue(request, AI_VISITOR_COOKIE);
  try {
    const response = await fetch(`${BACKEND}/api/ai/conversations${path}`, {
      method: "GET", redirect: "error", cache: "no-store", headers: { Origin: SITE, ...requestIdentity(request, visitorToken) },
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(15000)]),
    });
    const body = await response.json().catch(() => ({ code: "failed" }));
    return NextResponse.json(body, { status: response.status, headers: { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" } });
  } catch { return error(503, "unavailable"); }
}
