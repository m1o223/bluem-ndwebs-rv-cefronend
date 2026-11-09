import { expect, test } from "@playwright/test";
import path from "node:path";

const imagePath = path.resolve(process.cwd(), "public/images/folio-books/folio-phone.webp");

async function mockChatApi(page: import("@playwright/test").Page) {
  let calls = 0;
  const bodies: unknown[] = [];
  await page.route("**/api/ai/chat", async route => {
    calls += 1;
    bodies.push(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      headers: { "content-type": "application/x-ndjson" },
      body: `{"type":"delta","text":"Preview response ${calls}"}\n{"type":"done"}\n`,
    });
  });
  return { calls: () => calls, bodies };
}

test("desktop tablet uses the original chat workspace for welcome, attachments, and replies", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const mock = await mockChatApi(page);
  await page.goto("/");
  const demo = page.locator("[data-ai-demo]");
  await expect(demo).toBeVisible();
  await expect(demo.locator('h1')).toHaveText("BlueMind AI");
  await expect(demo.getByText("What can I help you create?", { exact: true })).toBeVisible();
  await expect(demo.locator('textarea[placeholder="Ask BlueMind anything…"]')).toBeVisible();
  for (const suggestion of ["Create a website", "Design a page", "Improve my website", "Business ideas", "Help me get started", "Explore our services"]) {
    await expect(demo.getByRole("button", { name: suggestion, exact: true })).toBeVisible();
  }
  await expect(demo.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
  await demo.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(demo.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  await demo.getByRole("button", { name: "Expand sidebar" }).click();
  await demo.locator('input[aria-label="Upload images"]').setInputFiles(imagePath);
  await expect(demo.getByRole("button", { name: /Remove folio-phone\.webp/ })).toHaveCount(1);
  await demo.locator('textarea[aria-label="Message"]').fill("I want a bookstore website");
  await demo.getByRole("button", { name: "Send message" }).click();
  await expect(demo.getByText("Preview response 1")).toBeVisible();
  expect((mock.bodies[0] as { messages: Array<{ content: string; attachments?: Array<{ name: string; data: string }> }> }).messages[0].content).toBe("I want a bookstore website");
  expect((mock.bodies[0] as { messages: Array<{ attachments?: Array<{ name: string; data: string }> }> }).messages[0].attachments?.[0]).toMatchObject({ name: "folio-phone.webp" });
  expect((mock.bodies[0] as { messages: Array<{ attachments?: Array<{ data: string }> }> }).messages[0].attachments?.[0].data.length).toBeGreaterThan(100);
  expect(mock.calls()).toBe(1);
  await expect(demo.getByRole("button", { name: "Send message" })).toBeVisible();
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
