import { expect, test, type Locator } from "@playwright/test";
import { INTRO_STORAGE_KEY } from "../../components/brand-intro/intro-config";
import { workProcessCopy } from "../../components/home/work-process-copy";
import { meetAiCopy } from "../../components/home/meet-ai-copy";

const stories = [
  { id: "home-how-we-work", copy: workProcessCopy },
  { id: "home-meet-ai", copy: meetAiCopy },
] as const;
const documentBox = (locator: Locator) => locator.evaluate(element => {
  const r = element.getBoundingClientRect();
  return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
});
test.beforeEach(async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, "complete"), INTRO_STORAGE_KEY);
});

for (const locale of ["en", "ar", "sv"] as const) {
  for (const width of [320, 390, 768, 1440]) {
    test("both mockups: every sentence fits, stable frame, " + locale + " at " + width + "px", async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(language => localStorage.setItem("bluemind-language", language), locale);
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      expect(await page.locator("#home-meet-ai").evaluate(e => e.previousElementSibling?.id)).toBe("home-how-we-work");
      let firstDimensions: {width: number; height: number} | undefined;
      for (const story of stories) {
        const section = page.locator("#" + story.id);
        const device = section.locator("[data-work-card]");
        const frame = section.locator("[data-device-frame]");
        const input = section.locator("[data-story-input]");
        const sentence = section.locator("[data-work-step]");
        await device.scrollIntoViewIfNeeded();
        await device.focus();
        await expect(section).toHaveAttribute("lang", locale);
        await expect(section).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
        await expect(section.locator("button, a, video, audio, iframe, canvas")).toHaveCount(0);
        await expect(section.locator("img")).toHaveCount(1);
        expect(await section.locator("img").evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
        await expect(frame).toHaveCSS("transform", "none");
        await expect(section.locator("[data-device-screen]")).toHaveCSS("background-color", "rgb(255, 255, 255)");
        await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
        await expect(section.locator("[data-screen-content]")).toHaveCSS("animation-name", "none");
        const original = await documentBox(frame);
        const inputBox = await documentBox(input);
        const footer = await documentBox(page.locator("footer").first());
        const dimensions = {width: original.width, height: original.height};
        if (firstDimensions) expect(dimensions).toEqual(firstDimensions);
        firstDimensions = dimensions;
        for (let index = 0; index < story.copy[locale].steps.length; index++) {
          await expect(sentence).toHaveText(story.copy[locale].steps[index]);
          await expect(sentence).toHaveCount(1);
          const textBox = await documentBox(sentence);
          expect(textBox.x).toBeGreaterThanOrEqual(inputBox.x);
          expect(textBox.y).toBeGreaterThanOrEqual(inputBox.y);
          expect(textBox.x + textBox.width).toBeLessThanOrEqual(inputBox.x + inputBox.width);
          expect(textBox.y + textBox.height).toBeLessThanOrEqual(inputBox.y + inputBox.height);
          expect(await documentBox(frame)).toEqual(original);
          expect(await documentBox(input)).toEqual(inputBox);
          expect(await documentBox(page.locator("footer").first())).toEqual(footer);
          expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
          if (index === story.copy[locale].steps.length - 1) {
            await device.evaluate(e => (e as HTMLElement).blur());
            await section.screenshot({path: info.outputPath(story.id + ".png")});
            await device.focus();
          }
          await page.keyboard.press(locale === "ar" ? "ArrowLeft" : "ArrowRight");
        }
        await expect(sentence).toHaveText(story.copy[locale].steps[0]);
      }
      expect(errors).toEqual([]);
    });
  }
}

for (const story of stories) {
  test(story.id + ": starts on scroll, loops naturally, only screen zooms", async ({ page }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const section = page.locator("#" + story.id);
    const device = section.locator("[data-work-card]");
    const frame = section.locator("[data-device-frame]");
    const sentence = section.locator("[data-work-step]");
    const content = section.locator("[data-screen-content]");
    await expect(device).toHaveAttribute("data-playing", "false");
    await device.scrollIntoViewIfNeeded();
    await expect(device).toHaveAttribute("data-playing", "true");
    const geometry = await documentBox(frame);
    const started = Date.now();
    for (let index = 0; index < story.copy.en.steps.length; index++) {
      await expect(sentence).toHaveText(story.copy.en.steps[index], {timeout: 4500});
      await expect(sentence).toHaveCSS("animation-duration", "3.2s");
      expect(await documentBox(frame)).toEqual(geometry);
      await expect(frame).toHaveCSS("transform", "none");
      if (index === 0) {
        await page.waitForTimeout(1000);
        await expect(sentence).toHaveCSS("opacity", "1");
      }
    }
    await expect(sentence).toHaveText(story.copy.en.steps[0], {timeout: 4500});
    expect(Date.now() - started).toBeGreaterThan(story.copy.en.steps.length * 3000);
    const scale = await content.evaluate(e => new DOMMatrix(getComputedStyle(e).transform).a);
    expect(scale).toBeGreaterThan(1);
    expect(scale).toBeLessThanOrEqual(1.04);
    await page.evaluate(() => scrollTo(0, 0));
    await expect(device).toHaveAttribute("data-playing", "false");
    await expect(content).toHaveCSS("animation-play-state", "paused");
    const pausedStep = await sentence.textContent();
    await page.waitForTimeout(3400);
    expect(await sentence.textContent()).toBe(pausedStep);
    await device.scrollIntoViewIfNeeded();
    await expect(device).toHaveAttribute("data-playing", "true");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(sentence).toHaveCSS("animation-name", "none");
    await expect(content).toHaveCSS("animation-name", "none");
    await expect(content).toHaveCSS("transform", "none");
  });
}

test("language switching translates both inputs without navigation and retains independent steps", async ({ page }) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.goto("/");
  await page.locator("#home-how-we-work [data-work-card]").focus();
  await page.keyboard.press("ArrowRight");
  let navigations = 0;
  page.on("request", r => { if(r.isNavigationRequest() && r.frame() === page.mainFrame()) navigations++; });
  for (const locale of ["ar", "sv", "en"] as const) {
    await page.locator('header button[aria-controls="header-languages"]').click();
    await page.locator("#header-languages").getByRole("menuitemradio", {name: locale === "ar" ? /العربية/ : locale === "sv" ? /Svenska/ : /English/}).click();
    for (const story of stories) {
      await expect(page.locator("#" + story.id + " [data-work-step]")).toHaveText(story.copy[locale].steps[story.id === "home-how-we-work" ? 1 : 0]);
    }
  }
  expect(navigations).toBe(0);
});

test("an animation-end arriving after scroll pause cannot strand an invisible sentence", async ({ page }) => {
  await page.goto("/");
  const device = page.locator("#home-how-we-work [data-work-card]");
  const sentence = device.locator("[data-work-step]");
  await device.scrollIntoViewIfNeeded();
  await expect(device).toHaveAttribute("data-playing", "true");
  await page.evaluate(() => scrollTo(0, 0));
  await expect(device).toHaveAttribute("data-playing", "false");
  await sentence.dispatchEvent("animationend");
  await expect(sentence).toHaveAttribute("data-work-step", "2");
  await device.scrollIntoViewIfNeeded();
  await expect(device).toHaveAttribute("data-playing", "true");
  await expect(sentence).toHaveCSS("opacity", "1");
  await expect(sentence).toHaveAttribute("data-work-step", "3", {timeout: 4500});
});

test("mobile zoom stays at two percent with no cropped input and no frame movement", async ({ page }) => {
  await page.setViewportSize({width: 320, height: 700});
  await page.goto("/");
  const section = page.locator("#home-how-we-work");
  const device = section.locator("[data-work-card]");
  await device.scrollIntoViewIfNeeded();
  await expect(device).toHaveAttribute("data-playing", "true");
  const frame = await documentBox(section.locator("[data-device-frame]"));
  await section.locator("[data-screen-content]").evaluate(e => {
    const animation = e.getAnimations()[0];
    animation.pause();
    animation.currentTime = 16000;
  });
  const input = await documentBox(section.locator("[data-story-input]"));
  const screen = await documentBox(section.locator("[data-device-screen]"));
  const scale = await section.locator("[data-screen-content]").evaluate(e => new DOMMatrix(getComputedStyle(e).transform).a);
  expect(scale).toBeCloseTo(1.02, 4);
  expect(input.x).toBeGreaterThan(screen.x);
  expect(input.y).toBeGreaterThan(screen.y);
  expect(input.x + input.width).toBeLessThan(screen.x + screen.width);
  expect(input.y + input.height).toBeLessThan(screen.y + screen.height);
  expect(await documentBox(section.locator("[data-device-frame]"))).toEqual(frame);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
});
