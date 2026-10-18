import { expect, test } from "@playwright/test";

const locales = [
  { code: "en", trigger: "Ask BlueMind AI", close: "Close", message: "BlueMind AI is coming soon. We\u2019re working on something exciting!" },
  { code: "sv", trigger: "Fr\u00e5ga BlueMind AI", close: "St\u00e4ng", message: "BlueMind AI kommer snart. Vi arbetar p\u00e5 n\u00e5got sp\u00e4nnande!" },
  { code: "ar", trigger: "\u0627\u0633\u0623\u0644 BlueMind AI", close: "\u0625\u063a\u0644\u0627\u0642", message: "BlueMind AI \u0642\u0627\u062f\u0645 \u0642\u0631\u064a\u0628\u0627\u064b. \u0646\u0639\u0645\u0644 \u0639\u0644\u0649 \u0634\u064a\u0621 \u0645\u0645\u064a\u0632!" },
];

for (const width of [320, 375, 768, 1440]) {
  for (const locale of locales) {
    test(`${locale.code} modal at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(code => localStorage.setItem("bluemind-language", code), locale.code);
      const errors: string[] = [];
      const apiRequests: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.route("**/api/**", route => { apiRequests.push(route.request().url()); return route.abort(); });
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      const hero = page.locator("[data-hero]");
      const trigger = hero.getByRole("button", { name: locale.trigger, exact: true });
      await expect(trigger).toBeVisible();
      await expect(hero.locator('a[href="/quote"]')).toHaveCount(1);
      await expect(hero.locator('a[href="#selected-work"]')).toHaveCount(1);
      await expect(hero.locator("h1 > span")).toHaveCount(3);
      // Compare against the original link using the unchanged hero class and translated label.
      const sizes = await trigger.evaluate(button => {
        const link = document.createElement("a");
        link.className = button.classList[0];
        link.textContent = button.children[0].textContent;
        link.style.position = "absolute";
        button.parentElement!.append(link);
        const original = link.getBoundingClientRect();
        const actual = button.getBoundingClientRect();
        link.remove();
        return { originalWidth: original.width, originalHeight: original.height, width: actual.width, height: actual.height };
      });
      expect(sizes.width).toBeCloseTo(sizes.originalWidth, 0);
      expect(sizes.height).toBe(sizes.originalHeight);
      await trigger.scrollIntoViewIfNeeded();
      const scrollBefore = await page.evaluate(() => window.scrollY);
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "BlueMind AI" });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveCSS("opacity", "1");
      await expect(dialog.getByText(locale.message, { exact: true })).toBeVisible();
      await expect(dialog.locator("textarea, input, [role=log]")).toHaveCount(0);
      expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
      const bounds = await dialog.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);
      await page.screenshot({ path: testInfo.outputPath("modal.png") });
      const closes = dialog.getByRole("button", { name: locale.close, exact: true });
      await expect(closes).toHaveCount(2);
      await closes.last().focus();
      await page.keyboard.press("Tab");
      await expect(closes.first()).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(closes.last()).toBeFocused();
      await closes.last().click();
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
      expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(scrollBefore, 0);
      await trigger.click();
      await dialog.getByRole("button", { name: locale.close, exact: true }).first().click();
      await expect(dialog).toHaveCount(0);
      await trigger.click();
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      expect(apiRequests).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}

test("reduced motion and unchanged Get Started navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("[data-hero]").getByRole("button", { name: "Ask BlueMind AI" }).click();
  const dialog = page.getByRole("dialog");
  expect(await dialog.evaluate(element => getComputedStyle(element).animationName)).toBe("none");
  await page.keyboard.press("Escape");
  await page.locator('[data-hero] a[href="/quote"]').click();
  await expect(page).toHaveURL(/\/quote$/);
});
