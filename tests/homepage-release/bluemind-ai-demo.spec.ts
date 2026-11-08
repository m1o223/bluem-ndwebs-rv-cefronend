import { expect, test } from "@playwright/test";
import path from "node:path";

const imagePath = path.resolve(process.cwd(), "public/images/folio-books/folio-phone.webp");

async function mockDemoApi(page: import("@playwright/test").Page) {
  let calls = 0;
  await page.route("**/api/ai/demo", async route => {
    calls += 1;
    await route.fulfill({
      status: 200,
      headers: { "content-type": "application/x-ndjson" },
      body: `{"type":"delta","text":"Preview response ${calls}"}\n{"type":"done"}\n`,
    });
  });
  return () => calls;
}

test("desktop tablet preview accepts an image, allows two replies, then transfers the conversation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const calls = await mockDemoApi(page);
  await page.goto("/");
  const demo = page.locator("[data-ai-demo]");
  await expect(demo).toBeVisible();
  await expect(demo.getByText(/What kind of website do you have in mind/)).toBeVisible();
  await demo.locator('input[type="file"]').setInputFiles(imagePath);
  await expect(demo.getByRole("button", { name: /Remove / })).toHaveCount(1);
  await demo.locator("textarea").fill("I want a bookstore website");
  await demo.getByRole("button", { name: "Send message" }).click();
  await expect(demo.getByText("Preview response 1")).toBeVisible();
  await demo.locator("textarea").fill("Can you help me shape the idea?");
  await demo.getByRole("button", { name: "Send message" }).click();
  await expect(demo.getByText("Preview response 2")).toBeVisible();
  await expect(demo.getByRole("dialog")).toBeVisible();
  await expect(demo.getByRole("button", { name: "Continue in BlueMind AI" })).toBeVisible();
  expect(calls()).toBe(2);
  await demo.getByRole("button", { name: "Continue in BlueMind AI" }).click();
  await expect(page).toHaveURL(/\/ask-ai\?source=what-we-build&continue=1/);
  await expect(page.getByRole("log", { name: "Conversation" })).toContainText("I want a bookstore website");
});

test("mobile hides the tablet and keeps the explanation and full chat link", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-ai-demo]")).toBeHidden();
  const section = page.locator("[data-bluemind-ai]");
  await expect(section.locator("#bluemind-ai-title")).toBeVisible();
  await expect(section.getByRole("link", { name: /Ask BlueMind AI/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
