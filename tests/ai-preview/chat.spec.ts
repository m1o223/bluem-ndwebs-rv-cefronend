import { expect, test } from "@playwright/test";
import copy from "../../components/ai-preview/copy.json";

test.beforeEach(async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  await page.route("**/*", route => {
    const url = new URL(route.request().url());
    if (/\/api\//.test(url.pathname) || /openai|stripe/.test(url.hostname)) return route.abort();
    const token = process.env.VERCEL_OIDC_TOKEN;
    if (token && url.origin === origin) {
      return route.continue({ headers: { ...route.request().headers(), "x-vercel-trusted-oidc-idp-token": token } });
    }
    return route.continue();
  });
});

for (const width of [320, 375, 768, 1440]) for (const locale of ["en", "sv", "ar"] as const) {
  test(`chat ${locale} at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    const outgoing: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => {
      if (request.method() !== "GET" || /\/api\//.test(request.url())) outgoing.push(request.url());
    });
    await page.addInitScript(value => localStorage.setItem("bluemind-language", value), locale);
    const text = copy[locale];
    await page.goto("/");
    const trigger = page.getByRole("button", { name: text.trigger, exact: true });
    await expect(trigger).toBeVisible();
    await expect(page.locator('[data-hero] a[href="/quote"]')).toHaveCount(1);
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(text.notice, { exact: true })).toBeVisible();
    const input = dialog.getByRole("textbox");
    await expect(input).toBeFocused();
    await expect(dialog.getByRole("button", { name: text.send })).toBeDisabled();
    await dialog.getByRole("button", { name: text.suggestions[0], exact: true }).click();
    await expect(dialog.getByText(text.replies[0], { exact: true }).first()).toBeVisible();
    await expect(dialog.getByText(text.simulated, { exact: true })).toBeVisible();
    await input.fill("A website idea\nWith a second line");
    await dialog.getByRole("button", { name: text.send }).click();
    await expect(input).toHaveValue("");
    await expect(dialog.getByText("A website idea\nWith a second line", { exact: true })).toBeVisible();
    await expect(dialog.getByRole("status")).toHaveCount(0);
    await input.fill("Long project description ".repeat(75));
    expect(await input.evaluate(node => node.clientHeight)).toBeLessThanOrEqual(160);
    expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    expect(await dialog.evaluate(node => {
      const bounds = node.getBoundingClientRect();
      return bounds.left >= 0 && bounds.right <= innerWidth && bounds.top >= 0 && bounds.bottom <= innerHeight;
    })).toBe(true);
    await input.fill("");
    await page.screenshot({ path: `test-results/ai-${locale}-${width}.png` });
    await dialog.getByRole("button", { name: text.close }).click();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(dialog.getByText(text.replies[0], { exact: true }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    expect(errors).toEqual([]);
    expect(outgoing).toEqual([]);
  });
}

test("all suggestions, keyboard, focus trap and scroll restoration", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: copy.en.trigger, exact: true });
  await trigger.scrollIntoViewIfNeeded();
  const scrollBefore = await page.evaluate(() => scrollY);
  await trigger.click();
  const dialog = page.getByRole("dialog");
  for (const [index, question] of copy.en.suggestions.entries()) {
    await dialog.getByRole("button", { name: question, exact: true }).click();
    await expect(dialog.getByText(copy.en.replies[index], { exact: true })).toBeVisible();
  }
  const input = dialog.getByRole("textbox");
  await input.fill("First line");
  await input.press("Shift+Enter");
  await input.press("x");
  await expect(input).toHaveValue("First line\nx");
  await input.press("Enter");
  await expect(input).toHaveValue("");
  await expect(dialog.getByText(copy.en.fallback, { exact: true })).toBeVisible();
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
});

test("short viewport and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 380 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: copy.en.trigger }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("textbox")).toBeInViewport();
  await expect(dialog.getByRole("button", { name: copy.en.close })).toBeInViewport();
  expect(await dialog.evaluate(node => getComputedStyle(node).animationName)).toBe("none");
});
