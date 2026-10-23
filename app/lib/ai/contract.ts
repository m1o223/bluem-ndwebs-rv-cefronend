import { MESSAGE_CARD_FORMAT, type MessageCardContent } from "./message-card";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export const AI_LIMITS = { messageChars: 4000, assistantChars: 12000, contextChars: 18000, turns: 20, bodyBytes: 80000, outputTokens: 2000 } as const;
export const AI_ERRORS = {
  unavailable: "BlueMind AI is temporarily unavailable. Please try again later.",
  invalid: "Please shorten your message and try again.",
  rate: "Too many requests. Please wait a minute before trying again.",
  timeout: "The response took too long. Please try again.",
  failed: "We could not complete the response. Please try again.",
  stopped: "The response was stopped before it finished.",
} as const;
export type AiErrorCode = keyof typeof AI_ERRORS;
export type ChatEvent = { type: "delta"; text: string } | { type: "message_card"; card: MessageCardContent } | { type: "done" } | { type: "error"; code: AiErrorCode };

export function boundedContext(turns: ChatTurn[]): ChatTurn[] {
  const result: ChatTurn[] = [];
  let size = 0;
  for (const turn of turns.slice(-AI_LIMITS.turns).reverse()) {
    if (size + turn.content.length > AI_LIMITS.contextChars) break;
    result.unshift(turn);
    size += turn.content.length;
  }
  while (result[0]?.role === "assistant") result.shift();
  return result;
}

export function validateTurns(body: unknown): ChatTurn[] | null {
  if (!body || typeof body !== "object" || Object.keys(body).some(key => !["messages", "responseFormat"].includes(key))) return null;
  if (Object.hasOwn(body, "responseFormat") && (body as { responseFormat?: unknown }).responseFormat !== MESSAGE_CARD_FORMAT) return null;
  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || !messages.length || messages.length > AI_LIMITS.turns) return null;
  let chars = 0;
  const result: ChatTurn[] = [];
  for (const message of messages) {
    if (!message || typeof message !== "object" || Object.keys(message).some(key => !["role", "content"].includes(key))) return null;
    if (message.role !== "user" && message.role !== "assistant") return null;
    if (typeof message.content !== "string" || !message.content.trim()) return null;
    if (message.content.length > (message.role === "user" ? AI_LIMITS.messageChars : AI_LIMITS.assistantChars)) return null;
    chars += message.content.length;
    if (chars > AI_LIMITS.contextChars) return null;
    result.push({ role: message.role, content: message.content.trim() });
  }
  return result[0].role === "user" && result.at(-1)!.role === "user" ? result : null;
}
