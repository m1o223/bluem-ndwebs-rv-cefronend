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
        const textArea = section.locator("[data-story-text]");
        const sentence = section.locator("[data-work-step]");
        await device.scrollIntoViewIfNeeded();
        await device.focus();
        await expect(section).toHaveAttribute("lang", locale);
        await expect(section).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
        await expect(section.locator("button, a, video, audio, iframe, canvas")).toHaveCount(0);
        await expect(section.locator("img, svg, input, textarea, [data-story-input]")).toHaveCount(0);
        await expect(frame).toHaveCSS("transform", "none");
        await expect(section.locator("[data-device-screen]")).toHaveCSS("background-color", "rgb(255, 255, 255)");
        await expect(textArea).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await expect(textArea).toHaveCSS("border-width", "0px");
        await expect(textArea).toHaveCSS("box-shadow", "none");
        await expect(sentence).toHaveCSS("color", "rgb(0, 0, 0)");
        await expect(sentence).not.toHaveCSS("text-shadow", "none");
        await expect(section.locator("[data-screen-content]")).toHaveCSS("animation-name", "none");
        const original = await documentBox(frame);
        const textAreaBox = await documentBox(textArea);
        expect(original.width).toBeLessThanOrEqual(680);
        expect(original.width).toBeCloseTo(Math.min((width - (width <= 600 ? 24 : width <= 1023 ? 40 : 48)) * 0.88, 680), 1);
        const footer = await documentBox(page.locator("footer").first());
        const dimensions = {width: original.width, height: original.height};
        if (firstDimensions) expect(dimensions).toEqual(firstDimensions);
        firstDimensions = dimensions;
        for (let index = 0; index < story.copy[locale].steps.length; index++) {
          await expect(sentence).toHaveText(story.copy[locale].steps[index].join(" "));
          await expect(sentence).toHaveCount(1);
          const lines = sentence.locator("[data-story-line]");
          await expect(lines).toHaveCount(2);
          for (const line of story.copy[locale].steps[index]) {
            expect(line.split(" ").length).toBeGreaterThanOrEqual(2);
            expect(line.split(" ").length).toBeLessThanOrEqual(3);
          }
          const glyphs = await lines.evaluateAll(elements => elements.map(element => {
            const range = document.createRange();
            range.selectNodeContents(element);
            const r = range.getBoundingClientRect();
            return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
          }));
          const screenBox = await documentBox(section.locator("[data-device-screen]"));
          expect(glyphs[1].y).toBeGreaterThanOrEqual(glyphs[0].y + glyphs[0].height - 1);
          for (const glyph of glyphs) {
            expect(glyph.x).toBeGreaterThan(screenBox.x);
            expect(glyph.x + glyph.width).toBeLessThan(screenBox.x + screenBox.width);
            expect(glyph.y + glyph.height).toBeLessThan(screenBox.y + screenBox.height);
          }
          const textBox = await documentBox(sentence);
          expect(textBox.x).toBeGreaterThanOrEqual(textAreaBox.x);
          expect(textBox.y).toBeGreaterThanOrEqual(textAreaBox.y);
          expect(textBox.x + textBox.width).toBeLessThanOrEqual(textAreaBox.x + textAreaBox.width);
          expect(textBox.y + textBox.height).toBeLessThanOrEqual(textAreaBox.y + textAreaBox.height);
          expect(await documentBox(frame)).toEqual(original);
          expect(await documentBox(textArea)).toEqual(textAreaBox);
          expect(await documentBox(page.locator("footer").first())).toEqual(footer);
          expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
          if (index === story.copy[locale].steps.length - 1) {
            await device.evaluate(e => (e as HTMLElement).blur());
            await section.screenshot({path: info.outputPath(story.id + ".png")});
            await device.focus();
          }
          await page.keyboard.press(locale === "ar" ? "ArrowLeft" : "ArrowRight");
        }
        await expect(sentence).toHaveText(story.copy[locale].steps[0].join(" "));
      }
      expect(errors).toEqual([]);
    });
  }
}

for (const story of stories) {
  test(story.id + ": starts on scroll, loops naturally, frame and screen stay fixed", async ({ page }) => {
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
      await expect(sentence).toHaveText(story.copy.en.steps[index].join(" "), {timeout: 5500});
      await expect(sentence).toHaveCSS("animation-duration", "4.2s");
      expect(await documentBox(frame)).toEqual(geometry);
      await expect(frame).toHaveCSS("transform", "none");
      if (index === 0) {
        await page.waitForTimeout(1000);
        await expect(sentence).toHaveCSS("opacity", "1");
      }
    }
    await expect(sentence).toHaveText(story.copy.en.steps[0].join(" "), {timeout: 5500});
    expect(Date.now() - started).toBeGreaterThan(story.copy.en.steps.length * 4000);
    await expect(content).toHaveCSS("transform", "none");
    await expect(content).toHaveCSS("animation-name", "none");
    await page.evaluate(() => scrollTo(0, 0));
    await expect(device).toHaveAttribute("data-playing", "false");
    await expect(sentence).toHaveCSS("animation-play-state", "paused");
    const pausedStep = await sentence.textContent();
    await page.waitForTimeout(4600);
    expect(await sentence.textContent()).toBe(pausedStep);
    await device.scrollIntoViewIfNeeded();
    await expect(device).toHaveAttribute("data-playing", "true");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(sentence).toHaveCSS("animation-name", "none");
    await expect(content).toHaveCSS("animation-name", "none");
    await expect(content).toHaveCSS("transform", "none");
  });
}

test("language switching translates both word sequences without navigation and retains independent steps", async ({ page }) => {
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
      await expect(page.locator("#" + story.id + " [data-work-step]")).toHaveText(story.copy[locale].steps[story.id === "home-how-we-work" ? 1 : 0].join(" "));
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
  await expect(sentence).toHaveAttribute("data-work-step", "3", {timeout: 5500});
});

for (const locale of ["en", "ar", "sv"] as const) {
  for (const width of [320, 1440]) {
    test("only text fades and travels left to right in " + locale + " at " + width + "px", async ({ page }) => {
      await page.setViewportSize({width, height: 900});
      await page.addInitScript(language => localStorage.setItem("bluemind-language", language), locale);
      await page.goto("/");
      for (const story of stories) {
        const section = page.locator("#" + story.id);
        const device = section.locator("[data-work-card]");
        const sentence = section.locator("[data-work-step]");
        await device.scrollIntoViewIfNeeded();
        await expect(device).toHaveAttribute("data-playing", "true");
        const original = await documentBox(section.locator("[data-device-frame]"));
        const screen = await documentBox(section.locator("[data-device-screen]"));
        let previousX = -Infinity;
        for (const time of [0, 600, 2100, 3500, 4199]) {
          const sample = await sentence.evaluate((element, currentTime) => {
            const animation = element.getAnimations()[0];
            animation.pause();
            animation.currentTime = currentTime;
            const style = getComputedStyle(element);
            const m = new DOMMatrix(style.transform);
            const ranges = [...element.querySelectorAll("[data-story-line]")].map(line => {
              const range = document.createRange();
              range.selectNodeContents(line);
              const box = range.getBoundingClientRect();
              return {x: box.x + scrollX, right: box.right + scrollX};
            });
            return {x: m.e, scale: m.a, opacity: Number(style.opacity), ranges};
          }, time);
          expect(sample.x).toBeGreaterThan(previousX);
          previousX = sample.x;
          expect(sample.scale).toBe(1);
          if (time === 0 || time === 4199) expect(sample.opacity).toBeLessThan(0.001);
          if (time === 2100) expect(sample.opacity).toBe(1);
          for (const range of sample.ranges) {
            expect(range.x).toBeGreaterThan(screen.x);
            expect(range.right).toBeLessThan(screen.x + screen.width);
          }
          expect(await documentBox(section.locator("[data-device-frame]"))).toEqual(original);
          await expect(section.locator("[data-screen-content]")).toHaveCSS("transform", "none");
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      }
    });
  }
}
