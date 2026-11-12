import { expect, test } from "@playwright/test";

test.describe("shared content reveal", () => {
  test("reveals the first viewport and each later section once", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const stage = page.locator("[data-route='/']");
    const hero = page.locator("[data-hero]");
    await expect(stage).toHaveAttribute("data-reveal-ready", "true");
    await expect(hero).toHaveAttribute("data-reveal-state", "visible");
    expect(await hero.evaluate((element) => getComputedStyle(element).animationDuration)).toBe("0.28s");

    const whatWeDo = page.locator("[data-what-we-do]");
    await expect(whatWeDo).toHaveAttribute("data-reveal-state", "pending");
    await whatWeDo.scrollIntoViewIfNeeded();
    await expect(whatWeDo).toHaveAttribute("data-reveal-state", "visible");
    await page.evaluate(() => scrollTo(0, 0));
    await whatWeDo.scrollIntoViewIfNeeded();
    await expect(whatWeDo).toHaveAttribute("data-reveal-state", "visible");
  });

  test("keeps the AI pages free of the shared reveal", async ({ page }) => {
    await page.goto("/ask-ai");
    const stage = page.locator("[data-route='/ask-ai']");
    await expect(stage).not.toHaveAttribute("data-reveal-ready", "true");
    expect(await stage.locator("[data-reveal-state]").count()).toBe(0);
  });

  test("keeps auth chrome static while revealing the auth content", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator("[data-reveal-group='auth-content']")).toHaveAttribute("data-reveal-state", "visible");
    await expect(page.locator("[data-reveal-skip]")).not.toHaveAttribute("data-reveal-state");
  });

  test("shows content immediately when reduced motion is enabled", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const hero = page.locator("[data-hero]");
    await expect(hero).toBeVisible();
    expect(await hero.evaluate((element) => ({ opacity: getComputedStyle(element).opacity, animation: getComputedStyle(element).animationName }))).toEqual({ opacity: "1", animation: "none" });
  });

  test("uses one horizontal transition for a page change and reverses on browser back", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.locator('a[href="/about"]:visible').first().click();
    await expect(page).toHaveURL(/\/about$/);
    await expect.poll(() => page.evaluate(() => document.querySelector("[data-route-transition-direction='forward']") !== null)).toBe(true);
    const forward = await page.evaluate(() => document.querySelector("[data-route='/about']")?.getAnimations().flatMap(animation => animation.effect instanceof KeyframeEffect ? animation.effect.getKeyframes() : []).map(frame => String(frame.transform || "")) || []);
    expect(forward.some(transform => transform.includes("translateX(12px)"))).toBe(true);

    await page.goBack({ waitUntil: "commit" });
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => page.evaluate(() => document.querySelector("[data-route-transition-direction='backward']") !== null)).toBe(true);
    const backward = await page.evaluate(() => document.querySelector("[data-route='/']")?.getAnimations().flatMap(animation => animation.effect instanceof KeyframeEffect ? animation.effect.getKeyframes() : []).map(frame => String(frame.transform || "")) || []);
    expect(backward.some(transform => transform.includes("translateX(-12px)"))).toBe(true);
  });

  test("restores the Forma flip on mouse, touch, and keyboard without rope remnants", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const card = page.locator("[data-website-preview]");
    const inner = card.locator("[data-flip-inner]");
    await expect(card).toHaveAttribute("data-flipped", "false");
    await expect(card.locator('[data-flip-face="back"]')).toBeVisible();
    expect(await page.locator("[data-rope-path], [data-rope-anchor], [data-hanging-scene]").count()).toBe(0);

    await card.hover();
    expect(await inner.evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");
    await page.mouse.move(12, 12);
    await expect.poll(() => inner.evaluate((element) => getComputedStyle(element).transform)).toBe("none");

    await card.focus();
    await page.keyboard.press("Enter");
    await expect(card).toHaveAttribute("data-flipped", "true");
    await page.keyboard.press(" ");
    await expect(card).toHaveAttribute("data-flipped", "false");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const touchCard = page.locator("[data-website-preview]");
    await touchCard.evaluate((element) => element.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerType: "touch" })));
    await expect(touchCard).toHaveAttribute("data-flipped", "true");
    await touchCard.evaluate((element) => element.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerType: "touch" })));
    await expect(touchCard).toHaveAttribute("data-flipped", "false");

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    const tabletCard = page.locator("[data-website-preview]");
    await tabletCard.evaluate((element) => element.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerType: "touch" })));
    await expect(tabletCard).toHaveAttribute("data-flipped", "true");
    expect(await page.locator("[data-rope-path], [data-rope-anchor], [data-hanging-scene]").count()).toBe(0);
    expect(await page.evaluate(() => {
      const rect = document.querySelector<HTMLElement>("[data-hero-visual]")?.getBoundingClientRect();
      return Boolean(rect && rect.left >= -1 && rect.right <= window.innerWidth + 1);
    })).toBe(true);
  });

  test.describe("responsive hero sizing", () => {
    test.use({ hasTouch: true, isMobile: true, reducedMotion: "reduce" });

    test("keeps the hero and payment strip inside touch viewports", async ({ page }) => {
      for (const width of [390, 768, 1024]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");

        const metrics = await page.evaluate(() => {
          const payment = document.querySelector<HTMLElement>("[data-payment-methods]")?.getBoundingClientRect();
          const navigation = document.querySelector<HTMLElement>("body > nav")?.getBoundingClientRect();
          return {
            overflow: document.documentElement.scrollWidth - window.innerWidth,
            paymentBottom: payment?.bottom ?? 0,
            navigationTop: navigation?.top ?? window.innerHeight,
          };
        });

        expect(metrics.overflow).toBeLessThanOrEqual(0);
        if (width >= 768) expect(metrics.paymentBottom).toBeLessThanOrEqual(metrics.navigationTop + 1);
      }
    });
  });
});
