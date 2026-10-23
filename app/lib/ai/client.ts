import { AI_ERRORS, AI_LIMITS, type AiErrorCode, type ChatTurn } from "./contract";
import { MESSAGE_CARD_FORMAT, validateMessageCard, messageCardText, type MessageCardContent } from "./message-card";

export class ChatRequestError extends Error {
  constructor(public code: AiErrorCode) { super(AI_ERRORS[code]); }
}

export async function requestReply(messages: ChatTurn[], signal: AbortSignal, onDelta: (text: string) => void, onCard?: (card: MessageCardContent) => void) {
  signal.throwIfAborted();
  const response = await fetch("/api/ai/chat", {
    method: "POST", credentials: "omit", redirect: "error", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages, ...(onCard ? { responseFormat: MESSAGE_CARD_FORMAT } : {}) }), signal,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const code = body?.code;
    throw new ChatRequestError(typeof code === "string" && Object.hasOwn(AI_ERRORS, code) ? code as AiErrorCode : "failed");
  }
  if (!response.body || !response.headers.get("content-type")?.startsWith("application/x-ndjson")) throw new ChatRequestError("failed");
  const reader = response.body.getReader();
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", cancel, { once: true });
  if (signal.aborted) cancel();
  const decoder = new TextDecoder();
  let buffer = "";
  let chars = 0;
  let complete = false;
  let card: MessageCardContent | null = null;
  try {
    while (!complete) {
      signal.throwIfAborted();
      const chunk = await reader.read();
      signal.throwIfAborted();
      buffer += decoder.decode(chunk.value, { stream: !chunk.done });
      if (buffer.length > AI_LIMITS.assistantChars * 8) throw new ChatRequestError("failed");
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        signal.throwIfAborted();
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.type === "delta" && typeof event.text === "string") {
          chars += event.text.length;
          if (chars > AI_LIMITS.assistantChars) throw new ChatRequestError("failed");
          onDelta(event.text);
        } else if (event.type === "message_card") {
          if (!onCard || card) throw new ChatRequestError("failed");
          card = validateMessageCard(event.card);
          if (!card) throw new ChatRequestError("failed");
          chars += messageCardText(card).length + (chars ? 2 : 0);
          if (chars > AI_LIMITS.assistantChars) throw new ChatRequestError("failed");
        } else if (event.type === "done") { complete = true; break; }
        else if (event.type === "error") throw new ChatRequestError(Object.hasOwn(AI_ERRORS, event.code) ? event.code : "failed");
        else throw new ChatRequestError("failed");
      }
      if (chunk.done) break;
    }
    if (!complete || !chars) throw new ChatRequestError("failed");
    signal.throwIfAborted();
    if (card) onCard?.(card);
  } finally { signal.removeEventListener("abort", cancel); await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
