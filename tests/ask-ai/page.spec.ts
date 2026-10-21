import { expect, test } from "@playwright/test";
import sharp from "sharp";

test.beforeEach(async ({ page, baseURL }) => {
  if (process.env.VERCEL_OIDC_TOKEN && baseURL) {
    const origin = new URL(baseURL).origin;
    await page.route(`${origin}/**`, route => route.continue({ headers: { ...route.request().headers(), "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN! } }));
  }
});

for (const width of [320, 375, 768, 1440]) {
  for (const locale of [
    { code: "en", label: "Ask BlueMind AI" },
    { code: "sv", label: "Fr\u00e5ga BlueMind AI" },
    { code: "ar", label: "\u0627\u0633\u0623\u0644 BlueMind AI" },
  ]) {
    test(`${locale.code} blank route and return at ${width}px`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(code => localStorage.setItem("bluemind-language", code), locale.code);
      const errors: string[] = [];
      const apiRequests: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.route("**/api/**", route => { apiRequests.push(route.request().url()); return route.abort(); });
      await page.goto("/");
      const trigger = page.locator("[data-hero]").getByRole("link", { name: locale.label, exact: true });
      await expect(trigger).toHaveAttribute("href", "/ask-ai");
      await expect(trigger).not.toHaveAttribute("target", "_blank");
      await trigger.click();
      await expect(page).toHaveURL(/\/ask-ai$/);
      for (const direct of [false, true]) {
        if (direct) await page.goto("/ask-ai");
        await expect(page.locator("header, footer, nav, dialog, input, textarea, img, video, canvas")).toHaveCount(0);
        await expect(page.locator("main")).toHaveText("");
        await expect(page.locator("a, button")).toHaveCount(1);
        const close = page.getByRole("link", { name: "Close", exact: true });
        await expect(close).toBeVisible();
        await expect(close).toHaveAttribute("href", "/");
        await expect(page.locator("main")).toHaveCSS("background-color", "rgb(255, 255, 255)");
        const bounds = (await close.boundingBox())!;
        expect(bounds.width).toBeGreaterThanOrEqual(44);
        expect(bounds.height).toBeGreaterThanOrEqual(44);
        expect(bounds.x).toBeGreaterThan(width - 80);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
        expect(bounds.y).toBeLessThanOrEqual(24);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
        const screenshot = await page.screenshot({ path: info.outputPath(direct ? "direct.png" : "from-hero.png") });
        const { data, info: pixels } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
        let darkPixels = 0;
        for (let y = 0; y < pixels.height; y++) for (let x = 0; x < pixels.width; x++) {
          const offset = (y * pixels.width + x) * pixels.channels;
          const white = data[offset] === 255 && data[offset + 1] === 255 && data[offset + 2] === 255;
          if (x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height) {
            if (!white) darkPixels++;
          } else if (!white) throw new Error(`Unexpected non-white pixel at ${x},${y}`);
        }
        expect(darkPixels).toBeGreaterThan(20);
      }
      await page.getByRole("link", { name: "Close", exact: true }).focus();
      await expect(page.getByRole("link", { name: "Close", exact: true })).toHaveCSS("outline-style", "solid");
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator("body > header")).toBeVisible();
      await expect(page.locator("body > footer")).toHaveCount(1);
      await expect(page.locator("[data-hero]")).toBeVisible();
      await expect(page.locator("#bluemind-brand-intro")).toHaveCount(0);
      expect(apiRequests).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}

test("other page shells and Get Started remain intact", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator('[data-hero] a[href="/quote"]').click();
  await expect(page).toHaveURL(/\/quote$/);
  for (const path of ["/quote", "/about", "/services", "/how-we-work", "/care", "/contact", "/our-work"]) {
    await page.goto(path);
    await expect(page.locator("body > header")).toBeVisible();
    await expect(page.locator("body > footer")).toHaveCount(1);
    await expect(page.locator("main.page-content")).toBeVisible();
  }
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("direct route is blank and Close still returns home", async ({ page }) => {
    await page.goto("/ask-ai");
    await expect(page.locator("header, footer, nav")).toHaveCount(0);
    await expect(page.locator("a, button")).toHaveCount(1);
    await page.getByRole("link", { name: "Close", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("[data-hero]")).toBeVisible();
  });
});
