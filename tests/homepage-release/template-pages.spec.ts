import { expect, test } from "@playwright/test";

const templates = [
  ["ecommerce", "morrow"],
  ["ai-platform", "aster"],
  ["photography", "june-atlas"],
  ["corporate", "meridian"],
  ["furniture", "form-field"],
  ["real-estate", "haven"],
  ["restaurant", "sera"],
];

for (const width of [390, 768, 1440]) {
  for (const [id, slug] of templates) {
    test(`${slug}: image, CTA and direct page at ${width}px`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/templates");
      const card = page.locator(`[data-project-card="${id}"]`);
      await expect(card).toHaveAttribute("href", `/templates/${slug}`);
      await card.locator(`[data-preview="${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/templates/${slug}$`));
      await expect(page.getByRole("dialog")).toHaveCount(0);
      const viewport = page.locator("[data-project-viewport]");
      await expect(viewport).toBeVisible();
      await expect(viewport.locator("h1")).toBeVisible();
      const box = (await viewport.boundingBox())!;
      expect(box.width).toBe(width);
      expect(box.x).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      expect(await viewport.evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(width);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: info.outputPath("template.png") });

      if (id === "ai-platform") {
        await expect(viewport.locator("textarea")).toHaveValue("");
      } else {
        const navigation = viewport.locator("header nav").first();
        if (await navigation.isVisible()) {
          await navigation.getByRole("button").first().click();
        } else {
          await viewport.getByRole("button", { name: /^Open .* menu$/ }).click();
          await viewport.locator('nav[aria-label$="mobile navigation"]').getByRole("button").first().click();
        }
        await expect.poll(() => viewport.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
      }
      // Scroll the real template to load its original lazy images and reach all sections.
      await viewport.evaluate(async el => {
        for (let top = 0; top < el.scrollHeight; top += 600) {
          el.scrollTop = top;
          await new Promise(resolve => setTimeout(resolve, 40));
        }
      });
      for (const image of await viewport.locator("img").all()) {
        await expect.poll(() => image.evaluate(el => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      const response = await page.reload();
      expect(response?.status()).toBe(200);
      await expect(viewport.locator("h1")).toBeVisible();
      await page.goto("/templates");
      await card.locator("[data-demo-cta]").click();
      await expect(page).toHaveURL(new RegExp(`/templates/${slug}$`));
      await expect(viewport).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test(`templates preserve all content and card geometry at ${width}px`, async ({ page, context }) => {
    const baseline = await context.newPage();
    try {
      for (const target of [page, baseline]) {
        await target.setViewportSize({ width, height: 900 });
        await target.emulateMedia({ reducedMotion: "reduce" });
      }
      await page.goto("/templates");
      await baseline.goto(`https://bluemind-web-service.vercel.app${process.env.TEMPLATES_REFERENCE_PATH || "/templates"}`);
      for (const target of [page, baseline]) await target.evaluate(() => document.fonts.ready);
      await expect(page.locator("#selected-work")).toHaveText((await baseline.locator("#selected-work").textContent())!);
      for (const [id] of templates) {
        const actual = page.locator(`[data-project-card="${id}"]`);
        const reference = baseline.locator(`[data-project-card="${id}"]`);
        const appearance = (el: Element) => {
          const style = getComputedStyle(el), box = el.getBoundingClientRect();
          return { width: box.width, height: box.height, font: style.font, color: style.color, background: style.backgroundColor, border: style.border, radius: style.borderRadius, padding: style.padding };
        };
        expect(await actual.evaluate(appearance)).toEqual(await reference.evaluate(appearance));
        expect(await actual.locator("img").evaluateAll(images => images.map(image => image.getAttribute("src")))).toEqual(await reference.locator("img").evaluateAll(images => images.map(image => image.getAttribute("src"))));
      }
    } finally { await baseline.close(); }
  });
}
