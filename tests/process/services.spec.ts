import { expect, test } from "@playwright/test";

const titles = ["Your Idea, Your Website", "No Technical Knowledge Needed", "Can\u2019t Explain Your Idea?", "Fast Delivery", "Everything Ready for You", "No Technical Headaches"];

test.beforeEach(async ({ page, baseURL }) => {
  if (process.env.VERCEL_OIDC_TOKEN && baseURL) {
    const origin = new URL(baseURL).origin;
    await page.route(`${origin}/**`, route => route.continue({ headers: { ...route.request().headers(), "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN! } }));
  }
});

for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  test(`six services, original artwork and responsive geometry at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/how-we-work");
    const shellWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/services");
    await expect(page.getByRole("heading", { name: "Services", exact: true, level: 1 })).toBeVisible();
    await expect(page.getByText("You bring the idea. We handle the rest.", { exact: true })).toBeVisible();
    const region = page.getByRole("region", { name: "Our website services" });
    await expect(region).toHaveAttribute("data-renderer", width >= 700 ? "css3d" : "flat");
    await expect(region.locator("article")).toHaveCount(width >= 700 ? 6 : 1);
    for (let index = 0; index < 6; index++) {
      await expect(region).toHaveAttribute("data-selected", String(index));
      const active = region.locator('article[data-active="true"]');
      await expect(active.getByRole("heading")).toHaveText(titles[index]);
      await expect(region.locator("output")).toHaveText(`0${index + 1} / 06`);
      await expect.poll(() => active.locator("img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      await page.waitForTimeout(80);
      const bounds = await active.boundingBox();
      expect(Math.abs(bounds!.x + bounds!.width / 2 - width / 2)).toBeLessThan(2);
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.width).toBeGreaterThan(250);
      expect(await active.evaluate(e => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
      await region.screenshot({ path: info.outputPath(`service-${index + 1}.png`) });
      await region.getByRole("button", { name: "Next step", exact: true }).click();
    }
    await expect(region).toHaveAttribute("data-selected", "0");
    await region.getByRole("button", { name: "Previous step" }).click();
    await expect(region).toHaveAttribute("data-selected", "5");
    await region.focus();
    await page.keyboard.press("ArrowRight");
    await expect(region).toHaveAttribute("data-selected", "0");
    expect(await region.evaluate(e => e.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(Math.max(width, shellWidth));
    await expect(page.getByRole("heading", { name: "Have an idea for your website?" })).toBeVisible();
    const quote = page.getByRole("main").getByRole("link", { name: "Request a Quote", exact: true });
    await expect(quote).toHaveAttribute("href", "/quote");
    await page.screenshot({ path: info.outputPath("full-page.png"), fullPage: true });
    await quote.click();
    await expect(page).toHaveURL(/\/quote$/);
    expect(errors).toEqual([]);
  });
}

test("six-card rotation uses 60 degrees, seamless cycles, side targets and animation locking", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/services");
  const region = page.getByRole("region", { name: "Our website services" });
  await expect(region).toHaveAttribute("data-renderer", "css3d");
  await page.waitForTimeout(3200);
  await expect(region).toHaveAttribute("data-selected", "0");
  const next = region.getByRole("button", { name: "Next step", exact: true });
  await next.evaluate((button: HTMLButtonElement) => { for (let i = 0; i < 8; i++) button.click(); });
  await expect(region).toHaveAttribute("data-selected", "1");
  await expect(next).toHaveAttribute("aria-disabled", "false");
  expect(Number(await region.getByTestId("services-stage").getAttribute("data-rotation"))).toBeCloseTo(-Math.PI / 3, 5);
  for (let turn = 2; turn <= 12; turn++) {
    await next.click();
    await expect(next).toHaveAttribute("aria-disabled", "false");
    await expect(region).toHaveAttribute("data-selected", String(turn % 6));
    expect(Number(await region.getByTestId("services-stage").getAttribute("data-rotation"))).toBeCloseTo(-turn * Math.PI / 3, 5);
  }
  await region.locator('article[data-step="2"] button').click();
  await expect(region).toHaveAttribute("data-selected", "1");
  await expect(next).toHaveAttribute("aria-disabled", "false");
  await region.locator('article[data-step="1"] button').click();
  await expect(region).toHaveAttribute("data-selected", "0");
});

test("mobile swipe and resize preserve selected service", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 850 });
  await page.goto("/services");
  const region = page.getByRole("region", { name: "Our website services" });
  await region.dispatchEvent("touchstart", { touches: [{ identifier: 1, clientX: 280, clientY: 400 }] });
  await region.dispatchEvent("touchend", { changedTouches: [{ identifier: 1, clientX: 60, clientY: 400 }] });
  await expect(region).toHaveAttribute("data-selected", "1");
  await region.dispatchEvent("touchstart", { touches: [{ identifier: 1, clientX: 100, clientY: 400 }] });
  await region.dispatchEvent("touchend", { changedTouches: [{ identifier: 1, clientX: 140, clientY: 600 }] });
  await expect(region).toHaveAttribute("data-selected", "1");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(region).toHaveAttribute("data-renderer", "css3d");
  await expect(region.locator('article[data-active="true"] h2')).toHaveText(titles[1]);
  await page.setViewportSize({ width: 375, height: 850 });
  await expect(region).toHaveAttribute("data-renderer", "flat");
  await expect(region.locator("article")).toHaveCount(1);
});

for (const locale of ["sv", "ar"]) {
  test(`translated services fit on mobile: ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.addInitScript(value => localStorage.setItem("bluemind-language", value), locale);
    await page.goto("/services");
    const region = page.locator('[aria-roledescription="carousel"]');
    for (let i = 0; i < 6; i++) {
      const active = region.locator('article[data-active="true"]');
      expect(await active.evaluate(e => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
      await region.locator("nav button").last().click();
    }
  });
}
