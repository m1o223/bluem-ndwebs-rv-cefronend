import { expect, test } from "@playwright/test";

for (const locale of ["en", "ar", "sv"] as const) {
  for (const width of [320, 390, 768, 1440]) {
    test(`homepage removes the retired process mockups without overflow in ${locale} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(language => localStorage.setItem("bluemind-language", language), locale);
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);

      await expect(page.locator("#home-how-we-work")).toHaveCount(0);
      await expect(page.locator("#home-meet-ai")).toHaveCount(0);
      await expect(page.getByText("Thoughtful design", { exact: true })).toHaveCount(0);
      await expect(page.getByText("Your request", { exact: true })).toHaveCount(0);
      await expect(page.locator("[data-payment-methods]")).toBeVisible();
      await expect(page.locator("#what-we-do-title")).toBeVisible();
      await expect(page.locator('section[aria-labelledby="about-summary-title"]')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      expect(errors).toEqual([]);
    });
  }
}
