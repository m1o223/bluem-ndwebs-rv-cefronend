import { expect, test } from "@playwright/test";
import { isAiPreviewEnabled } from "../../components/ai-preview/preview-policy";
import { getDemoReply } from "../../components/ai-preview/demo-reply";
import copy from "../../components/ai-preview/copy.json";

test("preview is unavailable in production, including Vercel production", () => {
  expect(isAiPreviewEnabled({ NODE_ENV: "production" })).toBe(false);
  expect(isAiPreviewEnabled({ VERCEL_ENV: "production", NODE_ENV: "development" })).toBe(false);
  expect(isAiPreviewEnabled({ VERCEL: "1", NODE_ENV: "development" })).toBe(false);
  expect(isAiPreviewEnabled({ VERCEL_ENV: "unknown" })).toBe(false);
  expect(isAiPreviewEnabled({})).toBe(false);
  expect(isAiPreviewEnabled({ VERCEL_ENV: "preview", NODE_ENV: "production" })).toBe(true);
  expect(isAiPreviewEnabled({ NODE_ENV: "development" })).toBe(true);
});

for (const locale of ["en", "sv", "ar"] as const) {
  test(`${locale}: all replies are deterministic local scripts`, () => {
    const text = copy[locale];
    for (const [index, question] of text.suggestions.entries()) {
      expect(getDemoReply(question, locale, index)).toBe(text.replies[index]);
    }
    expect(getDemoReply("xyz", locale)).toBe(text.fallback);
    expect(getDemoReply("xyz", locale, 99)).toBe(text.fallback);
    expect(getDemoReply(text.keywords[2][0], locale)).toBe(text.replies[2]);
  });
}
