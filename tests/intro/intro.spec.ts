import { expect, test } from "@playwright/test";
import { runInNewContext } from "node:vm";
import { INTRO_STORAGE_KEY, createIntroBootstrap } from "../../components/brand-intro/intro-config";

test.beforeEach(async ({ page, baseURL }) => {
  if (process.env.VERCEL_OIDC_TOKEN && baseURL) {
    const origin = new URL(baseURL).origin;
    await page.route(`${origin}/**`, route => route.continue({ headers: { ...route.request().headers(), "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN! } }));
  }
});

test("Preview refresh replays after completion while in-app navigation does not", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/");
  const intro = page.locator("#bluemind-brand-intro");
  await expect(intro).toBeVisible();
  await expect(page.getByRole("button", { name: "Skip Intro", exact: true })).toBeVisible();
  const heroBefore = await page.locator(".home-page").boundingBox();
  await expect(intro).toHaveCount(0, { timeout: 6000 });
  const duration = await page.evaluate(() => performance.now() - window.__blueMindIntro!.started);
  expect(duration).toBeGreaterThan(3500);
  expect(duration).toBeLessThan(5200);
  expect(await page.locator(".home-page").boundingBox()).toEqual(heroBefore);
  expect(await page.evaluate(key => localStorage.getItem(key), INTRO_STORAGE_KEY)).toBe("complete");
  await page.reload();
  await expect(intro).toBeVisible();
  await expect(intro).toHaveCount(0, { timeout: 6000 });
  await page.getByRole("link", { name: "Get Started", exact: true }).first().click();
  await expect(page).toHaveURL(/\/quote$/);
  await page.getByRole("link", { name: "BlueMind Web Service home", exact: true }).first().click();
  await expect(intro).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("keyboard Skip immediately stops animation and saves completion", async ({ page }) => {
  await page.goto("/");
  const skip = page.getByRole("button", { name: "Skip Intro", exact: true });
  await skip.focus();
  await skip.press("Enter");
  await expect(page.locator("#bluemind-brand-intro")).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), INTRO_STORAGE_KEY)).toBe("complete");
  await expect(page.getByRole("link", { name: "BlueMind Web Service home", exact: true }).first()).toBeFocused();
});

test("reduced motion bypasses intro and preference changes dismiss an active intro", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#bluemind-brand-intro")).toHaveCount(0);
  await page.evaluate(key => localStorage.removeItem(key), INTRO_STORAGE_KEY);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await expect(page.locator("#bluemind-brand-intro")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#bluemind-brand-intro")).toHaveCount(0);
});

test("no intro when navigating home from another page", async ({ page }) => {
  await page.goto("/services");
  await expect(page.locator("#bluemind-brand-intro")).toHaveCount(0);
  await page.getByRole("link", { name: "BlueMind Web Service home", exact: true }).first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#bluemind-brand-intro")).toHaveCount(0);
  await page.reload();
  await expect(page.locator("#bluemind-brand-intro")).toBeVisible();
  await page.getByRole("button", { name: "Skip Intro", exact: true }).click();
});

test("default bootstrap preserves once-per-visitor behavior", () => {
  const storage = new Map<string, string>();
  let starts = 0;
  const visit = (replay = false) => {
    const window = {} as { __blueMindIntro?: { playing: boolean } };
    runInNewContext(createIntroBootstrap(replay), {
      window, location: { pathname: "/" }, performance: { now: () => 0 },
      matchMedia: () => ({ matches: false }),
      localStorage: { getItem: (key: string) => storage.get(key), setItem: (key: string, value: string) => storage.set(key, value) },
      document: { getElementById: () => ({ sheet: { insertRule: () => { starts++; } } }) },
    });
    return window.__blueMindIntro?.playing;
  };
  expect(visit()).toBe(true);
  expect(visit()).toBe(false);
  expect(starts).toBe(1);
  storage.set(INTRO_STORAGE_KEY, "complete");
  expect(visit()).toBe(false);
  expect(visit(true)).toBe(true);
});

for (const width of [375, 1440]) {
  test(`repeated mid-animation refresh and Skip reset cleanly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(key => localStorage.setItem(key, "complete"), INTRO_STORAGE_KEY);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const intro = page.locator("#bluemind-brand-intro");
    for (let refresh = 0; refresh < 3; refresh++) {
      await expect(intro).toBeVisible();
      expect(await page.evaluate(() => performance.now() - window.__blueMindIntro!.started)).toBeLessThan(1400);
      await expect(intro.locator("[data-intro-orbit]")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
      await page.waitForTimeout(1600);
      await page.reload({ waitUntil: "domcontentloaded" });
    }
    await page.getByRole("button", { name: "Skip Intro", exact: true }).click();
    await expect(intro).toHaveCount(0);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(intro).toBeVisible();
    await expect(intro).toHaveCount(0, { timeout: 6000 });
    await expect(page.getByRole("link", { name: "Get Started", exact: true }).first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("storage denied never blocks the homepage", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException("Storage disabled", "SecurityError"); };
    Storage.prototype.setItem = () => { throw new DOMException("Storage disabled", "SecurityError"); };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Skip Intro", exact: true }).click();
  await expect(page.locator("#bluemind-brand-intro")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Get Started", exact: true }).first()).toBeVisible();
});

for (const [width, height] of [[320, 568], [375, 812], [768, 1024], [1024, 768], [1440, 900], [1920, 1080], [844, 390]]) {
  test(`choreography and responsive phase screenshots at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    await page.clock.install();
    await page.goto("/");
    const intro = page.locator("#bluemind-brand-intro");
    await expect(intro).toBeVisible();
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 200));
    await intro.evaluate(e => e.getAnimations({ subtree: true }).forEach(a => a.pause()));
    async function phase(time: number) {
      await intro.evaluate((e, value) => e.getAnimations({ subtree: true }).forEach(a => { a.currentTime = value; }), time);
      await page.screenshot({ path: info.outputPath(`phase-${time}.png`) });
    }
    await phase(0);
    await phase(600);
    await phase(1300);
    const words = intro.locator("[data-intro-word] > span:visible");
    await expect(words).toHaveCount(width <= 620 || height <= 560 ? 10 : 20);
    const bounds = await words.evaluateAll(elements => elements.map(e => {
      const r = e.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }));
    for (const b of bounds) {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width).toBeLessThanOrEqual(width);
      expect(b.y).toBeGreaterThan(0);
      expect(b.y + b.height).toBeLessThan(height);
    }
    for (let a = 0; a < bounds.length; a++) for (let b = a + 1; b < bounds.length; b++) {
      const overlapX = Math.min(bounds[a].x + bounds[a].width, bounds[b].x + bounds[b].width) - Math.max(bounds[a].x, bounds[b].x);
      const overlapY = Math.min(bounds[a].y + bounds[a].height, bounds[b].y + bounds[b].height) - Math.max(bounds[a].y, bounds[b].y);
      expect(overlapX <= 0 || overlapY <= 0).toBe(true);
    }
    const orbit = await intro.locator("[data-intro-orbit]").evaluate(e => {
      const effect = e.getAnimations()[0].effect as KeyframeEffect;
      return { frames: effect.getKeyframes(), timing: effect.getTiming() };
    });
    expect(orbit.frames.at(-1)!.transform).toBe("rotate(720deg)");
    expect(orbit.timing.duration).toBe(900);
    expect(orbit.timing.delay).toBe(1400);
    await phase(1850);
    await phase(2300);
    await phase(2700);
    await expect(intro.locator("[data-bluemind-logo] img")).toHaveAttribute("src", /bluemind-original-logo-transparent/);
    await phase(3150);
    const brand = await intro.locator("[data-intro-brand]").boundingBox();
    expect(brand!.x).toBeGreaterThan(0);
    expect(brand!.x + brand!.width).toBeLessThan(width);
    await phase(3450);
    await phase(3750);
    await page.getByRole("button", { name: "Skip Intro", exact: true }).click();
    await expect(intro).toHaveCount(0);
  });
}

test.describe("progressive enhancement", () => {
  test.use({ javaScriptEnabled: false });
  test("homepage stays available without JavaScript", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#bluemind-brand-intro")).toBeHidden();
    await expect(page.getByRole("link", { name: "Get Started", exact: true }).first()).toBeVisible();
  });
});
