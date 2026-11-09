import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`header controls, scrolling and sign-in at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/");
    const header = page.locator("header[data-scrolled]");
    const language = header.getByRole("button", { name: "Selected language: English" });
    const menu = header.locator('button[aria-controls="home-navigation"]');
    const signIn = header.getByRole("link", { name: "Sign in", exact: true });
    const compactNavigation = width < 1024;
    await expect(signIn).toBeVisible();
    const expectPlainSignIn = async () => {
      await expect(signIn).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(signIn).toHaveCSS("border-top-width", "0px");
      await expect(signIn).toHaveCSS("border-radius", "0px");
      await expect(signIn).toHaveCSS("box-shadow", "none");
    };
    await expectPlainSignIn();
    await expect(signIn).toHaveAttribute("href", "/sign-in");
    await signIn.hover();
    await expectPlainSignIn();
    await page.mouse.move(0, 0);
    await expect(language).toBeVisible();
    if (compactNavigation) {
      await expect(menu).toBeHidden();
      const bottom = page.getByRole("navigation", { name: "Primary navigation", exact: true });
      await expect(bottom).toBeVisible();
      await expect(bottom.getByRole("link")).toHaveCount(4);
      await expect(bottom.getByRole("link", { name: "Menu", exact: true })).toBeVisible();
      expect(await page.evaluate(() => getComputedStyle(document.body).paddingBottom)).not.toBe("0px");
    } else {
      await expect(menu).toBeVisible();
    }
    await page.waitForTimeout(800);
    await page.screenshot({ path: testInfo.outputPath("homepage-header.png") });
    const headerControls = compactNavigation
      ? [header.getByRole("link", { name: "BlueMind Web Service home" }), signIn, language]
      : [header.getByRole("link", { name: "BlueMind Web Service home" }), signIn, language, menu];
    const boxes = await Promise.all(headerControls.map(element => element.boundingBox()));
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i]!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      for (const other of boxes.slice(i + 1)) {
        const overlap = box.x < other!.x + other!.width && box.x + box.width > other!.x && box.y < other!.y + other!.height && box.y + box.height > other!.y;
        expect(overlap).toBe(false);
      }
    }
    await language.click();
    await expect(header.getByRole("menuitemradio")).toHaveCount(3);
    await page.keyboard.press("Escape");
    await expect(language).toBeFocused();
    await expect(language).toHaveAttribute("aria-expanded", "false");
    if (!compactNavigation) {
      await menu.click();
      const navigation = header.getByRole("navigation");
      await expect(navigation).toBeVisible();
      await expect(navigation.locator("a")).toHaveCount(8);
      await page.keyboard.press("Escape");
    }
    await page.evaluate(() => scrollTo(0, 500));
    await expect(header).toHaveAttribute("data-scrolled", "true");
    await expect.poll(async () => (await header.boundingBox())!.y).toBe(0);
    await page.waitForTimeout(500);
    await page.screenshot({ path: testInfo.outputPath("sticky-header.png") });
    await signIn.click();
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(signIn).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1, name: "Get Started" })).toBeVisible();
    await expect(page.locator("main input, main form")).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Get Started" })).toBeVisible();
    await expect(page.locator("header[data-scrolled]")).toHaveCSS("position", "sticky");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("languages, keyboard selection and mutually exclusive menus", async ({ page }) => {
  await page.goto("/about");
  const header = page.locator("header[data-scrolled]");
  const language = header.locator('button[aria-controls="header-languages"]');
  await language.focus();
  await page.keyboard.press("ArrowDown");
  await expect(header.getByRole("menuitemradio", { name: /English/ })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(language).toHaveAttribute("aria-label", "Selected language: Svenska");
  await language.click();
  await header.getByRole("menuitemradio", { name: /العربية/ }).click();
  await expect(language).toHaveAttribute("aria-label", "Selected language: العربية");
  await page.reload();
  await expect(language).toHaveAttribute("aria-label", "Selected language: العربية");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const headerMenu = header.locator('button[aria-controls="home-navigation"]');
  if (await headerMenu.isVisible()) {
    await headerMenu.click();
    await language.click();
    await expect(headerMenu).toHaveAttribute("aria-expanded", "false");
  } else {
    await expect(headerMenu).toBeHidden();
  }
  await page.locator("main").click({ position: { x: 10, y: 300 } });
  await expect(language).toHaveAttribute("aria-expanded", "false");
  await language.click();
  await header.getByRole("menuitemradio", { name: /English/ }).click();
  await expect(language).toHaveAttribute("aria-label", "Selected language: English");
});

test("existing navigation destinations load and AI remains outside the marketing shell", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/", "/about", "/services", "/templates", "/templates/morrow", "/how-we-work", "/care", "/contact", "/quote"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await page.locator('button[aria-controls="home-navigation"]').click();
    await expect(page.locator("#home-navigation")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator('button[aria-controls="home-navigation"]')).toBeFocused();
  }
  await page.goto("/ask-ai");
  await expect(page.locator("header[data-scrolled]")).toHaveCount(0);
});

test("reduced motion disables header transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  await expect(page.locator('button[aria-controls="home-navigation"]')).toHaveCSS("transition-duration", "0s");
});
