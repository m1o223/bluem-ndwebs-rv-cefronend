import assert from "node:assert/strict";
import test from "node:test";
import { ChatRequestError, requestReply } from "../../app/lib/ai/client";

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
