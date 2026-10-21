import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page, baseURL }) => {
  if (process.env.VERCEL_OIDC_TOKEN && baseURL) {
    const origin = new URL(baseURL).origin;
    await page.route(`${origin}/**`, route => route.continue({ headers: { ...route.request().headers(), "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN! } }));
  }
});

for (const width of [320, 375, 768, 1440]) {
  test(`complete chat flow at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 900 });
    const errors: string[] = [];
    const requests: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("request", request => { if (request.url().includes("/api/") || request.method() !== "GET") requests.push(request.url()); });
    await page.goto("/ask-ai");
    await expect(page.locator("header, footer")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "BlueMind AI" })).toBeVisible();
    await expect(page.getByText("What can I help you create?")).toBeVisible();
    await expect(page.locator("img")).toHaveAttribute("src", /bluemind-original-logo-transparent/);
    await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled();
    await expect(page.getByRole("status")).toHaveText("AI responses are not connected");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.screenshot({ path: info.outputPath("empty.png") });
    for (const suggestion of ["Create a website", "Design a page", "Improve my website", "Business ideas", "Help me get started", "Explore our services"]) {
      await page.getByRole("button", { name: suggestion, exact: true }).click();
      await expect(page.getByRole("textbox", { name: "Message", exact: true })).toHaveValue(suggestion);
      await expect(page.getByRole("article")).toHaveCount(0);
    }
    const input = page.getByRole("textbox", { name: "Message", exact: true });
    await input.fill("My first website");
    await input.press("Shift+Enter");
    await input.pressSequentially("A second line");
    await expect(input).toHaveValue("My first website\nA second line");
    await input.press("Enter");
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByRole("article")).toHaveText("My first website\nA second line");
    await expect(page.getByRole("heading", { name: "BlueMind AI" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Create a website", exact: true })).toBeHidden();
    await expect(input).toHaveValue("");
    await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))));
    await page.screenshot({ path: info.outputPath("conversation.png") });
    if (width < 768) {
      await expect(page.getByRole("button", { name: "New chat", exact: true })).toBeHidden();
      await page.getByRole("button", { name: "Open sidebar" }).click();
      await expect(page.getByRole("dialog", { name: "Chat sidebar" })).toBeVisible();
      await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))));
      expect((await page.getByRole("dialog").boundingBox())!.x).toBe(0);
      await page.screenshot({ path: info.outputPath("drawer.png") });
    }
    await expect(page.getByRole("navigation", { name: "Conversation history" }).getByRole("button")).toHaveCount(1);
    await page.getByRole("button", { name: "New chat", exact: true }).click();
    await expect(page.getByRole("heading", { name: "BlueMind AI" })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);
    await expect(page.getByRole("dialog")).toBeHidden();
    await input.fill("Second conversation");
    await page.getByRole("button", { name: "Send message" }).click();
    if (width < 768) await page.getByRole("button", { name: "Open sidebar" }).click();
    await expect(page.getByRole("navigation", { name: "Conversation history" }).getByRole("button")).toHaveCount(2);
    await page.getByRole("button", { name: "My first website A second line", exact: true }).click();
    await expect(page.getByRole("article")).toHaveText("My first website\nA second line");
    await input.fill("Follow up");
    await input.press("Enter");
    await expect(page.getByRole("article")).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const inputBox = (await input.boundingBox())!;
    expect(inputBox.y + inputBox.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    await page.reload();
    await expect(page.getByRole("heading", { name: "BlueMind AI" })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);
    await expect(page.locator("nav button")).toHaveCount(0);
    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
  });
}

test("textarea grows, caps its height, ignores empty input and composing Enter", async ({ page }) => {
  await page.goto("/ask-ai");
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  const initial = (await input.boundingBox())!.height;
  await input.fill("Line 1\nLine 2\nLine 3");
  expect((await input.boundingBox())!.height).toBeGreaterThan(initial);
  await input.fill(Array.from({ length: 30 }, (_, i) => `Line ${i}`).join("\n"));
  expect((await input.boundingBox())!.height).toBe(180);
  expect(await input.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  await input.dispatchEvent("keydown", { key: "Enter", isComposing: true });
  await expect(page.getByRole("article")).toHaveCount(0);
  await input.fill("   \n ");
  await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled();
  await input.press("Enter");
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("sidebar collapse, attachment menu, reduced motion and long text", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ask-ai");
  const before = (await page.locator("main").boundingBox())!.width;
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  expect((await page.locator("main").boundingBox())!.width).toBeGreaterThan(before);
  await page.screenshot({ path: info.outputPath("collapsed.png") });
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.getByRole("button", { name: "Add attachment" }).click();
  await expect(page.getByRole("group", { name: "Attachments" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add image" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Add file" })).toBeDisabled();
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("group", { name: "Attachments" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add attachment" })).toBeFocused();
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("LongText".repeat(200));
  await page.getByRole("button", { name: "Send message" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await page.setViewportSize({ width: 375, height: 400 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  const box = (await page.getByRole("textbox", { name: "Message", exact: true }).boundingBox())!;
  expect(box.y + box.height).toBeLessThan(400);
  await page.getByRole("button", { name: "Open sidebar" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("button", { name: "Open sidebar" })).toBeFocused();
});

test("homepage entry and close with unsent draft confirmation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator('[data-hero] a[href="/ask-ai"]').click();
  await expect(page).toHaveURL(/\/ask-ai$/);
  await expect(page.getByRole("heading", { name: "BlueMind AI" })).toBeVisible();
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Unsent draft");
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("link", { name: "Close", exact: true }).click();
  await expect(page).toHaveURL(/\/ask-ai$/);
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("link", { name: "Close", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("body > header")).toBeVisible();
  await expect(page.locator("body > footer")).toHaveCount(1);
  await page.goto("/ask-ai");
  let prompts = 0;
  page.on("dialog", dialog => { prompts++; void dialog.dismiss(); });
  await page.getByRole("link", { name: "Close", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(prompts).toBe(0);
});

test("composer follows the mobile visual viewport when the keyboard opens", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/ask-ai");
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  await input.fill("Keyboard preview");
  await input.press("Enter");
  await page.evaluate(() => {
    Object.defineProperty(window.visualViewport, "height", { configurable: true, value: 380 });
    window.visualViewport!.dispatchEvent(new Event("resize"));
  });
  const bounds = (await input.boundingBox())!;
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(380);
  expect(bounds.y).toBeGreaterThan(60);
});

test("other page shells and Get Started remain intact", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator('[data-hero] a[href="/quote"]').click();
  await expect(page).toHaveURL(/\/quote$/);
  for (const path of ["/quote", "/about", "/services", "/how-we-work", "/care", "/contact", "/our-work"]) {
    await page.goto(path);
    await expect(page.locator("body > header")).toBeVisible();
    await expect(page.locator("body > footer")).toHaveCount(1);
    await expect(page.locator("main.page-content")).toBeVisible();
  }
});

test("English preview keeps its layout after entering from the Arabic homepage", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("bluemind-language", "ar"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator('[data-hero] a[href="/ask-ai"]').click();
  await expect(page.getByRole("heading", { name: "BlueMind AI" })).toBeVisible();
  expect((await page.getByRole("complementary", { name: "Chat sidebar" }).boundingBox())!.x).toBe(0);
  const close = (await page.getByRole("link", { name: "Close", exact: true }).boundingBox())!;
  expect(close.x).toBeGreaterThan(page.viewportSize()!.width - 80);
});
