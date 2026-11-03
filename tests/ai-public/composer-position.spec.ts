import { expect, test, type Page } from "@playwright/test";

const input = (page: Page) => page.getByRole("textbox", { name: "Message", exact: true });
const form = (page: Page) => page.locator("form").filter({ has: input(page) });
const viewports = [320, 390, 768, 1024, 1440, 1920];

async function appearance(page: Page) {
  return form(page).evaluate(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const textarea = element.querySelector("textarea")!;
    const textStyle = getComputedStyle(textarea);
    return {
      x: rect.x, width: rect.width, height: rect.height,
      background: style.backgroundColor, border: style.border, radius: style.borderRadius,
      padding: style.padding, gap: style.gap, grid: style.gridTemplateColumns,
      font: textStyle.font, inputPadding: textStyle.padding, placeholder: textarea.placeholder,
      buttons: [...element.querySelectorAll("button")].map(button => {
        const css = getComputedStyle(button), box = button.getBoundingClientRect();
        return { width: box.width, height: box.height, radius: css.borderRadius, padding: css.padding };
      }),
    };
  });
}

async function newChat(page: Page, mobile: boolean) {
  if (mobile) await page.getByRole("button", { name: "Open sidebar", exact: true }).click();
  await page.getByRole("button", { name: "New chat", exact: true }).click();
}

for (const width of viewports) {
  test(`empty screen remains pixel-identical to released design at ${width}px`, async ({ page, context }, testInfo) => {
    const baseline = await context.newPage();
    try {
      for (const target of [baseline, page]) {
        await target.setViewportSize({ width, height: 900 });
        await target.emulateMedia({ reducedMotion: "reduce" });
      }
      await baseline.goto("https://bluemind-web-service.vercel.app/ask-ai");
      await page.goto("/ask-ai");
      for (const target of [baseline, page]) {
        await expect(target.getByRole("heading", { name: "BlueMind AI", exact: true })).toBeVisible();
        await target.evaluate(() => document.fonts.ready);
        await target.waitForFunction(() => Boolean(document.querySelector("textarea")?.style.height) && [...document.images].every(image => image.complete && image.naturalWidth > 0));
        await target.waitForTimeout(250);
      }
      expect(await appearance(page)).toEqual(await appearance(baseline));
      const reference = await baseline.screenshot({ animations: "disabled", path: testInfo.outputPath("released-empty.png") });
      const actual = await page.screenshot({ animations: "disabled", path: testInfo.outputPath("empty.png") });
      expect(actual.equals(reference)).toBe(true);
    } finally { await baseline.close(); }
  });

  test(`same composer moves only vertically after sending and resets at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.route("**/api/ai/chat", route => route.fulfill({ contentType: "application/x-ndjson", body: '{"type":"delta","text":"A test response."}\n{"type":"done"}\n' }));
    await page.goto("/ask-ai");
    await page.evaluate(() => document.fonts.ready);
    await input(page).focus();
    await page.waitForTimeout(200);
    const before = await appearance(page);
    const originalY = (await form(page).boundingBox())!.y;
    const originalNode = await form(page).elementHandle();
    await input(page).fill("Plan a website");
    await page.getByRole("button", { name: "Send message", exact: true }).click();
    await page.mouse.move(0, 0);
    await expect(page.getByLabel("Your message", { exact: true })).toBeVisible();
    await expect(page.locator('[data-welcome="false"]')).toBeVisible();
    await expect.poll(() => form(page).evaluate(el => el.getAnimations().filter(a => a.playState === "running").length)).toBe(0);
    await page.waitForTimeout(200);
    expect(await originalNode!.evaluate(el => el === document.querySelector("form"))).toBe(true);
    expect(await appearance(page)).toEqual(before);
    const after = (await form(page).boundingBox())!;
    if (width >= 1024) expect(after.y).toBeGreaterThan(originalY + 80);
    else expect(after.y).toBeCloseTo(originalY, 0);
    expect(after.y + after.height).toBeLessThanOrEqual(900);
    expect(after.y + after.height).toBeGreaterThan(780);
    await expect(page.getByRole("heading", { name: "BlueMind AI", exact: true })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Create a website", exact: true })).not.toBeVisible();
    await expect(page.getByRole("group", { name: "Response actions" })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("conversation.png") });
    await input(page).fill("And the colors?");
    await input(page).press("Enter");
    await expect(page.getByLabel("Your message", { exact: true })).toHaveCount(2);
    expect((await form(page).boundingBox())!.y).toBeCloseTo(after.y, 0);
    await newChat(page, width < 768);
    await expect(page.getByRole("heading", { name: "BlueMind AI", exact: true })).toBeVisible();
    await expect.poll(() => form(page).evaluate(el => el.getAnimations().filter(a => a.playState === "running").length)).toBe(0);
    await expect(input(page)).toHaveValue("");
    await input(page).focus();
    await page.waitForTimeout(200);
    expect((await form(page).boundingBox())!.y).toBeCloseTo(originalY, 0);
    expect(await appearance(page)).toEqual(before);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("desktop motion changes only translateY, can be interrupted, and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/api/ai/chat", route => route.fulfill({ status: 503, json: { code: "unavailable" } }));
  await page.goto("/ask-ai");
  await input(page).fill("Test motion");
  const frames = await form(page).evaluate(element => {
    (element as HTMLFormElement).requestSubmit();
    return new Promise<unknown[]>(resolve => requestAnimationFrame(() => {
      const animation = element.getAnimations().find(a => a.effect instanceof KeyframeEffect && a.effect.getKeyframes().some(k => k.transform));
      animation?.pause();
      resolve((animation?.effect as KeyframeEffect)?.getKeyframes().map(k => k.transform) ?? []);
    }));
  });
  expect(frames).toHaveLength(2);
  expect(frames.every(frame => typeof frame === "string" && /^translateY\(-?[\d.]+px?\)$|^translateY\(0\)$/.test(frame))).toBe(true);
  await newChat(page, false);
  await expect.poll(() => form(page).evaluate(el => el.getAnimations().filter(a => a.playState === "running").length)).toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await input(page).fill("Reduced motion");
  await input(page).press("Enter");
  expect(await form(page).evaluate(el => el.getAnimations().length)).toBe(0);
});
