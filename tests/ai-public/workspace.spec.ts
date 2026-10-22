import { expect, test } from "@playwright/test";

for (const width of [320, 375, 768, 1440]) test(`customer chat without login at ${width}px (fixtures)`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  let fail = false;
  const contexts: { role: string; content: string }[][] = [];
  const sessionRequests: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/ai/session")) sessionRequests.push(request.url()); });
  await page.route("**/api/ai/chat", route => {
    contexts.push(route.request().postDataJSON().messages);
    return fail ? route.fulfill({ status: 502, json: { code: "failed" } }) : route.fulfill({ contentType: "application/x-ndjson", body: '{"type":"delta","text":"Browser test fixture response"}\n{"type":"done"}\n' });
  });
  await page.goto("/ask-ai");
  await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
  await expect(page.getByText(/Private owner testing|Public access is not available|Workspace email|Owner password/)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "BlueMind AI" })).toBeVisible();
  await page.getByRole("button", { name: "Create a website", exact: true }).click();
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  await expect(input).toHaveValue("Create a website");
  await expect(page.getByRole("article")).toHaveCount(0);
  await input.press("Shift+Enter"); await input.press("a");
  await expect(input).toHaveValue("Create a website\na");
  await input.press("Enter");
  await expect(page.getByLabel("BlueMind AI response", { exact: true })).toHaveText("Browser test fixture response");
  await expect(page.getByRole("heading", { name: "BlueMind AI" })).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Create a website", exact: true })).not.toBeVisible();
  await input.fill("Follow up"); await input.press("Enter");
  await expect(page.getByLabel("BlueMind AI response", { exact: true })).toHaveCount(2);
  expect(contexts[1].map(turn => turn.role)).toEqual(["user", "assistant", "user"]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("chat.png") });
  if (width < 768) await page.getByRole("button", { name: "Open sidebar", exact: true }).click();
  await page.getByRole("button", { name: "New chat", exact: true }).filter({ visible: true }).click();
  await expect(page.getByRole("heading", { name: "BlueMind AI" })).toBeVisible();
  fail = true;
  await input.fill("Test retry"); await input.press("Enter");
  await expect(page.getByRole("alert").filter({ hasText: "We could not complete" })).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByLabel("BlueMind AI response", { exact: true })).toHaveText("Browser test fixture response");
  if (width < 768) await page.getByRole("button", { name: "Open sidebar", exact: true }).click();
  await page.getByRole("button", { name: "Create a website a", exact: true }).filter({ visible: true }).click();
  await expect(page.getByLabel("BlueMind AI response", { exact: true })).toHaveCount(2);
  await page.getByRole("link", { name: "Close", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(sessionRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test("AI login endpoint is removed and cross-site chat is blocked", async ({ request }) => {
  expect((await request.get("/api/ai/session")).status()).toBe(404);
  expect((await request.post("/api/ai/chat", { headers: { Origin: "https://evil.example" }, data: {} })).status()).toBe(403);
});
