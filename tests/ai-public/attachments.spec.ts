import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import { readFileSync } from "node:fs";

const fixture = (name: string) => path.join(__dirname, "fixtures", name);
const reply = '{"type":"delta","text":"Attachment browser fixture response"}\n{"type":"done"}\n';
async function mockChat(page: Page) {
  const requests: any[] = [];
  await page.route("**/api/ai/chat", route => {
    requests.push(route.request().postDataJSON());
    return route.fulfill({ contentType: "application/x-ndjson", body: reply });
  });
  return requests;
}
async function uploadImages(page: Page, names: string[]) {
  await page.getByLabel("Upload images", { exact: true }).setInputFiles(names.map(fixture));
  await expect(page.getByLabel("Selected attachments")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeEnabled();
}
async function done(page: Page, count = 1) {
  await expect(page.getByLabel("BlueMind AI response", { exact: true })).toHaveCount(count);
  await expect(page.getByRole("button", { name: "Stop response", exact: true })).toHaveCount(0);
}

for (const width of [320, 375, 768, 1440]) test(`attachments, viewer and follow-up at ${width}px (synthetic fixtures)`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 900 });
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  const requests = await mockChat(page);
  await page.goto("/ask-ai");
  await page.getByRole("button", { name: "Add attachment", exact: true }).click();
  const picker = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Add image", exact: true }).click();
  await (await picker).setFiles([fixture("sample.png"), fixture("sample.jpg"), fixture("sample.webp")]);
  await expect(page.getByLabel("Selected attachments").getByRole("img")).toHaveCount(3);
  await page.getByRole("button", { name: "Remove sample.webp", exact: true }).click();
  await expect(page.getByLabel("Selected attachments").getByRole("img")).toHaveCount(2);
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  await input.fill("Compare these images");
  await page.screenshot({ path: info.outputPath("composer.png") });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await done(page);
  expect(requests[0].messages[0].attachments).toHaveLength(2);
  expect(requests[0].messages[0].attachments[0].data).toBe(readFileSync(fixture("sample.png")).toString("base64"));
  const images = page.getByLabel("Message attachments").getByRole("img");
  await expect(images).toHaveCount(2);
  for (let i = 0; i < 2; i++) {
    const ratio = await images.nth(i).evaluate((element: HTMLImageElement) => ({ rendered: element.width / element.height, original: element.naturalWidth / element.naturalHeight }));
    expect(Math.abs(ratio.rendered - ratio.original)).toBeLessThan(.02);
  }
  await page.getByRole("button", { name: "Open image sample.png", exact: true }).click();
  const viewer = page.getByRole("dialog", { name: "Image viewer: sample.png", exact: true });
  await expect(viewer).toBeVisible();
  const content = viewer.locator(".react-transform-component");
  const initial = await content.getAttribute("style");
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(content).not.toHaveAttribute("style", initial!);
  const imageBox = await viewer.getByRole("img").boundingBox();
  if (imageBox) {
    const x = Math.min(width - 30, Math.max(30, imageBox.x + imageBox.width / 2));
    await page.mouse.move(x, 450); await page.mouse.down(); await page.mouse.move(x + 30, 490, { steps: 8 }); await page.mouse.up();
  }
  await page.screenshot({ path: info.outputPath("viewer.png") });
  await page.keyboard.press("Escape");
  await expect(viewer).toHaveCount(0);
  await input.fill("What about their colors?"); await input.press("Enter"); await done(page, 2);
  expect(requests[1].messages[0].attachments).toEqual(requests[0].messages[0].attachments);
  await page.screenshot({ path: info.outputPath("conversation.png") });
  if (width < 768) await page.getByRole("button", { name: "Open sidebar", exact: true }).click();
  await page.getByRole("button", { name: "New chat", exact: true }).filter({ visible: true }).click();
  await expect(page.getByLabel("Message attachments")).toHaveCount(0);
  if (width < 768) await page.getByRole("button", { name: "Open sidebar", exact: true }).click();
  await page.getByRole("button", { name: "Compare these images", exact: true }).filter({ visible: true }).click();
  await expect(page.getByLabel("Message attachments").getByRole("img")).toHaveCount(2);
  expect(await page.evaluate(() => Object.values(localStorage).join(" ").includes("sample.png"))).toBe(false);
  expect(errors).toEqual([]);
});

test("all document types, attachment-only send and native camera input", async ({ page }) => {
  const requests = await mockChat(page); await page.goto("/ask-ai");
  await expect(page.getByLabel("Take a photo", { exact: true })).toHaveAttribute("capture", "environment");
  await page.getByLabel("Upload documents", { exact: true }).setInputFiles(["brief.pdf", "brief.docx", "notes.txt", "budget.xlsx"].map(fixture));
  await expect(page.getByLabel("Selected attachments").locator("strong")).toHaveCount(4);
  await page.getByRole("button", { name: "Send message", exact: true }).click(); await done(page);
  expect(requests[0].messages[0].content).toBe("");
  expect(requests[0].messages[0].attachments.map((f: any) => f.name)).toEqual(["brief.pdf", "brief.docx", "notes.txt", "budget.xlsx"]);
  await expect(page.getByLabel("Message attachments").locator("strong")).toHaveCount(4);
});

test("reject unsupported, oversized, corrupt and excess files without requests", async ({ page }) => {
  const requests = await mockChat(page); await page.goto("/ask-ai");
  const picker = page.getByLabel("Upload documents", { exact: true });
  await picker.setInputFiles({ name: "script.exe", mimeType: "application/octet-stream", buffer: Buffer.from("no") });
  await expect(page.getByRole("alert").filter({ hasText: "Choose JPEG" })).toBeVisible();
  await picker.setInputFiles({ name: "large.txt", mimeType: "text/plain", buffer: Buffer.alloc(2 * 1024 * 1024 + 1, 65) });
  await expect(page.getByRole("alert").filter({ hasText: "2 MB" })).toBeVisible();
  await page.getByLabel("Upload images", { exact: true }).setInputFiles({ name: "bad.png", mimeType: "image/png", buffer: Buffer.from("not an image") });
  await expect(page.getByRole("alert").filter({ hasText: "cannot be opened" })).toBeVisible();
  await picker.setInputFiles(Array.from({ length: 5 }, (_, i) => ({ name: `${i}.txt`, mimeType: "text/plain", buffer: Buffer.from("test") })));
  await expect(page.getByRole("alert").filter({ hasText: "up to 4" })).toBeVisible();
  expect(requests).toHaveLength(0);
});

test("failed attachment request retries with the same file and Stop cancels", async ({ page }) => {
  let fail = true; const requests: any[] = [];
  await page.route("**/api/ai/chat", async route => {
    requests.push(route.request().postDataJSON());
    if (fail) return route.fulfill({ status: 502, json: { code: "attachment_invalid" } });
    await new Promise(resolve => setTimeout(resolve, 3500));
    await route.fulfill({ contentType: "application/x-ndjson", body: reply }).catch(() => {});
  });
  await page.goto("/ask-ai"); await uploadImages(page, ["sample.png"]);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "file" })).toBeVisible();
  fail = false; await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect.poll(() => requests.length).toBe(2);
  expect(requests[1].messages[0].attachments).toEqual(requests[0].messages[0].attachments);
  await page.getByRole("button", { name: "Stop response", exact: true }).click();
  await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeVisible();
  await page.waitForTimeout(4000);
  await expect(page.getByText("Attachment browser fixture response", { exact: true })).toHaveCount(0);
});

test("mobile viewport contraction keeps attachment composer accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await mockChat(page); await page.goto("/ask-ai");
  await uploadImages(page, ["sample.png", "sample.jpg"]);
  await page.setViewportSize({ width: 390, height: 440 });
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Line one\nLine two\nLine three");
  const box = await page.getByRole("button", { name: "Send message", exact: true }).boundingBox();
  expect(box).not.toBeNull(); expect(box!.y + box!.height).toBeLessThanOrEqual(440);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
