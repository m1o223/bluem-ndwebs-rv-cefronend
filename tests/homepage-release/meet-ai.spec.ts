import { expect, test, type Locator, type Page } from "@playwright/test";
import { INTRO_STORAGE_KEY } from "../../components/brand-intro/intro-config";
import { meetAiCopy } from "../../components/home/meet-ai-copy";
import { workProcessCopy } from "../../components/home/work-process-copy";

const section = (page: Page) => page.locator("#home-meet-ai");
const work = (page: Page) => page.locator("#home-how-we-work");
const card = (page: Page) => section(page).locator("[data-work-card]");
const sentence = (page: Page) => section(page).locator("[data-work-step]");

const documentBox = (locator: Locator) => locator.evaluate(element => {
  const box = element.getBoundingClientRect();
  return { x: box.x + scrollX, y: box.y + scrollY, width: box.width, height: box.height };
});

for (const locale of ["en", "ar", "sv"] as const) {
  for (const width of [320, 390, 768, 1440]) {
    test(`Meet AI nine steps, geometry and chat link in ${locale} at ${width}px`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(language => localStorage.setItem("bluemind-language", language), locale);
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/");
      const copy = meetAiCopy[locale];
      await expect(section(page)).toHaveAttribute("lang", locale);
      await expect(section(page)).toHaveCSS("direction", locale === "ar" ? "rtl" : "ltr");
      expect(await section(page).evaluate(element => element.previousElementSibling?.id)).toBe("home-how-we-work");
      await expect(section(page).getByRole("heading")).toHaveText(copy.title);
      await expect(section(page).getByText(copy.description, { exact: true })).toBeVisible();
      await expect(section(page).getByText(copy.clarification!, { exact: true })).toBeVisible();
      await card(page).scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);
      const box = await documentBox(card(page));
      const reference = await documentBox(work(page).locator("[data-work-card]"));
      expect(box.width).toBe(reference.width);
      expect(box.height).toBe(reference.height);
      expect(box.width).toBeGreaterThan(box.height);
      const footerY = (await documentBox(page.locator("footer").first())).y;
      for (let index = 0; index < 9; index++) {
        await expect(sentence(page)).toHaveText(copy.steps[index]);
        await expect(sentence(page)).toHaveCount(1);
        expect(await documentBox(card(page))).toEqual(box);
        const text = await documentBox(sentence(page));
        expect(text.x).toBeGreaterThanOrEqual(box.x);
        expect(text.y).toBeGreaterThanOrEqual(box.y);
        expect(text.x + text.width).toBeLessThanOrEqual(box.x + box.width);
        expect(text.y + text.height).toBeLessThanOrEqual(box.y + box.height);
        expect((await documentBox(page.locator("footer").first())).y).toBe(footerY);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        if (index === 4) await section(page).screenshot({ path: info.outputPath("meet-ai.png") });
        await section(page).getByRole("button", { name: copy.next, exact: true }).click();
      }
      await expect(sentence(page)).toHaveText(copy.steps[0]);
      await section(page).getByRole("button", { name: copy.previous, exact: true }).click();
      await expect(sentence(page)).toHaveText(copy.steps[8]);
      const cta = section(page).getByRole("link", { name: copy.action, exact: true });
      await expect(cta).toHaveAttribute("href", "/ask-ai");
      await cta.click();
      await expect(page).toHaveURL(/\/ask-ai$/);
      await expect(page.locator("textarea").first()).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
}

test("language switching translates both animations without mixing their active steps or reloading", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await work(page).locator("[data-work-next]").click();
  await section(page).locator("[data-work-previous]").click();
  let navigations = 0;
  page.on("request", request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) navigations++; });
  for (const locale of ["ar", "sv", "en"] as const) {
    await page.locator('header button[aria-controls="header-languages"]').click();
    await page.locator("#header-languages").getByRole("menuitemradio", { name: locale === "ar" ? /العربية/ : locale === "sv" ? /Svenska/ : /English/ }).click();
    await expect(sentence(page)).toHaveText(meetAiCopy[locale].steps[8]);
    await expect(work(page).locator("[data-work-step]")).toHaveText(workProcessCopy[locale].steps[1]);
    await expect(section(page).getByRole("heading")).toHaveText(meetAiCopy[locale].title);
    await expect(section(page).getByRole("link")).toHaveText(meetAiCopy[locale].action);
    await expect(section(page).getByText(meetAiCopy[locale].description, { exact: true })).toBeVisible();
    await expect(section(page).getByText(meetAiCopy[locale].clarification!, { exact: true })).toBeVisible();
    await expect(section(page).locator("[data-work-next]")).toHaveAttribute("aria-label", meetAiCopy[locale].next);
    await expect(section(page)).toHaveCSS("direction", locale === "ar" ? "rtl" : "ltr");
  }
  expect(navigations).toBe(0);
});

test("Meet AI automatically loops nine steps with the existing timing and pauses accessibly", async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(key => localStorage.setItem(key, "complete"), INTRO_STORAGE_KEY);
  await page.goto("/");
  await expect(card(page)).toHaveAttribute("data-playing", "false");
  await card(page).scrollIntoViewIfNeeded();
  await expect(card(page)).toHaveAttribute("data-playing", "true");
  const box = await card(page).boundingBox();
  for (let index = 0; index < 9; index++) {
    await expect(sentence(page)).toHaveText(meetAiCopy.en.steps[index], { timeout: 4500 });
    await expect(sentence(page)).toHaveCSS("animation-duration", "3.2s");
    expect(await card(page).boundingBox()).toEqual(box);
    if (index === 0) {
      await page.waitForTimeout(2400);
      await expect(sentence(page)).toHaveAttribute("data-work-step", "1");
      await expect(sentence(page)).toHaveCSS("opacity", "1");
    }
  }
  await expect(sentence(page)).toHaveText(meetAiCopy.en.steps[0], { timeout: 4500 });
  await section(page).locator("[data-work-pause]").click();
  await expect(card(page)).toHaveAttribute("data-playing", "false");
  await expect(sentence(page)).toHaveCSS("opacity", "1");
  await page.waitForTimeout(3400);
  await expect(sentence(page)).toHaveAttribute("data-work-step", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(sentence(page)).toHaveCSS("animation-name", "none");
  await section(page).locator("[data-work-next]").focus();
  await page.keyboard.press("Enter");
  await expect(sentence(page)).toHaveAttribute("data-work-step", "2");
});

for (const width of [390, 1440]) {
  test(`How We Work remains visually identical to production at ${width}px`, async ({ page, context }, info) => {
    const reference = await context.newPage();
    try {
      for (const target of [page, reference]) {
        await target.setViewportSize({ width, height: 900 });
        await target.emulateMedia({ reducedMotion: "reduce" });
      }
      await page.goto("/");
      await reference.goto("https://bluemind-web-service.vercel.app/");
      for (const locale of ["en", "ar", "sv"]) {
        for (const target of [page, reference]) {
          await target.locator('header button[aria-controls="header-languages"]').click();
          await target.locator("#header-languages").getByRole("menuitemradio", { name: locale === "ar" ? /العربية/ : locale === "sv" ? /Svenska/ : /English/ }).click();
          await expect(work(target)).toHaveAttribute("lang", locale);
          await expect(target.locator("body")).toHaveAttribute("data-locale", locale);
          await target.evaluate(() => document.fonts.ready);
          await target.mouse.move(0, 0);
          await work(target).evaluate(element => element.scrollIntoView({ block: "center", behavior: "instant" }));
        }
        expect(await documentBox(work(page))).toEqual(await documentBox(work(reference)));
        // Compare the inner content without rounding into the new adjacent section.
        const actual = await work(page).locator(":scope > div").screenshot({ path: info.outputPath(`${locale}-actual.png`) });
        const expected = await work(reference).locator(":scope > div").screenshot({ path: info.outputPath(`${locale}-reference.png`) });
        expect(actual.equals(expected), `${locale}: unchanged How We Work pixels`).toBe(true);
      }
    } finally { await reference.close(); }
  });
}
