import { expect, test, type Page } from "@playwright/test";

const input = (page: Page) => page.getByRole("textbox", { name: "Message", exact: true });
const composer = (page: Page) => page.locator("form").filter({ has: input(page) });
const answer = (page: Page) => page.getByLabel("BlueMind AI response", { exact: true });

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/ai/chat", route => route.fulfill({ contentType: "application/x-ndjson", body:
    '{"type":"delta","text":"A clear website starts with a useful plan."}\n{"type":"done"}\n' }));
  await page.goto("/ask-ai");
  await expect(page.getByRole("heading", { name: "BlueMind AI", exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

const viewports = [
  { width: 320, height: 740 }, { width: 375, height: 812 },
  { width: 768, height: 1024 }, { width: 1023, height: 768 },
  { width: 1024, height: 768 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 },
];

// These baselines are captured before the desktop welcome redesign.
for (const { width, height } of viewports) {
  if (width < 1024) test(`unchanged mobile/tablet welcome at ${width}px`, async ({ page }) => {
    await open(page, width, height);
    const prompt = await page.getByRole("button", { name: "Create a website", exact: true }).boundingBox();
    const form = await composer(page).boundingBox();
    expect(prompt!.y + prompt!.height).toBeLessThanOrEqual(form!.y);
    await expect(composer(page)).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(page).toHaveScreenshot(`welcome-preserved-${width}.png`, { animations: "disabled", maxDiffPixels: 0 });
  });

  test(`unchanged conversation layout at ${width}px`, async ({ page }) => {
    await open(page, width, height);
    await input(page).fill("Help me plan my website");
    await input(page).press("Enter");
    await expect(answer(page).getByRole("group", { name: "Response actions" })).toBeVisible();
    await input(page).blur();
    await expect(page.getByRole("heading", { name: "BlueMind AI", exact: true })).not.toBeVisible();
    await expect(composer(page)).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(page).toHaveScreenshot(`conversation-preserved-${width}.png`, { animations: "disabled", maxDiffPixels: 0 });
  });
}

for (const { width, height } of [{ width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
  test(`desktop-only large welcome composer at ${width}px`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await open(page, width, height);
    const main = await page.getByRole("main").boundingBox();
    const form = await composer(page).boundingBox();
    expect(form!.width / main!.width).toBeCloseTo(.6, 2);
    expect(Math.abs(form!.x + form!.width / 2 - main!.x - main!.width / 2)).toBeLessThan(1);
    expect(form!.height).toBeGreaterThanOrEqual(110);
    expect(form!.height).toBeLessThanOrEqual(130);
    await expect(composer(page)).toHaveCSS("background-color", "rgb(247, 248, 250)");
    const title = await page.getByRole("heading", { name: "BlueMind AI", exact: true }).boundingBox();
    expect(title!.y).toBeLessThan(height * .45);
    expect(title!.y + title!.height).toBeLessThan(form!.y);
    for (const label of ["Create a website", "Design a page", "Improve my website", "Business ideas", "Help me get started", "Explore our services"]) {
      const chip = page.getByRole("button", { name: label, exact: true });
      await expect(chip).toBeInViewport();
      const box = await chip.boundingBox();
      expect(box!.y).toBeGreaterThan(form!.y + form!.height);
      expect(box!.x).toBeGreaterThanOrEqual(form!.x - 1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(form!.x + form!.width + 1);
    }
    await page.screenshot({ path: testInfo.outputPath("desktop-welcome.png") });
    await page.getByRole("button", { name: "Explore our services", exact: true }).click();
    await expect(input(page)).toHaveValue("Explore our services");
    await expect(page.getByRole("article")).toHaveCount(0);
    await input(page).fill(Array.from({ length: 20 }, (_, index) => `Line ${index}`).join("\n"));
    expect((await composer(page).boundingBox())!.height).toBeGreaterThan(form!.height);
    expect((await input(page).boundingBox())!.height).toBeLessThanOrEqual(180);
    await input(page).fill("");
    expect((await composer(page).boundingBox())!.height).toBe(form!.height);
    await page.getByRole("button", { name: "Add attachment", exact: true }).click();
    await expect(page.getByRole("group", { name: "Attachments", exact: true })).toBeInViewport();
    await page.keyboard.press("Escape");
    await input(page).fill("A first message");
    await input(page).press("Enter");
    await expect(answer(page).getByRole("group", { name: "Response actions" })).toBeVisible();
    await expect(composer(page)).toHaveCSS("background-color", "rgb(255, 255, 255)");
    expect((await composer(page).boundingBox())!.height).toBeLessThan(90);
    await page.getByRole("button", { name: "New chat", exact: true }).click();
    await expect(composer(page)).toHaveCSS("background-color", "rgb(247, 248, 250)");
    await expect(input(page)).toHaveValue("");
    await expect(page.getByRole("heading", { name: "BlueMind AI", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("breakpoint and sidebar changes keep the draft and select only the correct welcome layout", async ({ page }) => {
  await open(page, 1440, 900);
  await input(page).fill("Keep this unsent idea");
  await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
  const main = await page.getByRole("main").boundingBox();
  expect((await composer(page).boundingBox())!.width / main!.width).toBeCloseTo(.6, 2);
  for (const width of [1023, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(input(page)).toHaveValue("Keep this unsent idea");
    await expect(composer(page)).toHaveCSS("background-color", width < 1024 ? "rgb(255, 255, 255)" : "rgb(247, 248, 250)");
    const chip = await page.getByRole("button", { name: "Create a website", exact: true }).boundingBox();
    const form = await composer(page).boundingBox();
    expect(width < 1024 ? chip!.y < form!.y : chip!.y > form!.y + form!.height).toBe(true);
    await expect(input(page)).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("short desktop windows keep all welcome controls reachable", async ({ page }) => {
  await open(page, 1024, 480);
  const logo = page.locator("[data-bluemind-logo]");
  await expect(logo).toHaveCSS("width", "88px");
  await expect(logo).toHaveCSS("height", "88px");
  expect(await logo.evaluate(element => element.getBoundingClientRect().top >= element.parentElement!.parentElement!.getBoundingClientRect().top)).toBe(true);
  await input(page).fill("An idea");
  await page.getByRole("button", { name: "Send message", exact: true }).scrollIntoViewIfNeeded();
  await expect(input(page)).toBeInViewport();
  await page.getByRole("button", { name: "Explore our services", exact: true }).click();
  await expect(input(page)).toHaveValue("Explore our services");
  await page.getByRole("link", { name: "Close", exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("link", { name: "Close", exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const width of [1024, 1366]) test(`wide touch tablet retains the original welcome layout at ${width}px`, async ({ browser }, testInfo) => {
  const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL, viewport: { width, height: 1024 }, isMobile: true, hasTouch: true });
  try {
    const page = await context.newPage();
    await open(page, width, 1024);
    expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
    await expect(composer(page)).toHaveCSS("background-color", "rgb(255, 255, 255)");
    const form = await composer(page).boundingBox();
    const chip = await page.getByRole("button", { name: "Create a website", exact: true }).boundingBox();
    expect(form!.height).toBeLessThan(90);
    expect(chip!.y + chip!.height).toBeLessThanOrEqual(form!.y);
    await expect(input(page)).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await context.close(); }
});
