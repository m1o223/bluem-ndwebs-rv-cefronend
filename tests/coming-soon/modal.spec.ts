import { expect, test } from "@playwright/test";

const locales = [
  { code: "en", trigger: "Ask BlueMind AI" },
  { code: "sv", trigger: "Fr\u00e5ga BlueMind AI" },
  { code: "ar", trigger: "\u0627\u0633\u0623\u0644 BlueMind AI" },
];

for (const width of [320, 375, 768, 1440]) {
  for (const locale of locales) {
    test(`${locale.code} owner entry at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(code => localStorage.setItem("bluemind-language", code), locale.code);
      await page.route("**/api/ai/session", route => route.fulfill({ status: 401, json: { code: "unauthorized" } }));
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/");
      const hero = page.locator("[data-hero]");
      const trigger = hero.getByRole("link", { name: locale.trigger, exact: true });
      await expect(trigger).toBeVisible();
      await expect(hero.locator('a[href="/quote"]')).toHaveCount(1);
      await expect(hero.locator("h1 > span")).toHaveCount(3);
      await trigger.click();
      await expect(page).toHaveURL(/\/ask-ai$/);
      await expect(page.getByRole("heading", { name: "BlueMind AI" })).toBeVisible();
      await expect(page.getByText("Private owner testing. Public access is not available.")).toBeVisible();
      await expect(page.locator("header, footer, textarea")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath("owner-entry.png") });
      await page.getByRole("link", { name: "Close", exact: true }).click();
      await expect(page).toHaveURL(/\/$/);
      expect(errors).toEqual([]);
    });
  }
}
test("Get Started navigation remains unchanged", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-hero] a[href="/quote"]').click();
  await expect(page).toHaveURL(/\/quote$/);
});
