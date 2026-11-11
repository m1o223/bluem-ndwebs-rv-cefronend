import { test, expect } from "@playwright/test";

async function authenticate(page: import("@playwright/test").Page) {
  const response = await page.request.post("/api/customer/login", {
    headers: { Origin: "http://localhost:3199" },
    data: { email: "customer-8@example.invalid", password: "Isolated-browser-test-123!" },
  });
  expect(response.status()).toBe(200);
}

async function mockAiApi(page: import("@playwright/test").Page) {
  const chatCalls: string[] = [];
  await page.route("**/api/ai/conversations**", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === "GET" && url.pathname.endsWith("/api/ai/conversations")) {
      await route.fulfill({ json: { conversations: [{ id: "cafe-1", title: "Cafe website", messages: [] }] } });
      return;
    }
    if (request.method() === "GET" && url.pathname.endsWith("/api/ai/conversations/cafe-1")) {
      await route.fulfill({ json: { conversation: {
        id: "cafe-1", title: "Cafe website", messages: [
          { id: "m1", role: "user", content: "I need a cafe website with table booking." },
          { id: "m2", role: "assistant", content: "We can shape the cafe experience around table booking and a clear menu.", },
        ],
      } } });
      return;
    }
    await route.continue();
  });
  await page.route("**/api/ai/chat", route => {
    chatCalls.push(route.request().url());
    return route.fulfill({
      status: 200,
      contentType: "application/x-ndjson",
      body: '{"type":"delta","text":"Add a focused menu section and keep the booking flow simple."}\n{"type":"done"}\n',
    });
  });
  return chatCalls;
}

for (const width of [1440, 390]) {
  test(`account AI chat fills the viewport and keeps its real controls at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await authenticate(page);
    const chatCalls = await mockAiApi(page);
    await page.goto("/blue-mind-ai?conversation=cafe-1");

    await expect(page.locator("header")).toHaveCount(0);
    await expect(page.locator('[data-account-fullscreen="true"]')).toBeVisible();
    await expect(page.getByText("I need a cafe website with table booking.", { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder("Ask BlueMind anything...")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect(await page.evaluate(() => document.body.dataset.bottomNavigation || "false")).toBe("false");

    const chatBox = await page.locator('[data-account-fullscreen="true"]').boundingBox();
    expect(chatBox?.x).toBe(0);
    expect(chatBox?.y).toBe(0);
    expect(chatBox?.width).toBe(width);
    expect(chatBox?.height).toBeGreaterThanOrEqual(899);

    await expect(page.getByRole("link", { name: "Back to account", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await expect(page.locator("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: "Cafe website", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "New chat", exact: true })).toBeVisible();
    await expect(page.locator("dialog").getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(page.locator("dialog").getByRole("link", { name: "BlueMind AI", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(page.locator("dialog").getByRole("link", { name: "Messages", exact: true })).toBeVisible();
    await expect(page.locator("dialog").getByRole("link", { name: "Account", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "New chat", exact: true }).click();
    await expect(page.getByText("How can I help with your website?", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await page.getByRole("button", { name: "Close sidebar", exact: true }).click();
    await expect(page.locator("dialog")).not.toBeVisible();

    await page.getByPlaceholder("Ask BlueMind anything...").fill("Please add a menu page.");
    await page.getByPlaceholder("Ask BlueMind anything...").press("Enter");
    await expect.poll(() => chatCalls.length).toBe(1);
    await expect(page.getByText("Add a focused menu section and keep the booking flow simple.", { exact: true })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: info.outputPath(`account-ai-chat-viewport-${width}.png`) });
    await page.screenshot({ path: info.outputPath(`account-ai-chat-${width}.png`), fullPage: true });

    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await page.locator("dialog").getByRole("link", { name: "Account", exact: true }).click();
    await expect(page).toHaveURL(/\/account$/);
    await page.screenshot({ path: info.outputPath(`account-ai-${width}.png`), fullPage: true });
  });
}

for (const locale of [
  { code: "sv", heading: "Hur kan jag hjälpa dig med din webbplats?", menu: "Öppna menyn", home: "Hem", dir: "ltr" },
  { code: "ar", heading: "كيف يمكنني مساعدتك في موقعك؟", menu: "فتح القائمة", home: "الرئيسية", dir: "rtl" },
]) {
  test(`account AI chat keeps the ${locale.code} interface localized`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.addInitScript(value => localStorage.setItem("bluemind-language", value), locale.code);
    await authenticate(page);
    await mockAiApi(page);
    await page.goto("/blue-mind-ai");

    await expect(page.getByText(locale.heading, { exact: true })).toBeVisible();
    await expect(page.locator('[data-account-fullscreen="true"]')).toHaveAttribute("dir", locale.dir);
    await page.getByRole("button", { name: locale.menu, exact: true }).click();
    await expect(page.locator("dialog").getByRole("link", { name: locale.home, exact: true })).toBeVisible();
  });
}
