import { expect, test } from "@playwright/test";
import { sections } from "../../app/about/sections";

test.beforeEach(async ({ page, baseURL }) => {
  // Authenticate protected Preview requests only to their exact origin; never persist credentials.
  if (process.env.VERCEL_OIDC_TOKEN && baseURL) {
    const origin = new URL(baseURL).origin;
    await page.route(`${origin}/**`, route => route.continue({ headers: { ...route.request().headers(), "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN! } }));
  }
});

for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  test(`content and navigation at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/about");
    const region = page.getByRole("region", { name: "About BlueMind" });
    await expect(region).toHaveAttribute("data-renderer", width >= 1000 ? "css3d" : "flat");
    for (let index = 0; index < 3; index++) {
      await expect(region).toHaveAttribute("data-selected", String(index));
      const active = region.locator('article[data-active="true"]');
      for (const point of sections[index].points) await expect(active.getByText(point, { exact: true })).toBeVisible();
      await expect(active.locator("li")).toHaveCount(4);
      expect(await active.locator("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await page.waitForTimeout(100);
      const bounds = await active.boundingBox();
      expect(bounds!.width).toBeGreaterThan(200);
      expect(bounds!.x).toBeGreaterThanOrEqual(-1);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
      const contentFits = await active.evaluate(element => element.scrollHeight <= element.clientHeight + 1);
      expect(contentFits).toBe(true);
      await region.screenshot({ path: info.outputPath(`panel-${index}.png`) });
      await region.getByRole("button", { name: "Next section", exact: true }).click();
    }
    await expect(region).toHaveAttribute("data-selected", "0");
    await region.getByRole("button", { name: "Previous section" }).click();
    await expect(region).toHaveAttribute("data-selected", "2");
    await page.keyboard.press("ArrowRight");
    await expect(region).toHaveAttribute("data-selected", "0");
    await expect(region.locator("canvas")).toHaveCount(0);
    // The new unframed scene never makes the document wider.
    expect(await region.evaluate(element => element.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("automatic rotation pauses for hover, focus, play/pause, and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/about");
  const region = page.getByRole("region", { name: "About BlueMind" });
  await expect(region).toHaveAttribute("data-renderer", "css3d");
  await page.mouse.move(1, 1);
  await expect(region).toHaveAttribute("data-selected", "1", { timeout: 5000 });
  await region.hover();
  const hovered = await region.getAttribute("data-selected");
  await page.waitForTimeout(3300);
  await expect(region).toHaveAttribute("data-selected", hovered!);
  await region.getByRole("button", { name: "Next section", exact: true }).focus();
  await page.mouse.move(1, 1);
  await page.waitForTimeout(3300);
  await expect(region).toHaveAttribute("data-selected", hovered!);
  await region.getByRole("button", { name: "Pause automatic rotation" }).click();
  await page.locator("h1").click();
  await page.waitForTimeout(3300);
  await expect(region).toHaveAttribute("data-selected", hovered!);
  await region.getByRole("button", { name: "Play automatic rotation" }).click();
  await page.locator("h1").click();
  await expect(region).not.toHaveAttribute("data-selected", hovered!, { timeout: 5000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(region.getByRole("button", { name: "Automatic rotation disabled for reduced motion" })).toBeDisabled();
  const reduced = await region.getAttribute("data-selected");
  await page.waitForTimeout(3300);
  await expect(region).toHaveAttribute("data-selected", reduced!);
});

test("touch swipes navigate without hijacking vertical scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  const region = page.getByRole("region", { name: "About BlueMind" });
  const panel = region.locator('article[data-active="true"]');
  await panel.dispatchEvent("touchstart", { touches: [{ identifier: 1, clientX: 280, clientY: 400 }] });
  await panel.dispatchEvent("touchend", { changedTouches: [{ identifier: 1, clientX: 70, clientY: 410 }] });
  await expect(region).toHaveAttribute("data-selected", "1");
  await panel.dispatchEvent("touchstart", { touches: [{ identifier: 1, clientX: 200, clientY: 400 }] });
  await panel.dispatchEvent("touchend", { changedTouches: [{ identifier: 1, clientX: 160, clientY: 200 }] });
  await expect(region).toHaveAttribute("data-selected", "1");
});

test("resize preserves navigation and rendered text", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/about");
  const region = page.getByRole("region", { name: "About BlueMind" });
  await expect(region).toHaveAttribute("data-renderer", "css3d");
  await region.getByRole("button", { name: "Next section", exact: true }).click();
  await page.waitForTimeout(100);
  await region.screenshot({ path: info.outputPath("text-layer.png") });
  for (const width of [375, 1440, 768, 1024]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(region).toHaveAttribute("data-renderer", width >= 1000 ? "css3d" : "flat");
    await expect(region).toHaveAttribute("data-selected", "1");
    await expect(region.locator('article[data-active="true"] h2')).toContainText("What Makes Us Different");
  }
  expect(errors).toEqual([]);
});

for (const locale of ["sv", "ar"]) {
  test(`${locale} text fits all panels on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(code => localStorage.setItem("bluemind-language", code), locale);
    await page.goto("/about");
    const region = page.locator('[aria-roledescription="carousel"]');
    await expect(page.locator("body")).toHaveAttribute("data-locale", locale);
    for (let i = 0; i < 3; i++) {
      const active = region.locator('article[data-active="true"]');
      expect(await active.evaluate(element => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
      await region.locator("button").nth(1).click();
    }
  });
}
