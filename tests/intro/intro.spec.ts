import { expect, test } from "@playwright/test";
import { runInNewContext } from "node:vm";
import sharp from "sharp";
import { INTRO_DURATION, INTRO_STORAGE_KEY, createIntroBootstrap, mobileWordCount, timeline, words as introWords } from "../../components/brand-intro/intro-config";

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
  await expect(intro).toHaveCount(0, { timeout: 7000 });
  const duration = await page.evaluate(() => performance.now() - window.__blueMindIntro!.started);
  expect(duration).toBeGreaterThan(INTRO_DURATION - 100);
  expect(duration).toBeLessThan(INTRO_DURATION + 1200);
  expect(await page.locator(".home-page").boundingBox()).toEqual(heroBefore);
  expect(await page.evaluate(key => localStorage.getItem(key), INTRO_STORAGE_KEY)).toBe("complete");
  await page.reload();
  await expect(intro).toBeVisible();
  await expect(intro).toHaveCount(0, { timeout: 7000 });
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
      document: { getElementById: () => ({ sheet: { cssRules: [], insertRule: (rule: string) => { if (rule.includes("display: block")) starts++; } } }) },
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
    await page.addInitScript(key => {
      localStorage.setItem(key, "complete");
      // Record first paint in the browser, independent of automation/network latency.
      const capture = () => {
        const state = window.__blueMindIntro;
        const orbit = document.querySelector("[data-intro-orbit]");
        if (!state?.playing || !orbit) { requestAnimationFrame(capture); return; }
        const snapshot = { elapsed: Number(document.timeline.currentTime) - state.started, transform: getComputedStyle(orbit).transform };
        Object.assign(window, { __introFirstFrame: snapshot });
      };
      requestAnimationFrame(capture);
    }, INTRO_STORAGE_KEY);
    await page.goto("/", { waitUntil: "commit" });
    const intro = page.locator("#bluemind-brand-intro");
    for (let refresh = 0; refresh < 3; refresh++) {
      await page.waitForFunction(() => "__introFirstFrame" in window);
      await expect(intro).toBeVisible();
      const firstFrame = await page.evaluate(() => (window as typeof window & { __introFirstFrame: { elapsed: number; transform: string } }).__introFirstFrame);
      expect(firstFrame.elapsed).toBeLessThan(1400);
      expect(firstFrame.transform).toBe("matrix(1, 0, 0, 1, 0, 0)");
      await page.waitForTimeout(1600);
      await page.reload({ waitUntil: "commit" });
    }
    await page.getByRole("button", { name: "Skip Intro", exact: true }).click();
    await expect(intro).toHaveCount(0);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(intro).toBeVisible();
    await expect(intro).toHaveCount(0, { timeout: 7000 });
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
    await page.evaluate(() => document.getAnimations().filter(a => document.getElementById("bluemind-brand-intro")?.contains((a.effect as KeyframeEffect).target) || a instanceof CSSAnimation && a.animationName === "bluemindIntroHome").forEach(a => a.pause()));
    async function phase(time: number) {
      await page.evaluate(value => document.getAnimations().filter(a => document.getElementById("bluemind-brand-intro")?.contains((a.effect as KeyframeEffect).target) || a instanceof CSSAnimation && a.animationName === "bluemindIntroHome").forEach(a => { a.currentTime = value; }), time);
      return page.screenshot({ path: info.outputPath(`phase-${time}.png`) });
    }
    await phase(0);
    await phase(600);
    await phase(1150);
    const words = intro.locator("[data-intro-word]:visible");
    await expect(words).toHaveCount(width <= 620 || height <= 560 ? mobileWordCount : introWords.length);
    await expect(intro.locator("[data-intro-row]")).toHaveCount(0);
    const radius = Math.min(220, Math.min(width, height) * .36);
    const bounds = await words.evaluateAll(elements => elements.map(e => {
      const r = e.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }));
    for (const b of bounds) {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width).toBeLessThanOrEqual(width);
      expect(b.y).toBeGreaterThan(0);
      expect(b.y + b.height).toBeLessThan(height);
      expect(Math.hypot(b.x + b.width / 2 - width / 2, b.y + b.height / 2 - height / 2)).toBeCloseTo(radius, 1);
      const nearestX = Math.max(b.x, Math.min(width / 2, b.x + b.width));
      const nearestY = Math.max(b.y, Math.min(height / 2, b.y + b.height));
      expect(Math.hypot(nearestX - width / 2, nearestY - height / 2)).toBeGreaterThan(radius * .65);
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
    expect(orbit.frames.map(frame => frame.transform)).toEqual(["rotate(0deg)", "rotate(360deg)", "rotate(450deg)", "rotate(720deg)"]);
    expect(orbit.timing.duration).toBe(timeline.rotationEnd - timeline.rotationStart);
    expect(orbit.timing.delay).toBe(timeline.rotationStart);
    for (let index = 0; index < orbit.frames.length; index++) {
      expect(Number(orbit.timing.delay) + orbit.frames[index].computedOffset * Number(orbit.timing.duration)).toBeCloseTo([1200, 2300, 2650, 3500][index], 2);
    }
    const logo = intro.locator("[data-intro-logo]");
    const ring = intro.locator("[data-intro-words]");
    await expect(intro.locator("[data-intro-orbit] [data-intro-logo]")).toHaveCount(1);
    for (const time of [1200, 1500, 1800, 2100, 2300]) {
      await phase(time);
      await expect(logo).toHaveCSS("opacity", "0");
      const centers = await words.evaluateAll(elements => elements.map(e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }));
      expect(centers.reduce((sum, point) => sum + point.x, 0) / centers.length).toBeCloseTo(width / 2, 1);
      expect(centers.reduce((sum, point) => sum + point.y, 0) / centers.length).toBeCloseTo(height / 2, 1);
    }
    await expect(logo).toHaveCSS("opacity", "0");
    await expect(ring).toHaveCSS("opacity", "1");
    await phase(2475);
    expect(Number(await logo.evaluate(e => getComputedStyle(e).opacity))).toBeCloseTo(.5, 2);
    expect(Number(await ring.evaluate(e => getComputedStyle(e).opacity))).toBeCloseTo(.5, 2);
    const logoSize = Number(await logo.evaluate(e => parseFloat(getComputedStyle(e).width)));
    expect(logoSize).toBeGreaterThanOrEqual(width <= 620 || height <= 560 ? 150 : 240);
    for (const time of [2650, 2800, 3000, 3300, 3500]) {
      const screenshot = await phase(time);
      await expect(logo).toHaveCSS("opacity", "1");
      await expect(ring).toHaveCSS("opacity", "0");
      const box = (await logo.boundingBox())!;
      expect(box.x + box.width / 2).toBeCloseTo(width / 2, 1);
      expect(box.y + box.height / 2).toBeCloseTo(height / 2, 1);
      expect(await logo.evaluate(e => parseFloat(getComputedStyle(e).width))).toBe(logoSize);
      const rotation = await intro.locator("[data-intro-orbit]").evaluate(e => { const m = new DOMMatrix(getComputedStyle(e).transform); return [m.m41, m.m42]; });
      expect(rotation).toEqual([0, 0]);
      // Check the visible ink too: a centered box can still contain off-center artwork.
      const { data, info: pixels } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      let x0 = width, y0 = height, x1 = 0, y1 = 0;
      for (let y = Math.floor(height / 2 - logoSize * .75); y < height / 2 + logoSize * .75; y++) {
        for (let x = Math.floor(width / 2 - logoSize * .75); x < width / 2 + logoSize * .75; x++) {
          const offset = (y * pixels.width + x) * pixels.channels;
          if (data[offset] < 100 && data[offset + 1] < 100 && data[offset + 2] < 100) {
            x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
          }
        }
      }
      expect(x1 - x0).toBeGreaterThan(logoSize * .94);
      expect(Math.abs((x0 + x1 + 1) / 2 - width / 2)).toBeLessThanOrEqual(2);
      expect(Math.abs((y0 + y1 + 1) / 2 - height / 2)).toBeLessThanOrEqual(2);
    }
    await expect(logo.locator("img")).toHaveAttribute("src", /bluemind-original-logo-transparent/);
    const upright = await intro.locator("[data-intro-orbit]").evaluate(e => new DOMMatrix(getComputedStyle(e).transform).toFloat64Array().slice(0, 6));
    expect(upright[0]).toBeCloseTo(1, 5);
    expect(upright[5]).toBeCloseTo(1, 5);
    await phase(3900);
    const mark = await intro.locator("[data-intro-brand] > span").boundingBox();
    const symbol = await logo.boundingBox();
    expect(symbol!.x).toBeGreaterThan(0);
    expect(mark!.x + mark!.width).toBeLessThan(width);
    expect((symbol!.x + mark!.x + mark!.width) / 2).toBeCloseTo(width / 2, 0);
    await phase(4300);
    await phase(4500);
    await expect(intro.locator("[data-intro-brand]")).toHaveCSS("opacity", "0");
    await expect(page.locator("#hero-title")).toHaveCSS("opacity", "0");
    await expect(intro.locator("svg, mask")).toHaveCount(0);
    await phase(4850);
    expect(Number(await page.locator("#hero-title").evaluate(e => getComputedStyle(e).opacity))).toBeGreaterThan(Number(await page.locator("[data-hero-visual]").evaluate(e => getComputedStyle(e).opacity)));
    await phase(5300);
    await page.getByRole("button", { name: "Skip Intro", exact: true }).click();
    await expect(intro).toHaveCount(0);
    expect(await page.evaluate(() => document.getAnimations().some(a => a instanceof CSSAnimation && a.animationName === "bluemindIntroHome"))).toBe(false);
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
