import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { AI_LIMITS, validateTurns, type AiErrorCode, type ChatEvent } from "./contract";
import { openAIProvider, type Provider } from "./provider";

export function aiAvailable(env: NodeJS.ProcessEnv = process.env) {
  return env.VERCEL_ENV !== "production" && env.AI_ENABLED === "true" && Boolean(env.OPENAI_API_KEY?.trim());
}

// Bounded process-local protection for authenticated Preview testing, not a global quota.
export function createLimiter(now = Date.now) {
  const clients = new Map<string, { count: number; expires: number; active: number }>();
  let active = 0;
  let daily = { count: 0, expires: now() + 86400000 };
  return (id: string): (() => void) | null => {
    const time = now();
    for (const [key, value] of clients) if (value.expires <= time && !value.active) clients.delete(key);
    if (daily.expires <= time) daily = { count: 0, expires: time + 86400000 };
    const value = clients.get(id) ?? { count: 0, expires: time + 60000, active: 0 };
    if (value.expires <= time) { value.count = 0; value.expires = time + 60000; }
    if (active >= 4 || value.active >= 1 || value.count >= 10 || daily.count >= 200 || (!clients.has(id) && clients.size >= 1000)) return null;
    value.count++; value.active++; active++; daily.count++;
    clients.set(id, value);
    let released = false;
    return () => { if (!released) { released = true; value.active--; active--; } };
  };
}

const acquire = createLimiter();
const salt = randomBytes(32);
const jsonError = (code: AiErrorCode, status: number) => Response.json({ code }, {
  status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "60" } : {}) },
});

async function readBody(request: Request) {
  if (Number(request.headers.get("content-length")) > AI_LIMITS.bodyBytes) throw new Error("size");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("body");
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  let expired = false;
  const timeout = setTimeout(() => { expired = true; void reader.cancel().catch(() => {}); }, 5000);
  try {
    while (true) {
      const chunk = await reader.read();
      if (expired) throw new Error("timeout");
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > AI_LIMITS.bodyBytes) { await reader.cancel(); throw new Error("size"); }
      chunks.push(chunk.value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } finally { clearTimeout(timeout); reader.releaseLock(); }
}

function errorCode(error: unknown, aborted: boolean): AiErrorCode {
  if (aborted || (error instanceof Error && error.name === "APIConnectionTimeoutError")) return "timeout";
  const status = typeof error === "object" && error !== null && "status" in error ? error.status : undefined;
  return status === 429 ? "rate" : status === 401 || status === 403 ? "unavailable" : "failed";
}

type Usage = { event: "bluemind_ai"; requestId: string; outcome: string; durationMs: number; inputTokens: number; outputTokens: number };
export function createChatHandler(options: {
  env?: NodeJS.ProcessEnv; provider?: Provider; limiter?: ReturnType<typeof createLimiter>;
  timeoutMs?: number; log?: (entry: Usage) => void;
} = {}) {
  return async (request: Request) => {
    const env = options.env ?? process.env;
    if (!aiAvailable(env)) return jsonError("unavailable", 503);
    const origin = new URL(request.url).origin;
    if (request.headers.get("origin") !== origin || request.headers.get("sec-fetch-site") === "cross-site") return jsonError("invalid", 403);
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return jsonError("invalid", 415);
    const ip = env.VERCEL ? request.headers.get("x-vercel-forwarded-for") ?? "unknown" : "local";
    const clientId = createHash("sha256").update(salt).update(ip.slice(0, 200)).digest("hex");
    const release = (options.limiter ?? acquire)(clientId);
    if (!release) return jsonError("rate", 429);
    let messages;
    try { messages = validateTurns(await readBody(request)); }
    catch { release(); return jsonError("invalid", 400); }
    if (!messages) { release(); return jsonError("invalid", 400); }

    const started = Date.now();
    const requestId = randomUUID();
    const controller = new AbortController();
    const abort = () => controller.abort();
    request.signal.addEventListener("abort", abort, { once: true });
    if (request.signal.aborted) abort();
    const timeout = setTimeout(abort, options.timeoutMs ?? 55000);
    const log = options.log ?? (entry => console.info(JSON.stringify(entry)));
    let logged = false;
    const finish = (outcome: string, inputTokens = 0, outputTokens = 0) => {
      clearTimeout(timeout);
      request.signal.removeEventListener("abort", abort);
      release();
      if (!logged) { logged = true; log({ event: "bluemind_ai", requestId, outcome, durationMs: Date.now() - started, inputTokens, outputTokens }); }
    };
    try {
      const provider = options.provider ?? openAIProvider(env.OPENAI_API_KEY!, env.OPENAI_MODEL || "gpt-5.4-mini");
      const events = await provider(messages, controller.signal);
      const encoder = new TextEncoder();
      let cancelled = false;
      const body = new ReadableStream<Uint8Array>({
        async start(stream) {
          const emit = (event: ChatEvent) => { if (!cancelled) stream.enqueue(encoder.encode(`${JSON.stringify(event)}\n`)); };
          let chars = 0;
          let completed = false;
          try {
            for await (const event of events) {
              if (controller.signal.aborted) throw new Error("aborted");
              if (event.type === "delta") {
                chars += event.text.length;
                if (chars > AI_LIMITS.assistantChars) throw new Error("output limit");
                emit(event);
              } else {
                if (!chars) throw new Error("empty response");
                completed = true;
                emit({ type: "done" });
                finish("completed", event.inputTokens, event.outputTokens);
                break;
              }
            }
            if (!completed) throw new Error("incomplete stream");
          } catch (error) {
            const code = errorCode(error, controller.signal.aborted);
            emit({ type: "error", code });
            finish(request.signal.aborted || cancelled ? "cancelled" : code);
          } finally {
            abort();
            if (!cancelled) stream.close();
          }
        },
        cancel() { cancelled = true; abort(); finish("cancelled"); },
      });
      return new Response(body, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Content-Type-Options": "nosniff" } });
    } catch (error) {
      const code = errorCode(error, controller.signal.aborted);
      finish(code);
      return jsonError(code, code === "rate" ? 429 : code === "timeout" ? 504 : 502);
    }
  };
}
