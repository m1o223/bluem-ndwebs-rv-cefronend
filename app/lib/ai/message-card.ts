export type MessageCardContent = { title: string; body: string };
export const MESSAGE_CARD_FORMAT = "message-card-v1";

export function validateMessageCard(value: unknown): MessageCardContent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || Object.keys(value).length !== 2 || Object.keys(value).some(key => !["title", "body"].includes(key))) return null;
  const { title, body } = value as Record<string, unknown>;
  if (typeof title !== "string" || typeof body !== "string" || !title.trim() || !body.trim()
    || title.length > 200 || body.length > 11000) return null;
  return { title: title.trim(), body: body.trim() };
}

export const messageCardText = (card: MessageCardContent) => `${card.title}\n\n${card.body}`;
