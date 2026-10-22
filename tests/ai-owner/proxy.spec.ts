import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";
import { proxyAi } from "../../app/lib/ai/owner-proxy";

const origin = "https://bluemind-web-service.vercel.app";
const token = "t".repeat(43);
const cookie = process.env.NODE_ENV === "production" ? "__Host-bluemind_ai_owner" : "bluemind_ai_owner";
const realFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = realFetch; });
function req(path: string, method: string, body?: unknown, authenticated = false, source = origin) {
  return new NextRequest(`${origin}/api/ai/${path}`, { method, headers: { Origin: source, "Content-Type": "application/json", ...(authenticated ? { Cookie: `${cookie}=${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
}

test("owner proxy never forwards public, cross-site, or oversized requests", async () => {
  let called = false;
  globalThis.fetch = async () => { called = true; throw Error("Must not call Render"); };
  expect((await proxyAi(req("chat", "POST", { messages: [] }), false)).status).toBe(401);
  expect((await proxyAi(req("session", "POST", {}, false, "https://evil.test"), true)).status).toBe(403);
  expect((await proxyAi(req("session", "POST", { password: "x".repeat(3000) }), true)).status).toBe(400);
  expect(called).toBe(false);
});

test("session token is HttpOnly and never appears in browser JSON", async () => {
  globalThis.fetch = async (url, options) => {
    expect(String(url)).toBe("https://bluemind-web-service-backend.onrender.com/api/ai/session");
    expect(new Headers(options?.headers).get("origin")).toBe(origin);
    expect(options?.redirect).toBe("error");
    return Response.json({ token, expiresIn: 1800 });
  };
  const response = await proxyAi(req("session", "POST", { email: "fixture@example.test", password: "fixture-only" }), true);
  expect(await response.json()).toEqual({ authenticated: true });
  expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  expect(response.headers.get("set-cookie")).toMatch(/SameSite=strict/i);
  expect(response.headers.get("cache-control")).toBe("no-store");
});

test("chat forwards only AI session token and preserves streamed context", async () => {
  const body = { messages: [{ role: "user", content: "hello" }] };
  globalThis.fetch = async (url, options) => {
    expect(String(url)).toMatch(/\/api\/ai\/chat$/);
    const headers = new Headers(options?.headers);
    expect(headers.get("authorization")).toBe(`Bearer ${token}`);
    expect(headers.get("cookie")).toBeNull();
    expect(JSON.parse(String(options?.body))).toEqual(body);
    return new Response('{"type":"delta","text":"fixture"}\n{"type":"done"}\n', { headers: { "Content-Type": "application/x-ndjson" } });
  };
  const response = await proxyAi(req("chat", "POST", body, true), false);
  expect(response.status).toBe(200);
  expect(await response.text()).toContain('"done"');
});

test("upstream secrets and errors are sanitized; expiry and logout clear cookie", async () => {
  globalThis.fetch = async () => Response.json({ code: "private-stack-trace" }, { status: 401 });
  const expired = await proxyAi(req("chat", "POST", { messages: [] }, true), false);
  expect(await expired.json()).toEqual({ code: "failed" });
  expect(expired.headers.get("set-cookie")).toContain("Max-Age=0");
  globalThis.fetch = async () => { throw Error("private-key-or-provider-detail"); };
  const failed = await proxyAi(req("chat", "POST", { messages: [] }, true), false);
  expect(await failed.json()).toEqual({ code: "unavailable" });
  globalThis.fetch = async () => Response.json({ code: "signed_out" });
  const logout = await proxyAi(req("session", "DELETE", undefined, true), true);
  expect(logout.headers.get("set-cookie")).toContain("Max-Age=0");
});
