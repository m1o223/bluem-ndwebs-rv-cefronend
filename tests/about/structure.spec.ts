import { expect, test } from "@playwright/test";
import sharp from "sharp";
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
      await region.screenshot({ path: info.outputPath(`panel-${index}.png`) });
      expect(contentFits).toBe(true);
      // DOM bounds can pass while the browser clips a CSS3D painted layer.
      for (const check of await active.locator("li svg").all()) {
        const { data, info } = await sharp(await check.screenshot()).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        let ink = 0;
        for (let offset = 0; offset < data.length; offset += info.channels) {
          if (data[offset] < 180 && data[offset + 1] < 180 && data[offset + 3] > 200) ink++;
        }
        expect(ink, `Visible checkmark on section ${index + 1}`).toBeGreaterThan(8);
      }
      if (width >= 1000) {
        expect(bounds!.height).toBeGreaterThanOrEqual(630);
        expect(Math.abs(bounds!.width - await active.evaluate(e => e.clientWidth))).toBeLessThan(3);
        expect(Math.abs(bounds!.x + bounds!.width / 2 - width / 2)).toBeLessThan(2);
        if (index === 0) {
          const spread = await region.locator('[data-face]').evaluateAll(elements => {
            const boxes = elements.map(e => e.getBoundingClientRect());
            return Math.max(...boxes.map(b => b.right)) - Math.min(...boxes.map(b => b.left));
          });
          expect(spread / Math.min(1800, width)).toBeCloseTo(0.7, 1);
        }
      }
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

test("manual rotation only, seamless cycles and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/about");
  const region = page.getByRole("region", { name: "About BlueMind" });
  await expect(region).toHaveAttribute("data-renderer", "css3d");
  await expect(region.getByRole("button")).toHaveCount(2);
  await page.waitForTimeout(3300);
  await expect(region).toHaveAttribute("data-selected", "0");
  const next = region.getByRole("button", { name: "Next section", exact: true });
  for (let turn = 1; turn <= 6; turn++) {
    await next.click();
    await expect(next).toHaveAttribute("aria-disabled", "false");
    await expect(region).toHaveAttribute("data-turn", String(turn));
    await expect(region).toHaveAttribute("data-selected", String(turn % 3));
  }
  expect(Number(await region.locator('[data-rotation]').getAttribute('data-rotation'))).toBeCloseTo(-4 * Math.PI, 4);
  const previous = region.getByRole("button", { name: "Previous section" });
  for (let turn = 5; turn >= -3; turn--) {
    await previous.click();
    await expect(previous).toHaveAttribute("aria-disabled", "false");
    await expect(region).toHaveAttribute("data-turn", String(turn));
  }
  expect(Number(await region.locator('[data-rotation]').getAttribute('data-rotation'))).toBeCloseTo(2 * Math.PI, 4);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await next.click();
  await expect(region).toHaveAttribute("data-turn", "-2");
  await expect(next).toHaveAttribute("aria-disabled", "false");
});

test("mouse drag tracks the assembly, settles both ways, ignores clicks and cancels safely", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/about");
  const region = page.getByRole("region", { name: "About BlueMind" });
  await expect(region).toHaveAttribute("data-renderer", "css3d");
  const panel = region.locator('article[data-active="true"]');
  await panel.scrollIntoViewIfNeeded();
  const box = (await panel.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + 180;
  await page.mouse.click(x, y);
  await expect(region).toHaveAttribute("data-selected", "0");
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 3, y);
  await page.mouse.up();
  await expect(region).toHaveAttribute("data-selected", "0");
  for (const direction of [-1, 1]) {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + direction * box.width * 0.36, y, { steps: 12 });
    await expect(region.locator('[data-dragging="true"]')).toHaveCount(1);
    const fractional = Number(await region.locator('[data-position]').getAttribute('data-position'));
    expect(fractional % 1).not.toBe(0);
    await region.screenshot({ path: info.outputPath(`drag-${direction}.png`) });
    await page.mouse.up();
    await expect(region.getByRole("button").first()).toHaveAttribute("aria-disabled", "false");
    await expect(region).toHaveAttribute("data-selected", direction === -1 ? "1" : "0");
    expect(await page.evaluate(() => getSelection()?.toString())).toBe("");
  }
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 90, y, { steps: 4 });
  await region.locator('[data-dragging]').dispatchEvent("pointercancel", { pointerId: 1, pointerType: "mouse" });
  await page.mouse.up();
  await expect(region).toHaveAttribute("data-selected", "0");
  await expect(region.locator('[data-dragging]')).toHaveAttribute("data-dragging", "false");
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
