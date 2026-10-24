import { expect, test } from "@playwright/test";
import path from "node:path";

for (const width of [320, 768, 1440]) {
  for (const files of [["sample.png"], ["sample.jpg"], ["sample.png", "sample.jpg", "sample.webp"]]) {
    test(`sent images align above text at ${width}px: ${files.join(", ")}`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 1100 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.route("**/api/ai/chat", route => route.fulfill({
        contentType: "application/x-ndjson",
        body: '{"type":"delta","text":"Image alignment test response."}\n{"type":"done"}\n',
      }));
      await page.goto("/ask-ai");
      await page.getByLabel("Upload images", { exact: true }).setInputFiles(files.map(file => path.join(__dirname, "fixtures", file)));
      const input = page.getByRole("textbox", { name: "Message", exact: true });
      await input.fill("Review these images");
      await page.getByRole("button", { name: "Send message", exact: true }).click();
      await expect(page.getByRole("group", { name: "Response actions" })).toBeVisible();
      const message = page.getByRole("article", { name: "Your message", exact: true });
      const bubble = message.locator("p").locator("..");
      const imageList = message.getByLabel("Message attachments", { exact: true });
      const bubbleBox = (await bubble.boundingBox())!;
      const messageBox = (await message.boundingBox())!;
      const listBox = (await imageList.boundingBox())!;
      const right = bubbleBox.x + bubbleBox.width;
      expect(Math.abs(right - messageBox.x - messageBox.width)).toBeLessThan(1);
      expect(bubbleBox.y - listBox.y - listBox.height).toBeGreaterThanOrEqual(8);
      expect(bubbleBox.y - listBox.y - listBox.height).toBeLessThanOrEqual(12);
      const images = imageList.getByRole("img");
      await expect(images).toHaveCount(files.length);
      for (let index = 0; index < files.length; index++) {
        const image = images.nth(index);
        const box = (await image.boundingBox())!;
        const dimensions = await image.evaluate((element: HTMLImageElement) => ({ width: element.naturalWidth, height: element.naturalHeight }));
        expect(Math.abs(box.width / box.height - dimensions.width / dimensions.height)).toBeLessThan(.02);
        expect(box.width).toBeLessThanOrEqual(320);
        expect(box.height).toBeLessThanOrEqual(320);
        expect(box.y + box.height).toBeLessThanOrEqual(bubbleBox.y - 8);
        expect(Math.abs(box.x + box.width - right)).toBeLessThan(1);
      }
      const answerBox = (await page.getByLabel("BlueMind AI response", { exact: true }).boundingBox())!;
      expect(answerBox.y).toBeGreaterThanOrEqual(bubbleBox.y + bubbleBox.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await message.scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath("images-above-text.png") });
    });
  }
}

test("document-only messages keep their original row layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/api/ai/chat", route => route.fulfill({
    contentType: "application/x-ndjson", body: '{"type":"done"}\n',
  }));
  await page.goto("/ask-ai");
  await page.getByLabel("Upload documents", { exact: true }).setInputFiles(
    ["notes.txt", "budget.xlsx"].map(file => path.join(__dirname, "fixtures", file)));
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  const files = page.getByLabel("Message attachments", { exact: true });
  await expect(files).toHaveCSS("flex-direction", "row");
  await expect(files).toHaveCSS("gap", "12px");
});
