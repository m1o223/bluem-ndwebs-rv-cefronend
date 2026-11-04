import { expect, test } from "@playwright/test";
import { INTRO_STORAGE_KEY } from "../../components/brand-intro/intro-config";

for (const width of [375, 1440]) {
  test(`production intro completes once and keeps fixed-center rotation at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/");
    const intro = page.locator("#bluemind-brand-intro");
    await expect(intro).toBeVisible();
    const before = await page.locator(".home-page").boundingBox();
    const rotation = await page.locator("[data-intro-orbit]").evaluate(element => {
      const effect = element.getAnimations()[0].effect as KeyframeEffect;
      return { frames: effect.getKeyframes().map(frame => frame.transform), delay: effect.getTiming().delay, duration: effect.getTiming().duration };
    });
    expect(rotation).toEqual({ frames: ["rotate(0deg)", "rotate(360deg)", "rotate(450deg)", "rotate(720deg)"], delay: 1200, duration: 2300 });
    await expect(intro).toHaveCount(0, { timeout: 8000 });
    expect(await page.locator(".home-page").boundingBox()).toEqual(before);
    expect(await page.evaluate(key => localStorage.getItem(key), INTRO_STORAGE_KEY)).toBe("complete");
    await page.screenshot({ path: info.outputPath("after-intro.png") });
    await page.reload();
    await expect(intro).toHaveCount(0);
    await page.locator('[data-hero] a[href="/quote"]').click();
    await expect(page).toHaveURL(/\/quote$/);
    await page.locator("header").getByRole("link", { name: "BlueMind Web Service home" }).click();
    await expect(intro).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test("Skip, reduced motion, and homepage assets remain usable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Skip Intro", exact: true }).click();
  await expect(page.locator("#bluemind-brand-intro")).toHaveCount(0);
  await page.evaluate(key => localStorage.removeItem(key), INTRO_STORAGE_KEY);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator("#bluemind-brand-intro")).toHaveCount(0);
  const broken = await page.evaluate(async () => {
    const images = [...document.images];
    await Promise.all(images.map(image => { image.loading = "eager"; return image.decode().catch(() => {}); }));
    return images.filter(image => !image.complete || !image.naturalWidth).map(image => image.getAttribute("src"));
  });
  expect(broken).toEqual([]);
  const hrefs = await page.locator('a[href]').evaluateAll(links => links.map(link => link.getAttribute("href")!));
  expect(hrefs.filter(href => /localhost|127\.0\.0\.1|p3mu5d4iw|git-feature/.test(href))).toEqual([]);
  for (const path of [...new Set(hrefs.filter(href => href.startsWith("/")).map(href => href.split("#")[0] || "/"))]) {
    expect((await page.request.get(path)).status(), path).toBe(200);
  }
  const header = page.locator("header");
  await header.getByRole("button", { name: "Selected language: English" }).click();
  await expect(header.getByRole("menuitemradio")).toHaveCount(3);
  await header.getByRole("menuitemradio", { name: /Svenska/ }).click();
  await expect(header.getByRole("button", { name: "Selected language: Svenska" })).toBeVisible();
  await header.getByRole("button", { name: "Selected language: Svenska" }).click();
  await header.getByRole("menuitemradio", { name: /English/ }).click();
});
