import { expect, test } from "@playwright/test";
import { sections } from "../../app/about/sections";

test.beforeEach(async ({ page, baseURL }) => {
  if (process.env.VERCEL_OIDC_TOKEN && baseURL) {
    const origin = new URL(baseURL).origin;
    await page.route(`${origin}/**`, route => route.continue({ headers: { ...route.request().headers(), "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN! } }));
  }
});

for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  test(`three About cards retain every sentence at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/how-we-work");
    const shellWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    await page.goto("/about");
    const region = page.getByRole("region", { name: "About BlueMind" });
    await expect(region).toHaveAttribute("data-renderer", width >= 700 ? "css3d" : "flat");
    await expect(region.locator("article")).toHaveCount(width >= 700 ? 3 : 1);
    for (let index = 0; index < 3; index++) {
      await expect(region).toHaveAttribute("data-selected", String(index));
      const card = region.locator('article[data-active="true"]');
      await expect(card.getByRole("heading")).toHaveText(sections[index].title + (sections[index].question ? "?" : ""));
      await expect(card.locator("p")).toHaveText(sections[index].points.join(" "));
      await expect(region.locator("output")).toHaveText(`0${index + 1} / 03`);
      await expect.poll(() => card.locator("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await page.waitForTimeout(80);
      const box = await card.boundingBox();
      expect(Math.abs(box!.x + box!.width / 2 - width / 2)).toBeLessThan(2);
      expect(box!.height).toBeGreaterThanOrEqual(410);
      expect(await card.evaluate(e => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
      const paragraph = card.locator("p");
      expect(await paragraph.evaluate(e => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
      if (width >= 700) {
        const neighbors = await region.locator('article[data-active="false"]').evaluateAll(elements => elements.map(e => {
          const r = e.getBoundingClientRect();
          return { left: r.left, right: r.right, width: r.width };
        }));
        expect(neighbors.some(r => r.left < box!.x - 50 && r.width > box!.width * .25)).toBe(true);
        expect(neighbors.some(r => r.right > box!.x + box!.width + 50 && r.width > box!.width * .25)).toBe(true);
      }
      await paragraph.focus();
      await paragraph.press("End");
      await expect.poll(() => paragraph.evaluate(e => e.scrollTop + e.clientHeight >= e.scrollHeight - 2)).toBe(true);
      await paragraph.evaluate(e => { e.scrollTop = 0; (e as HTMLElement).blur(); });
      await region.screenshot({ path: info.outputPath(`about-${index + 1}.png`) });
      await region.getByRole("button", { name: "Next step", exact: true }).click();
    }
    await expect(region).toHaveAttribute("data-selected", "0");
    await region.getByRole("button", { name: "Previous step" }).click();
    await expect(region).toHaveAttribute("data-selected", "2");
    await region.focus();
    await page.keyboard.press("ArrowRight");
    await expect(region).toHaveAttribute("data-selected", "0");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(Math.max(width, shellWidth));
  });
}

for (const path of ["/how-we-work", "/services", "/about"]) {
  test(`shared mouse dragging, snap back and cancellation: ${path}`, async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(path);
    const region = page.locator('[aria-roledescription="carousel"]');
    await expect(region).toHaveAttribute("data-renderer", "css3d");
    const next = region.getByRole("button", { name: "Next step", exact: true });
    const stage = region.locator('[data-testid$="-stage"]');
    async function dragBy(distance: number, cancel = false) {
      const box = await region.locator('article[data-active="true"]').boundingBox();
      const x = box!.x + box!.width / 2;
      const y = box!.y + box!.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + distance, y, { steps: 8 });
      if (Math.abs(distance) >= 7) {
        await expect(region).toHaveAttribute("data-dragging", "true");
        await region.screenshot({ path: info.outputPath(`drag-${distance}.png`) });
      }
      if (cancel) await region.dispatchEvent("pointercancel", { pointerId: 1 });
      await page.mouse.up();
      await expect(next).toHaveAttribute("aria-disabled", "false");
      await expect(region).toHaveAttribute("data-dragging", "false");
    }
    await dragBy(2);
    await expect(region).toHaveAttribute("data-selected", "0");
    await dragBy(-80);
    await expect(region).toHaveAttribute("data-selected", "0");
    expect(Number(await stage.getAttribute("data-rotation"))).toBeCloseTo(0, 5);
    await dragBy(-230);
    await expect(region).toHaveAttribute("data-selected", "1");
    await dragBy(230);
    await expect(region).toHaveAttribute("data-selected", "0");
    await dragBy(-230, true);
    await expect(region).toHaveAttribute("data-selected", "0");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await dragBy(-230);
    await expect(region).toHaveAttribute("data-selected", "1");
  });
}

test("three-card navigation loops without resets or autoplay", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/about");
  const region = page.locator('[aria-roledescription="carousel"]');
  await expect(region).toHaveAttribute("data-renderer", "css3d");
  await page.waitForTimeout(3200);
  await expect(region).toHaveAttribute("data-selected", "0");
  const next = region.getByRole("button", { name: "Next step", exact: true });
  for (let turn = 1; turn <= 6; turn++) {
    await next.click();
    await expect(next).toHaveAttribute("aria-disabled", "false");
    await expect(region).toHaveAttribute("data-selected", String(turn % 3));
    expect(Number(await page.getByTestId("about-stage").getAttribute("data-rotation"))).toBeCloseTo(-turn * Math.PI * 2 / 3, 5);
  }
  await region.getByRole("button", { name: "Previous step" }).click();
  await expect(next).toHaveAttribute("aria-disabled", "false");
  expect(Number(await page.getByTestId("about-stage").getAttribute("data-rotation"))).toBeCloseTo(-5 * Math.PI * 2 / 3, 5);
  await region.locator('article[data-step="1"] button').click();
  await expect(next).toHaveAttribute("aria-disabled", "false");
  await expect(region).toHaveAttribute("data-selected", "0");
  await region.locator('article[data-step="3"] button').click();
  await expect(next).toHaveAttribute("aria-disabled", "false");
  await expect(region).toHaveAttribute("data-selected", "2");
});

test("shared styles and master side geometry with content-sized About height", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const appearances = [];
  const positions = [];
  for (const path of ["/how-we-work", "/services", "/about"]) {
    await page.goto(path);
    const region = page.locator('[aria-roledescription="carousel"]');
    await expect(region).toHaveAttribute("data-renderer", "css3d");
    await expect(region).toHaveAttribute("data-selected", "0");
    appearances.push(await region.locator('article[data-active="true"]').evaluate(e => {
      const s = getComputedStyle(e);
      const h = getComputedStyle(e.querySelector("h2")!);
      const p = getComputedStyle(e.querySelector("p")!);
      return { className: e.className, width: s.width, padding: s.padding, background: s.backgroundColor, color: s.color, border: s.border, radius: s.borderRadius, shadow: s.boxShadow, titleFont: h.font, bodyFont: p.font };
    }));
    await page.waitForTimeout(100);
    positions.push(await region.locator('article[data-step="2"]').evaluate(e => {
      const r = e.getBoundingClientRect();
      const matrix = new DOMMatrix(getComputedStyle(e.parentElement!).transform);
      return { x: r.x, width: r.width, yaw: Math.atan2(matrix.m31, matrix.m11) };
    }));
    await region.screenshot({ path: info.outputPath(`${path.slice(1)}-comparison.png`) });
    await region.getByRole("button", { name: "Next step", exact: true }).click();
    await expect(region).toHaveAttribute("data-selected", "1");
  }
  expect(appearances[1]).toEqual(appearances[0]);
  expect(appearances[2]).toEqual(appearances[0]);
  expect(positions[2].x).toBeCloseTo(positions[0].x, 1);
  expect(positions[2].width).toBeCloseTo(positions[0].width, 1);
  expect(positions[2].yaw).toBeCloseTo(positions[0].yaw, 5);
});

test("About mobile swipe and vertical scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 850 });
  await page.goto("/about");
  const region = page.locator('[aria-roledescription="carousel"]');
  await region.dispatchEvent("touchstart", { touches: [{ identifier: 1, clientX: 280, clientY: 400 }] });
  await region.dispatchEvent("touchend", { changedTouches: [{ identifier: 1, clientX: 60, clientY: 400 }] });
  await expect(region).toHaveAttribute("data-selected", "1");
  await region.dispatchEvent("touchstart", { touches: [{ identifier: 1, clientX: 100, clientY: 400 }] });
  await region.dispatchEvent("touchend", { changedTouches: [{ identifier: 1, clientX: 140, clientY: 600 }] });
  await expect(region).toHaveAttribute("data-selected", "1");
});

for (const locale of ["sv", "ar"]) {
  test(`About translated text fits without internal scrolling: ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.addInitScript(value => localStorage.setItem("bluemind-language", value), locale);
    await page.goto("/about");
    const region = page.locator('[aria-roledescription="carousel"]');
    for (let index = 0; index < 3; index++) {
      const card = region.locator('article[data-active="true"]');
      expect(await card.evaluate(e => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
      expect(await card.locator("p").evaluate(e => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
      await card.locator("p").focus();
      await card.locator("p").press("End");
      await expect.poll(() => card.locator("p").evaluate(e => e.scrollTop + e.clientHeight >= e.scrollHeight - 2)).toBe(true);
      await region.locator("nav button").last().click();
    }
  });
}
