import assert from "node:assert/strict";
import test from "node:test";
import { ChatRequestError, requestReply } from "../../app/lib/ai/client";
import { renderAiEndpoint } from "../../app/lib/ai/endpoint";

test("Render destination is explicit and cannot contain credentials, paths or unsafe protocols", () => {
  assert.equal(renderAiEndpoint("https://bluemind-web-service-backend.onrender.com"), "https://bluemind-web-service-backend.onrender.com/api/ai/chat");
  assert.equal(renderAiEndpoint("http://localhost:4198/"), "http://localhost:4198/api/ai/chat");
  for (const value of ["", "javascript:alert(1)", "http://remote.example.com", "https://user:secret@example.com", "https://example.com/private", "https://example.com?token=secret"]) assert.equal(renderAiEndpoint(value), null);
});

test("client sends to Render without cookies or automatic Vercel fallback", async () => {
  const original = globalThis.fetch;
  const old = process.env.NEXT_PUBLIC_AI_API_BASE_URL;
  process.env.NEXT_PUBLIC_AI_API_BASE_URL = "https://backend.example.com";
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(url, "https://backend.example.com/api/ai/chat");
    assert.equal(options?.credentials, "omit");
    assert.equal(options?.redirect, "error");
    assert.equal(new Headers(options?.headers).has("authorization"), false);
    return Response.json({ code: "unavailable" }, { status: 503 });
  };
  try {
    await assert.rejects(requestReply([{ role: "user", content: "Hello" }], new AbortController().signal, () => {}), ChatRequestError);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
    if (old === undefined) delete process.env.NEXT_PUBLIC_AI_API_BASE_URL;
    else process.env.NEXT_PUBLIC_AI_API_BASE_URL = old;
  }
});

test("client reconstructs split UTF-8 and NDJSON chunks in the original language", async () => {
  const original = globalThis.fetch;
  const text = "Hej! \u0645\u0631\u062d\u0628\u0627 \u{1F499}";
  const bytes = new TextEncoder().encode(`${JSON.stringify({ type: "delta", text })}\n{"type":"done"}\n`);
  globalThis.fetch = async () => new Response(new ReadableStream({ start(controller) {
    for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
    controller.close();
  } }), { headers: { "Content-Type": "application/x-ndjson" } });
  try {
    let result = "";
    await requestReply([{ role: "user", content: "Hello" }], new AbortController().signal, delta => { result += delta; });
    assert.equal(result, text);
  } finally { globalThis.fetch = original; }
});

test("client rejects incomplete or invalid replies and hides raw upstream errors", async () => {
  const original = globalThis.fetch;
  try {
    for (const response of [
      new Response('{"type":"delta","text":"Partial"}\n', { headers: { "Content-Type": "application/x-ndjson" } }),
      new Response('{"type":"done"}\n', { headers: { "Content-Type": "application/x-ndjson" } }),
      new Response("private infrastructure failure", { status: 502 }),
      Response.json({ code: "internal secret value" }, { status: 500 }),
    ]) {
      globalThis.fetch = async () => response;
      await assert.rejects(requestReply([{ role: "user", content: "Hello" }], new AbortController().signal, () => {}), error => {
        assert.ok(error instanceof ChatRequestError);
        assert.equal(error.code, "failed");
        assert.doesNotMatch(error.message, /private|secret/);
        return true;
      });
    }
  } finally { globalThis.fetch = original; }
});
