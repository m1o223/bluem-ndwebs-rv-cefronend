import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page, baseURL }) => {
  if (process.env.VERCEL_OIDC_TOKEN && baseURL) {
    const origin = new URL(baseURL).origin;
    await page.route(`${origin}/**`, route => route.continue({ headers: { ...route.request().headers(), "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN! } }));
  }
});

for (const [width, height] of [[320, 568], [375, 812], [620, 900], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]]) {
  test(`centered hero hierarchy and visual composition at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const hero = page.locator("[data-hero]");
    const heading = hero.locator("h1");
    const description = hero.getByText("Websites built around your ideas, designed to move your business forward.", { exact: true });
    await expect(heading.locator("span")).toHaveText(["We design & develop", "You move forward"]);
    await expect(hero.getByText("BLUEMIND WEB SERVICE", { exact: true })).toHaveCount(0);
    const actions = hero.locator('a[href="/quote"]').locator("..");
    const visual = hero.locator("[data-hero-visual]");
    const cue = hero.locator('a[href="#selected-work"]');
    const rects = await Promise.all([heading, description, actions, visual, cue].map(element => element.boundingBox()));
    for (let index = 0; index < rects.length; index++) {
      const box = rects[index]!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.x + box.width / 2).toBeCloseTo(width / 2, 0);
      if (index > 0) expect(box.y).toBeGreaterThanOrEqual(rects[index - 1]!.y + rects[index - 1]!.height);
    }
    await expect(heading).toHaveCSS("text-align", "center");
    await expect(description).toHaveCSS("text-align", "center");
    if (width >= 768) {
      expect(await heading.evaluate(e => e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight))).toBeCloseTo(2, 0);
      const buttons = await actions.locator('a[href="/quote"], a[href="/ask-ai"]').all();
      const first = (await buttons[0].boundingBox())!;
      const second = (await buttons[1].boundingBox())!;
      expect(first.y).toBe(second.y);
      expect(first.height).toBe(second.height);
    }
    const scene = rects[3]!;
    const website = (await visual.locator("[data-website-preview]").boundingBox())!;
    const code = (await visual.locator("[data-code-preview]").boundingBox())!;
    expect(website.x + website.width / 2).toBeCloseTo(width / 2, 0);
    expect(code.x).toBeLessThan(website.x);
    expect(code.y).toBeLessThan(website.y);
    if (width > 620) {
      expect(website.width).toBeGreaterThan(code.width);
      for (const card of await visual.locator('[class*="miniCard"]').all()) {
        const box = (await card.boundingBox())!;
        expect(box.x + box.width / 2).toBeGreaterThan(website.x + website.width / 2);
      }
    }
    for (const card of await visual.locator('[data-website-preview], [data-code-preview], [class*="miniCard"]').all()) {
      if (!await card.isVisible()) continue;
      const box = (await card.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(scene.x);
      expect(box.x + box.width).toBeLessThanOrEqual(scene.x + scene.width + 1);
      expect(box.y).toBeGreaterThanOrEqual(scene.y);
      expect(box.y + box.height).toBeLessThanOrEqual(scene.y + scene.height);
    }
    await hero.screenshot({ path: info.outputPath("hero.png") });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath("viewport.png") });
    const overflow = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, elements: [...document.body.querySelectorAll("*")].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map(e => ({ tag: e.tagName, class: e.className, right: e.getBoundingClientRect().right })) }));
    expect(overflow.scrollWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(width);
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    const menu = page.getByRole("navigation", { name: "Main navigation" });
    await expect(menu).toBeVisible();
    const menuBox = (await menu.boundingBox())!;
    expect(menuBox.x).toBeGreaterThanOrEqual(0);
    expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(width);
    await page.getByRole("button", { name: "Close menu", exact: true }).click();
    await cue.click();
    await expect(page).toHaveURL(/#selected-work$/);
    await expect(page.locator("#selected-work")).toBeInViewport();
    expect(errors).toEqual([]);
  });
}

test("hero actions open the blank AI page and existing quote destination", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hero = page.locator("[data-hero]");
  await hero.getByRole("link", { name: "Ask BlueMind AI", exact: true }).click();
  await expect(page).toHaveURL(/\/ask-ai$/);
  await page.getByRole("link", { name: "Close", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await hero.getByRole("link", { name: "Get Started", exact: true }).click();
  await expect(page).toHaveURL(/\/quote$/);
});

test("homepage reveal follows header, headline, description, actions, visuals without changing intro timing", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator("#bluemind-brand-intro")).toBeVisible();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 200));
  const delays = await page.evaluate(() => {
    const selectors = ["body > header", "#hero-title", "[data-hero] > div > div:first-child > p:last-of-type", "[data-hero] > div > div:first-child > div", "[data-hero-visual]"];
    return selectors.map(selector => {
      const animation = document.querySelector(selector)!.getAnimations().find(a => a instanceof CSSAnimation && a.animationName === "bluemindIntroHome")!;
      return animation.effect!.getTiming().delay;
    });
  });
  expect(delays).toEqual([4550, 4610, 4670, 4730, 4800]);
  await page.getByRole("button", { name: "Skip Intro", exact: true }).click();
  await expect(page.locator("#bluemind-brand-intro")).toHaveCount(0);
  await expect(page.locator("body > header")).toHaveCSS("opacity", "1");
  expect(await page.evaluate(() => document.getAnimations().some(a => a instanceof CSSAnimation && a.animationName === "bluemindIntroHome"))).toBe(false);
});

test.describe("existing visual interactions", () => {
  test.use({ hasTouch: true, reducedMotion: "reduce" });
  test("website preview still flips with touch and keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const card = page.locator("[data-website-preview]");
    await card.tap();
    await expect(card).toHaveAttribute("data-flipped", "true");
    await card.tap();
    await expect(card).toHaveAttribute("data-flipped", "false");
    await card.focus();
    await page.keyboard.press("Enter");
    await expect(card).toHaveAttribute("data-flipped", "true");
    await page.keyboard.press("Space");
    await expect(card).toHaveAttribute("data-flipped", "false");
  });
});
