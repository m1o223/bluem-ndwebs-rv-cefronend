import { expect, test } from "@playwright/test";

const locales = [
  { code: "en", trigger: "Ask BlueMind AI" },
  { code: "sv", trigger: "Fr\u00e5ga BlueMind AI" },
  { code: "ar", trigger: "\u0627\u0633\u0623\u0644 BlueMind AI" },
];

for (const width of [320, 375, 768, 1440]) {
  for (const locale of locales) {
    test(`${locale.code} direct chat entry at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(code => localStorage.setItem("bluemind-language", code), locale.code);
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/");
      const hero = page.locator("[data-hero]");
      const trigger = hero.getByRole("link", { name: locale.trigger, exact: true });
      await expect(trigger).toBeVisible();
      await expect(hero.locator('a[href="/quote"]')).toHaveCount(1);
      const widthBefore = await page.evaluate(() => document.documentElement.scrollWidth);
      await trigger.click();
      const scrollAtOpen = await page.evaluate(() => window.scrollY);
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByRole("dialog").getByRole("heading", { name: /BlueMind AI/i })).toBeVisible();
      await expect(page.getByRole("dialog")).toContainText(/coming soon|kommer snart|\u0642\u064a\u062f \u0627\u0644\u062a\u062c\u0647\u064a\u0632/i);
      expect(await page.evaluate(() => window.scrollY)).toBe(scrollAtOpen);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(widthBefore);
      await page.screenshot({ path: testInfo.outputPath("coming-soon.png") });
      await page.getByRole("button", { name: /Got it|Okej|\u062a\u0645\u0627\u0645/i }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      expect(await page.evaluate(() => window.scrollY)).toBe(scrollAtOpen);
      expect(errors).toEqual([]);
    });
  }
}
test("Get Started navigation remains unchanged", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-hero] a[href="/quote"]').click();
  await expect(page).toHaveURL(/\/quote$/);
});

test("direct chat route shows the coming-soon page", async ({ page }) => {
  await page.goto("/ask-ai");
  await expect(page.getByRole("heading", { name: /BlueMind AI/i })).toBeVisible();
  await expect(page.getByText(/coming soon|\u0642\u064a\u062f \u0627\u0644\u062a\u062c\u0647\u064a\u0632/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Back to website/i })).toHaveAttribute("href", "/");
});
