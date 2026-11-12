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
});
