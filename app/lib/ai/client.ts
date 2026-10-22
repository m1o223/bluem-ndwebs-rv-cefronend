import { AI_ERRORS, AI_LIMITS, type AiErrorCode, type ChatTurn } from "./contract";
import { renderAiEndpoint } from "./endpoint";

export class ChatRequestError extends Error {
  constructor(public code: AiErrorCode) { super(AI_ERRORS[code]); }
}

export async function requestReply(messages: ChatTurn[], signal: AbortSignal, onDelta: (text: string) => void) {
  const endpoint = renderAiEndpoint();
  if (process.env.NEXT_PUBLIC_AI_API_BASE_URL?.trim() && !endpoint) throw new ChatRequestError("unavailable");
  // Unconfigured builds reach only the disabled legacy route. Never fail over after a Render error.
  const response = await fetch(endpoint ?? "/api/ai/chat", {
    method: "POST", credentials: "omit", redirect: "error", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }), signal,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const code = body?.code;
    throw new ChatRequestError(typeof code === "string" && Object.hasOwn(AI_ERRORS, code) ? code as AiErrorCode : "failed");
  }
  if (!response.body || !response.headers.get("content-type")?.startsWith("application/x-ndjson")) throw new ChatRequestError("failed");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let chars = 0;
  let complete = false;
  try {
    while (!complete) {
      const chunk = await reader.read();
      buffer += decoder.decode(chunk.value, { stream: !chunk.done });
      if (buffer.length > AI_LIMITS.assistantChars * 8) throw new ChatRequestError("failed");
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.type === "delta" && typeof event.text === "string") {
          chars += event.text.length;
          if (chars > AI_LIMITS.assistantChars) throw new ChatRequestError("failed");
          onDelta(event.text);
        } else if (event.type === "done") { complete = true; break; }
        else if (event.type === "error") throw new ChatRequestError(Object.hasOwn(AI_ERRORS, event.code) ? event.code : "failed");
        else throw new ChatRequestError("failed");
      }
      if (chunk.done) break;
    }
    if (!complete || !chars) throw new ChatRequestError("failed");
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
