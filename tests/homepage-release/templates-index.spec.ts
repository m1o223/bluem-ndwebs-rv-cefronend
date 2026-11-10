import { expect, test } from "@playwright/test";

for (const width of [390, 768, 1440]) {
  test(`Menu opens the complete Templates page at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("[data-project-card]")).toHaveCount(0);
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    const link = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Website Concepts", exact: true });
    await expect(link).toHaveAttribute("href", "/templates");
    await link.click();
    await expect(page).toHaveURL(/\/templates$/);
    await expect(page.getByRole("heading", { name: "Website Concepts", level: 1 })).toBeVisible();
    await expect(page.locator("[data-project-card]")).toHaveCount(8);
    expect(await page.locator("[data-project-card]").evaluateAll(cards => cards.map(card => card.getAttribute("data-project-card")))).toEqual(["ecommerce", "ai-platform", "photography", "corporate", "furniture", "real-estate", "restaurant", "online-store"]);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: info.outputPath("templates.png") });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect((await page.reload())?.status()).toBe(200);
    await expect(page.locator("[data-project-card]")).toHaveCount(8);
    await page.locator("header").getByRole("link", { name: "BlueMind Web Service home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("[data-project-card]")).toHaveCount(0);
  });

  test(`homepage content keeps the intended order after the process mockups at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("[data-payment-methods]")).toBeVisible();
    await expect(page.locator("#what-we-do-title")).toBeVisible();
    await expect(page.locator('section[aria-labelledby="about-summary-title"]')).toBeVisible();
    const paymentTop = (await page.locator("[data-payment-methods]").boundingBox())!.y;
    const whatWeDoTop = (await page.locator("#what-we-do-title").boundingBox())!.y;
    const aboutTop = (await page.locator('section[aria-labelledby="about-summary-title"]').boundingBox())!.y;
    expect(whatWeDoTop).toBeGreaterThan(paymentTop);
    expect(aboutTop).toBeGreaterThan(whatWeDoTop);
    await expect(page.locator("#home-how-we-work, #home-meet-ai")).toHaveCount(0);
  });
}

for (const locale of ["en", "sv", "ar"]) {
  test(`homepage has no retired showcase footprint at responsive boundaries in ${locale}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(language => localStorage.setItem("bluemind-language", language), locale);
    await page.goto("/");
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator("#selected-work")).toHaveCount(0);
      await expect(page.locator("#home-how-we-work, #home-meet-ai")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    }
  });
}
