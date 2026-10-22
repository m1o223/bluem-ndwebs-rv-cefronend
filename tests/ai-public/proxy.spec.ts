import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";
import { proxyAi } from "../../app/lib/ai/proxy";

const origin = "https://bluemind-web-service.vercel.app";
const realFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = realFetch; });
function req(body: unknown, source = origin) {
  return new NextRequest(`${origin}/api/ai/chat`, { method: "POST", headers: { Origin: source, "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

test("public proxy rejects cross-site and oversized requests", async () => {
  let called = false;
  globalThis.fetch = async () => { called = true; throw Error("Must not call Render"); };
  expect((await proxyAi(req({}, "https://evil.test"))).status).toBe(403);
  expect((await proxyAi(req({ messages: "x".repeat(81000) }))).status).toBe(400);
  expect(called).toBe(false);
});

test("anonymous chat reaches Render without tokens and preserves streamed context", async () => {
  const body = { messages: [{ role: "user", content: "hello" }, { role: "assistant", content: "Previous reply" }, { role: "user", content: "Follow-up" }] };
  globalThis.fetch = async (url, options) => {
    expect(String(url)).toBe("https://bluemind-web-service-backend.onrender.com/api/ai/chat");
    const headers = new Headers(options?.headers);
    expect(headers.get("authorization")).toBeNull();
    expect(headers.get("cookie")).toBeNull();
    expect(headers.get("origin")).toBe(origin);
    expect(options?.redirect).toBe("error");
    expect(JSON.parse(String(options?.body))).toEqual(body);
    return new Response('{"type":"delta","text":"fixture"}\n{"type":"done"}\n', { headers: { "Content-Type": "application/x-ndjson" } });
  };
  const response = await proxyAi(req(body));
  expect(response.status).toBe(200);
  expect(await response.text()).toContain('"done"');
  expect(response.headers.get("set-cookie")).toBeNull();
});

test("rate limits and sanitized failures survive the public proxy", async () => {
  globalThis.fetch = async () => Response.json({ code: "private-stack-trace" }, { status: 502 });
  expect(await (await proxyAi(req({ messages: [] }))).json()).toEqual({ code: "failed" });
  globalThis.fetch = async () => { throw Error("private-key-or-provider-detail"); };
  expect(await (await proxyAi(req({ messages: [] }))).json()).toEqual({ code: "unavailable" });
  globalThis.fetch = async () => Response.json({ code: "rate" }, { status: 429 });
  const limited = await proxyAi(req({ messages: [] }));
  expect(limited.status).toBe(429);
  expect(limited.headers.get("retry-after")).toBe("60");
});
