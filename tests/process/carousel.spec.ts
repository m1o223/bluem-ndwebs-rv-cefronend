import { expect, test } from "@playwright/test";
import { steps } from "../../app/how-we-work/steps";

test.beforeEach(async ({ page, baseURL }) => {
  if (process.env.VERCEL_OIDC_TOKEN && baseURL) {
    const origin = new URL(baseURL).origin;
    await page.route(`${origin}/**`, route => route.continue({ headers: { ...route.request().headers(), "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN! } }));
  }
});

for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  test(`all seven steps and geometry at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    // Compare with the unchanged site shell: its closed mobile menu already overflows.
    await page.goto("/services");
    const shellWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/how-we-work");
    const region = page.getByRole("region", { name: "Our website project process" });
    await expect(region).toHaveAttribute("data-renderer", width >= 700 ? "css3d" : "flat");
    for (let index = 0; index < 7; index++) {
      await expect(region).toHaveAttribute("data-selected", String(index));
      const active = region.locator('article[data-active="true"]');
      await expect(active.getByRole("heading")).toHaveText(steps[index].title);
      await expect(active.locator("p")).toHaveText(steps[index].text);
      await page.waitForTimeout(80);
      const box = await active.boundingBox();
      expect(Math.abs(box!.x + box!.width / 2 - width / 2)).toBeLessThan(2);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.width).toBeGreaterThan(250);
      expect(await active.evaluate(e => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
      await region.screenshot({ path: info.outputPath(`step-${index + 1}.png`) });
      await region.getByRole("button", { name: "Next step", exact: true }).click();
    }
    await expect(region).toHaveAttribute("data-selected", "0");
    await region.getByRole("button", { name: "Previous step" }).click();
    await expect(region).toHaveAttribute("data-selected", "6");
    await region.focus();
    await page.keyboard.press("ArrowRight");
    await expect(region).toHaveAttribute("data-selected", "0");
    await page.keyboard.press("ArrowLeft");
    await expect(region).toHaveAttribute("data-selected", "6");
    expect(await region.evaluate(e => e.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(Math.max(width, shellWidth));
    await page.screenshot({ path: info.outputPath("full-page.png"), fullPage: true });
    expect(errors).toEqual([]);
  });
}

test("animated circle wraps forward, side cards work, rapid clicks are locked, and no autoplay", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/how-we-work");
  const region = page.getByRole("region", { name: "Our website project process" });
  await expect(region).toHaveAttribute("data-renderer", "css3d");
  await page.waitForTimeout(3200);
  await expect(region).toHaveAttribute("data-selected", "0");
  const next = region.getByRole("button", { name: "Next step", exact: true });
  await next.evaluate((button: HTMLButtonElement) => { for (let i = 0; i < 8; i++) button.click(); });
  await expect(region).toHaveAttribute("data-selected", "1");
  await expect(next).toHaveAttribute("aria-disabled", "false");
  for (let i = 2; i <= 7; i++) {
    await next.click();
    await expect(next).toHaveAttribute("aria-disabled", "false");
    await expect(region).toHaveAttribute("data-selected", String(i % 7));
  }
  const rotation = await region.getByTestId("process-stage").getAttribute("data-rotation");
  expect(Number(rotation)).toBeCloseTo(-Math.PI * 2, 4);
  const side = region.locator('article[data-step="2"] button');
  await side.click();
  await expect(region).toHaveAttribute("data-selected", "1");
  await expect(next).toHaveAttribute("aria-disabled", "false");
});

for (const locale of ["sv", "ar"]) {
  test(`translated content fits at mobile width: ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.addInitScript(value => localStorage.setItem("bluemind-language", value), locale);
    await page.goto("/how-we-work");
    const region = page.locator('[aria-roledescription="carousel"]');
    for (let i = 0; i < 7; i++) {
      const active = region.locator('article[data-active="true"]');
      expect(await active.evaluate(e => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
      await region.locator("nav button").last().click();
    }
  });
}

test("mobile swipes, vertical touch and responsive mode switching", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 850 });
  await page.goto("/how-we-work");
  const region = page.getByRole("region", { name: "Our website project process" });
  await region.dispatchEvent("touchstart", { touches: [{ identifier: 1, clientX: 290, clientY: 400 }] });
  await region.dispatchEvent("touchend", { changedTouches: [{ identifier: 1, clientX: 60, clientY: 400 }] });
  await expect(region).toHaveAttribute("data-selected", "1");
  await region.dispatchEvent("touchstart", { touches: [{ identifier: 1, clientX: 100, clientY: 400 }] });
  await region.dispatchEvent("touchend", { changedTouches: [{ identifier: 1, clientX: 160, clientY: 600 }] });
  await expect(region).toHaveAttribute("data-selected", "1");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(region).toHaveAttribute("data-renderer", "css3d");
  await expect(region.locator('article[data-active="true"] h2')).toHaveText(steps[1].title);
  await page.setViewportSize({ width: 375, height: 850 });
  await expect(region).toHaveAttribute("data-renderer", "flat");
  await expect(region.locator("article")).toHaveCount(1);
});
