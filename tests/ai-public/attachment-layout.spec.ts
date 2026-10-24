import { expect, test } from "@playwright/test";
import path from "node:path";

const fixture = (name: string) => path.join(__dirname, "fixtures", name);
const reply = '{"type":"delta","text":"Attachment layout test response."}\n{"type":"done"}\n';

for (const width of [320, 390, 768, 1440]) test(`attachment remove controls and separate sent elements at ${width}px`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests: { messages: { content: string; attachments?: { name: string }[] }[] }[] = [];
  await page.route("**/api/ai/chat", route => {
    requests.push(route.request().postDataJSON());
    return route.fulfill({ contentType: "application/x-ndjson", body: reply });
  });
  await page.goto("/ask-ai");
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  await input.fill("Please compare the screenshot with this brief.");
  await page.getByLabel("Upload images", { exact: true }).setInputFiles([fixture("sample.png"), fixture("sample.jpg")]);
  await page.getByLabel("Upload documents", { exact: true }).setInputFiles([fixture("notes.txt"), fixture("budget.xlsx")]);
  const selected = page.getByLabel("Selected attachments", { exact: true });
  await expect(selected.getByRole("button", { name: /^Remove / })).toHaveCount(4);
  for (const name of ["sample.png", "sample.jpg", "notes.txt", "budget.xlsx"]) {
    const remove = selected.getByRole("button", { name: `Remove ${name}`, exact: true });
    await remove.scrollIntoViewIfNeeded();
    const spacing = await remove.evaluate(element => {
      const button = element.getBoundingClientRect();
      const card = element.parentElement!.getBoundingClientRect();
      const icon = element.querySelector("svg")!.getBoundingClientRect();
      const label = element.parentElement!.querySelector("strong")?.getBoundingClientRect();
      return { top: button.top - card.top, right: card.right - button.right,
        bottom: card.bottom - button.bottom, left: button.left - card.left,
        iconInset: icon.left - button.left, textGap: label ? button.left - label.right : null };
    });
    expect(spacing.top).toBe(6);
    expect(spacing.right).toBe(6);
    expect(spacing.bottom).toBeGreaterThan(0);
    expect(spacing.left).toBeGreaterThan(0);
    expect(spacing.iconInset).toBeGreaterThanOrEqual(6);
    if (spacing.textGap !== null) expect(spacing.textGap).toBeGreaterThanOrEqual(6);
  }
  await selected.getByRole("button", { name: "Remove sample.jpg", exact: true }).click();
  await selected.getByRole("button", { name: "Remove budget.xlsx", exact: true }).click();
  await expect(selected.getByRole("button", { name: /^Remove / })).toHaveCount(2);
  await expect(input).toHaveValue("Please compare the screenshot with this brief.");
  await selected.getByRole("button", { name: "Open image sample.png", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Image viewer: sample.png", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close image", exact: true }).click();
  await page.screenshot({ path: info.outputPath("composer.png") });
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("group", { name: "Response actions" })).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0].messages).toHaveLength(1);
  expect(requests[0].messages[0].content).toBe("Please compare the screenshot with this brief.");
  expect(requests[0].messages[0].attachments?.map(file => file.name)).toEqual(["sample.png", "notes.txt"]);
  const message = page.getByRole("article", { name: "Your message", exact: true });
  const attachments = message.getByLabel("Message attachments", { exact: true });
  const bubble = message.locator("p").locator("..");
  await expect(message).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(message).toHaveCSS("padding", "0px");
  await expect(bubble).toHaveCSS("background-color", "rgb(237, 243, 250)");
  await expect(bubble).toHaveCSS("border-radius", "8px");
  await expect(bubble.getByRole("img")).toHaveCount(0);
  await expect(attachments.getByRole("img")).toHaveCount(1);
  await expect(attachments.locator("strong")).toHaveText("notes.txt");
  const cardsBox = (await attachments.boundingBox())!;
  const bubbleBox = (await bubble.boundingBox())!;
  expect(bubbleBox.y - cardsBox.y - cardsBox.height).toBeGreaterThanOrEqual(11);
  await expect(message.getByRole("button", { name: /^Remove / })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath("sent-message.png") });
});

test("attachment-only messages have no empty text bubble", async ({ page }) => {
  await page.route("**/api/ai/chat", route => route.fulfill({ contentType: "application/x-ndjson", body: reply }));
  await page.goto("/ask-ai");
  await page.getByLabel("Upload documents", { exact: true }).setInputFiles(fixture("notes.txt"));
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  const message = page.getByRole("article", { name: "Your message", exact: true });
  await expect(message.locator("p")).toHaveCount(0);
  await expect(message).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(message).toHaveCSS("padding", "0px");
  await expect(message.getByLabel("Message attachments")).toContainText("notes.txt");
});
