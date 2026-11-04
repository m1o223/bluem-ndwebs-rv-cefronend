import { expect, test } from "@playwright/test";

for (const width of [390, 768, 1440]) {
  test(`Menu opens the complete Templates page at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const space = page.locator("#selected-work");
    await expect(space).toBeEmpty();
    await expect(space).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("[data-project-card]")).toHaveCount(0);
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    const link = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Website Concepts", exact: true });
    await expect(link).toHaveAttribute("href", "/templates");
    await link.click();
    await expect(page).toHaveURL(/\/templates$/);
    await expect(page.getByRole("heading", { name: "Website Concepts", level: 1 })).toBeVisible();
    await expect(page.locator("[data-project-card]")).toHaveCount(7);
    expect(await page.locator("[data-project-card]").evaluateAll(cards => cards.map(card => card.getAttribute("data-project-card")))).toEqual(["ecommerce", "ai-platform", "photography", "corporate", "furniture", "real-estate", "restaurant"]);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: info.outputPath("templates.png") });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect((await page.reload())?.status()).toBe(200);
    await expect(page.locator("[data-project-card]")).toHaveCount(7);
    await page.locator("header").getByRole("link", { name: "BlueMind Web Service home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(space).toBeEmpty();
  });

  test(`homepage content layout is preserved below the shared header at ${width}px`, async ({ page, context }) => {
    const baseline = await context.newPage();
    try {
      for (const target of [page, baseline]) {
        await target.setViewportSize({ width, height: 900 });
        await target.emulateMedia({ reducedMotion: "reduce" });
      }
      await page.goto("/");
      await baseline.goto("https://bluemind-web-service.vercel.app/");
      for (const target of [page, baseline]) await target.evaluate(() => document.fonts.ready);
      const headerDelta = (await page.locator("body > header").boundingBox())!.height - (await baseline.locator("body > header").boundingBox())!.height;
      for (const selector of ["[data-hero]", "#selected-work", 'section[aria-labelledby="about-summary-title"]', "footer"]) {
        const actual = page.locator(selector).first(), reference = baseline.locator(selector).first();
        const box = (await actual.boundingBox())!, original = (await reference.boundingBox())!;
        for (const key of ["x", "y", "width", "height"] as const) {
          expect(Math.abs(box[key] - original[key] - (key === "y" ? headerDelta : 0)), `${selector}: ${key}`).toBeLessThan(0.1);
        }
        if (selector !== "#selected-work") expect(await actual.textContent()).toBe(await reference.textContent());
      }
    } finally { await baseline.close(); }
  });
}

for (const locale of ["en", "sv", "ar"]) {
  test(`empty homepage footprint matches original collection at responsive boundaries in ${locale}`, async ({ page, context }) => {
    test.setTimeout(120000);
    const collection = await context.newPage();
    try {
      for (const target of [page, collection]) {
        await target.emulateMedia({ reducedMotion: "reduce" });
        await target.addInitScript(language => localStorage.setItem("bluemind-language", language), locale);
      }
      await page.goto("/");
      await collection.goto("/templates");
      for (const target of [page, collection]) {
        await target.waitForFunction(language => document.body.dataset.locale === language, locale);
        await target.evaluate(() => document.fonts.ready);
      }
      const widths = [320, 323, 324, 329, 330, 335, 336, 339, 340, 350, 351, 353, 354, 361, 362, 372, 373, 378, 379, 382, 383, 384, 385, 390, 391, 392, 393, 395, 396, 405, 406, 411, 412, 413, 414, 418, 419, 420, 421, 424, 425, 429, 430, 434, 435, 436, 449, 450, 451, 452, 480, 491, 492, 620, 621, 700, 701, 730, 731, 736, 737, 760, 761, 768, 775, 776, 796, 797, 798, 799, 820, 824, 825, 842, 843, 851, 852, 855, 856, 857, 862, 863, 873, 874, 882, 883, 885, 886, 1012, 1013, 1024, 1120, 1121, 1440, 1920];
      for (const width of widths) {
        for (const target of [page, collection]) await target.setViewportSize({ width, height: 900 });
        const actual = (await page.locator("#selected-work").boundingBox())!;
        const reference = (await collection.locator("#selected-work").boundingBox())!;
        expect(Math.abs(actual.height - reference.height), `${locale} at ${width}px`).toBeLessThan(0.1);
        expect(actual.width).toBe(reference.width);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      }
    } finally { await collection.close(); }
  });
}
