// Local-only test harness. Not imported by application code and never calls OpenAI.
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

if (!process.env.AI_TEST_BACKEND_DIR || process.env.VERCEL || process.env.RENDER) throw new Error("Local backend test worktree required");
const { createHealthServer } = await import(pathToFileURL(resolve(process.env.AI_TEST_BACKEND_DIR, "src/server.js")).href);
let retryCalls = 0;
const provider = async (messages, signal) => {
  if (messages.at(-1).content === "Retry fixture" && retryCalls++ === 0) throw Object.assign(new Error("private test detail"), { status: 401 });
  return (async function* () {
    yield { type: "delta", text: "Test fixture: " };
    await new Promise((resolve, reject) => {
      const abort = () => { clearTimeout(timer); reject(Error("aborted")); };
      const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, 300);
      signal.addEventListener("abort", abort, { once: true });
    });
    yield { type: "delta", text: `context has ${messages.length} turns; first question: ${messages[0].content}` };
    yield { type: "done", inputTokens: 20, outputTokens: 15 };
  })();
};
const server = createHealthServer({
  NODE_ENV: "test", ALLOWED_ORIGINS: "http://localhost:9999", AI_ALLOWED_ORIGINS: "http://localhost:3197",
  AI_ENABLED: "true", OPENAI_API_KEY: "test-fixture-not-a-real-key",
}, { ai: { provider, log: () => {}, limiter: () => () => {} } });
server.listen(4198, "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { server.closeAllConnections(); server.close(); });
