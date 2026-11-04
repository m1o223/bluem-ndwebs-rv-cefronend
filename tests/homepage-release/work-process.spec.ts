import { expect, test, type Page } from "@playwright/test";
import { INTRO_STORAGE_KEY } from "../../components/brand-intro/intro-config";
import { workProcessCopy } from "../../components/home/work-process-copy";

const section = (page: Page) => page.locator("#home-how-we-work");
const card = (page: Page) => section(page).locator("[data-work-card]");
const sentence = (page: Page) => section(page).locator("[data-work-step]");

for (const locale of ["en", "ar", "sv"] as const) {
  for (const width of [320, 390, 768, 1440]) {
    test(`process content, fixed geometry and CTA in ${locale} at ${width}px`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(language => localStorage.setItem("bluemind-language", language), locale);
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/");
      const copy = workProcessCopy[locale];
      await expect(section(page)).toHaveAttribute("lang", locale);
      await expect(section(page)).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      await expect(section(page).getByRole("heading")).toHaveText(copy.title);
      await expect(section(page).getByText(copy.description, { exact: true })).toBeVisible();
      await card(page).scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);
      const original = (await card(page).boundingBox())!;
      const footerY = (await page.locator("footer").first().boundingBox())!.y;
      expect(original.width).toBeGreaterThan(original.height);
      for (let index = 0; index < 10; index++) {
        await expect(sentence(page)).toHaveText(copy.steps[index]);
        await expect(sentence(page)).toHaveCount(1);
        await expect(sentence(page)).toHaveCSS("animation-name", "none");
        const box = (await card(page).boundingBox())!;
        expect(box).toEqual(original);
        const text = (await sentence(page).boundingBox())!;
        expect(text.x).toBeGreaterThanOrEqual(box.x);
        expect(text.y).toBeGreaterThanOrEqual(box.y);
        expect(text.x + text.width).toBeLessThanOrEqual(box.x + box.width);
        expect(text.y + text.height).toBeLessThanOrEqual(box.y + box.height);
        expect((await page.locator("footer").first().boundingBox())!.y).toBe(footerY);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        if (index === 9) await section(page).screenshot({ path: info.outputPath("process-longest-step.png") });
        await section(page).getByRole("button", { name: copy.next, exact: true }).click();
      }
      await expect(sentence(page)).toHaveText(copy.steps[0]);
      await section(page).getByRole("button", { name: copy.previous, exact: true }).click();
      await expect(sentence(page)).toHaveText(copy.steps[9]);
      await section(page).getByRole("link", { name: copy.action }).click();
      await expect(page).toHaveURL(/\/quote$/);
      expect(errors).toEqual([]);
    });
  }
}

test("language changes update the current step, heading, controls and CTA without reloading", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await section(page).locator("[data-work-next]").click();
  let documents = 0;
  page.on("request", request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++; });
  for (const locale of ["ar", "sv", "en"] as const) {
    await page.locator('header button[aria-controls="header-languages"]').click();
    await page.locator("#header-languages").getByRole("menuitemradio", { name: locale === "ar" ? /العربية/ : locale === "sv" ? /Svenska/ : /English/ }).click();
    await expect(sentence(page)).toHaveText(workProcessCopy[locale].steps[1]);
    await expect(section(page).getByRole("heading")).toHaveText(workProcessCopy[locale].title);
    await expect(section(page).getByRole("link")).toHaveText(workProcessCopy[locale].action);
    await expect(section(page).locator("[data-work-next]")).toHaveAttribute("aria-label", workProcessCopy[locale].next);
    await expect(section(page)).toHaveCSS("direction", locale === "ar" ? "rtl" : "ltr");
  }
  expect(documents).toBe(0);
});

test("automatic sequence starts in view, holds each step and loops all ten without layout shifts", async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(key => localStorage.setItem(key, "complete"), INTRO_STORAGE_KEY);
  await page.goto("/");
  await expect(card(page)).toHaveAttribute("data-playing", "false");
  await expect(sentence(page)).toHaveAttribute("data-work-step", "1");
  await card(page).scrollIntoViewIfNeeded();
  await expect(card(page)).toHaveAttribute("data-playing", "true");
  const box = await card(page).boundingBox();
  const start = Date.now();
  for (let index = 0; index < 10; index++) {
    await expect(sentence(page)).toHaveText(workProcessCopy.en.steps[index], { timeout: 4500 });
    await expect(sentence(page)).toHaveCSS("animation-duration", "3.2s");
    expect(await card(page).boundingBox()).toEqual(box);
    if (index === 0) {
      await page.waitForTimeout(2400);
      await expect(sentence(page)).toHaveAttribute("data-work-step", "1");
      await expect(sentence(page)).toHaveCSS("opacity", "1");
    }
  }
  await expect(sentence(page)).toHaveText(workProcessCopy.en.steps[0], { timeout: 4500 });
  expect(Date.now() - start).toBeGreaterThan(30000);
  expect(Date.now() - start).toBeLessThan(37000);
});

test("pause, offscreen, reduced motion and keyboard controls stop automatic animation", async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, "complete"), INTRO_STORAGE_KEY);
  await page.goto("/");
  await card(page).scrollIntoViewIfNeeded();
  await expect(card(page)).toHaveAttribute("data-playing", "true");
  await section(page).locator("[data-work-pause]").click();
  await expect(card(page)).toHaveAttribute("data-playing", "false");
  await expect(sentence(page)).toHaveCSS("opacity", "1");
  await page.waitForTimeout(3400);
  await expect(sentence(page)).toHaveAttribute("data-work-step", "1");
  await section(page).locator("[data-work-pause]").click();
  await page.evaluate(() => scrollTo(0, 0));
  await expect(card(page)).toHaveAttribute("data-playing", "false");
  await expect(sentence(page)).toHaveCSS("animation-play-state", "paused");
  await page.waitForTimeout(3400);
  await expect(sentence(page)).toHaveAttribute("data-work-step", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await card(page).scrollIntoViewIfNeeded();
  await expect(sentence(page)).toHaveCSS("animation-name", "none");
  await expect(section(page).locator("[data-work-pause]")).toHaveCount(0);
  await section(page).locator("[data-work-next]").focus();
  await page.keyboard.press("Enter");
  await expect(sentence(page)).toHaveAttribute("data-work-step", "2");
});
