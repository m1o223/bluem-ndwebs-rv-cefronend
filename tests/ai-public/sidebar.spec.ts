import { expect, test } from "@playwright/test";

for (const width of [1024, 1440, 1920]) test(`desktop sidebar header and logo interaction at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/ask-ai");
  const sidebar = page.getByRole("complementary", { name: "Chat sidebar" });
  const title = sidebar.getByText("BlueMind AI", { exact: true });
  const close = sidebar.getByRole("button", { name: "Collapse sidebar" });
  const newChat = sidebar.getByRole("button", { name: "New chat" });
  await expect(title).toBeVisible();
  const bounds = (await sidebar.boundingBox())!;
  const control = (await close.boundingBox())!;
  const label = (await title.boundingBox())!;
  expect(bounds.x + bounds.width - control.x - control.width).toBeLessThan(16);
  expect(Math.abs(label.y + label.height / 2 - control.y - control.height / 2)).toBeLessThan(1);
  await expect(newChat).toHaveCSS("border-width", "0px");
  await expect(newChat).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(newChat).toHaveCSS("color", "rgb(65, 72, 82)");
  await newChat.hover();
  await expect(newChat).toHaveCSS("color", "rgb(20, 45, 78)");
  await expect(newChat).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await newChat.click();
  await expect(newChat).toHaveAttribute("data-activated", "true");
  await page.mouse.move(width - 100, 300);
  await expect(newChat).toHaveAttribute("data-activated", "false");
  await expect(newChat).toHaveCSS("color", "rgb(65, 72, 82)");
  await page.screenshot({ path: testInfo.outputPath("expanded.png") });
  await close.click();
  const open = sidebar.getByRole("button", { name: "Expand sidebar" });
  await page.mouse.move(width - 100, 300);
  const logo = open.locator("[data-bluemind-logo]");
  await expect(logo).toHaveCSS("opacity", "1");
  await expect(open.locator("svg")).toHaveCSS("opacity", "0");
  await expect.poll(async () => Math.round((await sidebar.boundingBox())!.width)).toBe(72);
  const small = (await sidebar.boundingBox())!;
  const toggle = (await open.boundingBox())!;
  expect(Math.abs(toggle.x + toggle.width / 2 - small.x - (small.width - 1) / 2)).toBeLessThan(1);
  await page.screenshot({ path: testInfo.outputPath("collapsed.png") });
  await open.hover();
  await expect(logo).toHaveCSS("opacity", "0");
  await expect(open.locator("svg")).toHaveCSS("opacity", "1");
  await expect(open).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await page.mouse.move(width - 100, 300);
  await expect(logo).toHaveCSS("opacity", "1");
  await newChat.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(open).toBeFocused();
  await expect(open.locator("svg")).toHaveCSS("opacity", "1");
  await open.press("Enter");
  await expect(close).toBeVisible();
  await expect.poll(async () => Math.round((await sidebar.boundingBox())!.width)).toBe(248);
  for (let index = 0; index < 6; index++) await sidebar.getByRole("button", { name: /^(Collapse|Expand) sidebar$/ }).press("Space");
  await expect.poll(async () => Math.round((await sidebar.boundingBox())!.width)).toBe(248);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("new chat and history retain their existing behavior", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/api/ai/chat", route => route.fulfill({
    contentType: "application/x-ndjson",
    body: '{"type":"delta","text":"Sidebar test response."}\n{"type":"done"}\n',
  }));
  await page.goto("/ask-ai");
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  const sidebar = page.getByRole("complementary");
  const history = sidebar.getByRole("navigation", { name: "Conversation history" });
  await input.fill("My first project");
  await input.press("Enter");
  await expect(page.getByRole("group", { name: "Response actions" })).toBeVisible();
  await sidebar.getByRole("button", { name: "New chat" }).click();
  await expect(input).toHaveValue("");
  await expect(page.getByRole("heading", { name: "BlueMind AI" })).toBeVisible();
  await expect(history.getByRole("button")).toHaveCount(1);
  await history.getByRole("button", { name: "My first project" }).click();
  await expect(page.getByLabel("BlueMind AI response", { exact: true })).toContainText("Sidebar test response.");
  await expect(history.getByRole("button", { name: "My first project" })).toHaveAttribute("aria-current", "page");
});

for (const width of [768, 1023, 1366]) test(`touch tablet keeps original sidebar at ${width}px`, async ({ browser }, testInfo) => {
  const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL, viewport: { width, height: 1024 }, hasTouch: true, isMobile: true });
  try {
    const page = await context.newPage();
    await page.goto("/ask-ai");
    const sidebar = page.getByRole("complementary");
    await expect(sidebar.getByText("BlueMind AI", { exact: true })).toBeHidden();
    await expect(sidebar.getByRole("button", { name: "New chat" })).toHaveCSS("border-width", "1px");
    await sidebar.getByRole("button", { name: "Collapse sidebar" }).tap();
    const open = sidebar.getByRole("button", { name: "Expand sidebar" });
    await expect(open.locator("[data-bluemind-logo]")).toBeHidden();
    await expect(open.locator("svg")).toHaveCSS("opacity", "1");
    await open.tap();
    await expect(sidebar.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
  } finally { await context.close(); }
});

test("mobile drawer keeps its original controls", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/ask-ai");
  await page.getByRole("button", { name: "Open sidebar" }).click();
  const drawer = page.getByRole("dialog", { name: "Chat sidebar" });
  await expect(drawer.getByRole("button", { name: "New chat" })).toHaveCSS("border-width", "1px");
  await expect(drawer.locator("[data-bluemind-logo]")).toHaveCount(0);
  await drawer.getByRole("button", { name: "Close sidebar" }).click();
  await expect(drawer).toBeHidden();
});
