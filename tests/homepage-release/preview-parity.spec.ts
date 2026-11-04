import { expect, test } from "@playwright/test";
import sharp from "sharp";

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`homepage visually matches approved preview at ${width}px`, async ({ page, browser }, info) => {
    test.skip(!process.env.REFERENCE_URL || !process.env.VERCEL_OIDC_TOKEN, "Authenticated preview comparison is opt-in.");
    const reference = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    try {
      const origin = new URL(process.env.REFERENCE_URL!).origin;
      await reference.route(`${origin}/**`, route => route.continue({ headers: { ...route.request().headers(), "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN! } }));
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await reference.goto(origin);
      await page.goto("/");
      for (const target of [reference, page]) {
        await target.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all([...document.images].map(image => { image.loading = "eager"; return image.decode().catch(() => {}); }));
        });
      }
      const selectors = ["body > header", "#hero-title", "[data-hero]", "[data-hero-visual]", "[data-website-preview]", "[data-code-preview]", "#selected-work", "footer"];
      for (const selector of selectors) {
        const expected = (await reference.locator(selector).boundingBox())!;
        const actual = (await page.locator(selector).boundingBox())!;
        for (const key of ["x", "y", "width", "height"] as const) expect(Math.abs(actual[key] - expected[key]), `${selector}.${key}`).toBeLessThan(1);
      }
      const expected = await reference.screenshot({ path: info.outputPath("reference.png"), fullPage: true });
      const actual = await page.screenshot({ path: info.outputPath("release.png"), fullPage: true });
      const a = await sharp(expected).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const b = await sharp(actual).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      expect(b.info).toEqual(a.info);
      let different = 0;
      for (let i = 0; i < a.data.length; i += 3) if (Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2])) > 30) different++;
      const ratio = different / (a.info.width * a.info.height);
      await info.attach("pixel-comparison", { body: JSON.stringify({ width, differentPixels: different, differenceRatio: ratio }), contentType: "application/json" });
      expect(ratio).toBeLessThan(.003);
    } finally { await reference.close(); }
  });
}
