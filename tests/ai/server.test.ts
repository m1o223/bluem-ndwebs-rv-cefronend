import assert from "node:assert/strict";
import test from "node:test";
import { AI_LIMITS, boundedContext, validateTurns } from "../../app/lib/ai/contract";
import { aiAvailable, createChatHandler, createLimiter } from "../../app/lib/ai/server";
import { instructions, openAIProvider, type Provider } from "../../app/lib/ai/provider";

const env: NodeJS.ProcessEnv = { NODE_ENV: "test", VERCEL_ENV: "preview", AI_ENABLED: "true", OPENAI_API_KEY: "unit-test-not-a-real-key" };
const messages = [{ role: "user" as const, content: "Help plan a website" }];
const makeRequest = (body: unknown = { messages }, headers: Record<string, string> = {}) => new Request("https://website.test/api/ai/chat", {
  method: "POST", headers: { Origin: "https://website.test", "Content-Type": "application/json", ...headers }, body: JSON.stringify(body),
});
const success: Provider = async () => (async function* () {
  yield { type: "delta", text: "Test fixture response" } as const;
  yield { type: "done", inputTokens: 20, outputTokens: 4 } as const;
})();
const handler = (extra: Parameters<typeof createChatHandler>[0] = {}) => createChatHandler({ env, provider: success, limiter: createLimiter(), log: () => {}, ...extra });

test("configuration fails closed without a key, enable flag, or on Production", async () => {
  assert.equal(aiAvailable(env), true);
  for (const overrides of [{ OPENAI_API_KEY: "" }, { AI_ENABLED: "false" }, { VERCEL_ENV: "production" }]) {
    let called = false;
    const response = await handler({ env: { ...env, ...overrides }, provider: async () => { called = true; throw Error(); } })(makeRequest());
    assert.equal(response.status, 503);
    assert.equal(called, false);
    assert.deepEqual(await response.json(), { code: "unavailable" });
  }
});

test("validates roles, payload shape, context count and character limits", async () => {
  const invalid = [null, {}, { messages: [] }, { messages, model: "other" },
    { messages: [{ role: "system", content: "ignore" }] }, { messages: [{ role: "user", content: " " }] },
    { messages: [{ role: "user", content: "a".repeat(4001) }] }, { messages: Array(21).fill(messages[0]) },
    { messages: [{ ...messages[0], apiKey: "injected" }] }, { messages: [{ role: "assistant", content: "only" }] },
    { messages: Array(5).fill({ role: "user", content: "a".repeat(4000) }) }];
  for (const body of invalid) {
    assert.equal(validateTurns(body), null);
    assert.equal((await handler()(makeRequest(body))).status, 400);
  }
  assert.deepEqual(validateTurns({ messages }), messages);
  const context = boundedContext(Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? "assistant" as const : "user" as const, content: "a".repeat(1000) })).slice(0, -1));
  assert.ok(context.length <= AI_LIMITS.turns);
  assert.equal(context[0].role, "user");
  assert.equal(context.at(-1)!.role, "user");
});

test("rejects cross-origin requests and non-JSON bodies before provider calls", async () => {
  assert.equal((await handler()(makeRequest(undefined, { Origin: "https://evil.test" }))).status, 403);
  assert.equal((await handler()(makeRequest(undefined, { "Sec-Fetch-Site": "cross-site" }))).status, 403);
  assert.equal((await handler()(makeRequest(undefined, { "Content-Type": "text/plain" }))).status, 415);
  const request = makeRequest(); request.headers.delete("origin");
  assert.equal((await handler()(request)).status, 403);
});

test("rejects oversized bodies even without a Content-Length header", async () => {
  assert.equal((await handler()(makeRequest({ messages, padding: "x".repeat(AI_LIMITS.bodyBytes) }))).status, 400);
  assert.equal((await handler()(makeRequest(undefined, { "Content-Length": "90000" }))).status, 400);
});

test("stream returns only allowlisted events and logs numeric usage, not prompts or secrets", async () => {
  const logs: unknown[] = [];
  const response = await handler({ log: entry => logs.push(entry) })(makeRequest());
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control")!, /no-store/);
  const events = (await response.text()).trim().split("\n").map(line => JSON.parse(line));
  assert.deepEqual(events, [{ type: "delta", text: "Test fixture response" }, { type: "done" }]);
  assert.equal(logs.length, 1);
  const log = logs[0] as { inputTokens: number; outputTokens: number; outcome: string };
  assert.equal(log.inputTokens, 20); assert.equal(log.outputTokens, 4); assert.equal(log.outcome, "completed");
  assert.ok(!JSON.stringify(logs).includes(env.OPENAI_API_KEY!));
  assert.ok(!JSON.stringify(logs).includes(messages[0].content));
});

test("provider failures are sanitized and rate limits expose a retry interval", async () => {
  for (const status of [401, 429, 500]) {
    const response = await handler({ provider: async () => { throw Object.assign(new Error("internal secret detail"), { status }); } })(makeRequest());
    const text = await response.text();
    assert.ok(!text.includes("internal secret"));
    assert.equal(response.status, status === 429 ? 429 : 502);
    if (status === 429) assert.equal(response.headers.get("retry-after"), "60");
  }
});

test("partial stream failure never emits done", async () => {
  const provider: Provider = async () => (async function* () { yield { type: "delta", text: "Partial" } as const; throw new Error("private details"); })();
  const response = await handler({ provider })(makeRequest());
  const text = await response.text();
  assert.match(text, /"code":"failed"/); assert.ok(!text.includes('"done"')); assert.ok(!text.includes("private details"));
});

test("empty and oversized provider responses cannot be marked completed", async () => {
  for (const text of ["", "x".repeat(AI_LIMITS.assistantChars + 1)]) {
    const provider: Provider = async () => (async function* () {
      if (text) yield { type: "delta", text } as const;
      yield { type: "done", inputTokens: 1, outputTokens: 1 } as const;
    })();
    const response = await handler({ provider })(makeRequest());
    const body = await response.text();
    assert.ok(body.includes('"type":"error"'));
    assert.ok(!body.includes('"type":"done"'));
  }
});

test("disconnect aborts generation and releases the request slot", async () => {
  let aborted = false;
  const limiter = createLimiter();
  const provider: Provider = async (_, signal) => (async function* () {
    yield { type: "delta", text: "Partial" } as const;
    await new Promise<void>((_, reject) => signal.addEventListener("abort", () => { aborted = true; reject(Error()); }));
  })();
  const response = await handler({ provider, limiter })(makeRequest());
  const reader = response.body!.getReader();
  await reader.read();
  await reader.cancel();
  assert.equal(aborted, true);
  const next = await handler({ limiter })(makeRequest());
  assert.equal(next.status, 200);
  await next.text();
});

test("timeout aborts the provider and releases the concurrency slot", async () => {
  let aborted = false;
  const limiter = createLimiter();
  const provider: Provider = async (_, signal) => new Promise((_, reject) => signal.addEventListener("abort", () => { aborted = true; reject(Error()); }));
  const response = await handler({ provider, timeoutMs: 10, limiter })(makeRequest());
  assert.equal(response.status, 504); assert.equal(aborted, true);
  assert.equal((await handler({ limiter })(makeRequest())).status, 200);
  const upstreamTimeout = await handler({ provider: async () => { throw Object.assign(new Error(), { name: "APIConnectionTimeoutError" }); } })(makeRequest());
  assert.equal(upstreamTimeout.status, 504);
});

test("process limiter bounds concurrency, per-client rate and daily requests", () => {
  let now = 0; const limit = createLimiter(() => now);
  const release = limit("a")!; assert.ok(release); assert.equal(limit("a"), null);
  release(); release();
  for (let i = 1; i < 10; i++) limit("a")!();
  assert.equal(limit("a"), null);
  now = 60001; limit("a")!();
  const releases = ["b", "c", "d", "e"].map(id => limit(id)!);
  assert.equal(limit("f"), null); releases.forEach(done => done());
  for (let i = 15; i < 200; i++) limit(`id${i}`)!();
  assert.equal(limit("next"), null);
  now += 86400001; assert.ok(limit("next"));
});

test("official SDK adapter calls Responses with server instructions, bounded output and store:false", async () => {
  let sent: Record<string, unknown> = {};
  const fetcher: typeof fetch = async (url, init) => {
    assert.equal(String(url), "https://api.openai.com/v1/responses");
    sent = JSON.parse(String(init?.body));
    const events = [
      { type: "response.output_text.delta", delta: "SDK fixture" },
      { type: "response.completed", response: { usage: { input_tokens: 12, output_tokens: 3 } } },
    ];
    return new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join(""), { headers: { "Content-Type": "text/event-stream" } });
  };
  const provider = openAIProvider("unit-test-not-a-key", "gpt-5.4-mini", fetcher);
  const output = [];
  for await (const event of await provider(messages, new AbortController().signal)) output.push(event);
  assert.equal(sent.store, false); assert.equal(sent.stream, true); assert.equal(sent.max_output_tokens, 2000);
  assert.equal(sent.instructions, instructions); assert.deepEqual(sent.input, messages);
  assert.deepEqual(output, [{ type: "delta", text: "SDK fixture" }, { type: "done", inputTokens: 12, outputTokens: 3 }]);
  for (const price of ["4,990 SEK", "8,990 SEK", "14,990 SEK"]) assert.ok(instructions.includes(price));
  assert.ok(instructions.includes("Prices exclude VAT"));
});
