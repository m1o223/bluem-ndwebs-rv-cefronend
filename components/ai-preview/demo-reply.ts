import copy from "./copy.json";

export type PreviewLocale = keyof typeof copy;

export function getDemoReply(message: string, locale: PreviewLocale, suggestion?: number) {
  const text = copy[locale];
  if (suggestion !== undefined && Number.isInteger(suggestion) && suggestion >= 0 && suggestion < text.replies.length) {
    return text.replies[suggestion];
  }
  const normalized = message.toLocaleLowerCase(locale);
  // Prefer specific topics over the generic "website" keyword.
  const topic = [2, 1, 3, 0].find(index => text.keywords[index].some(word => normalized.includes(word)));
  return topic === undefined ? text.fallback : text.replies[topic];
}
