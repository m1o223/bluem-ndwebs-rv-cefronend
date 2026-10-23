import { NextRequest, NextResponse } from "next/server";
import { FILE_LIMITS } from "./attachments";

const BACKEND = "https://bluemind-web-service-backend.onrender.com";
const SITE = "https://bluemind-web-service.vercel.app";
const secure = process.env.NODE_ENV === "production";
const error = (status: number, code: string) => NextResponse.json({ code }, { status, headers: { "Cache-Control": "no-store" } });

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
  const origin = request.headers.get("origin");
  const expected = secure ? SITE : new URL(request.url).origin;
  if (request.method !== "POST") return error(405, "invalid");
  if (origin !== expected) return error(403, "invalid");
  if (request.method === "POST" && request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return error(415, "invalid");
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
      headers: { Origin: SITE, "Content-Type": "application/json", ...(session ? { "x-ai-attachment-session": session } : {}) },
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
    return new Response(response.body, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store, no-transform", "X-Content-Type-Options": "nosniff" } });
  } catch { return error(503, "unavailable"); }
}
