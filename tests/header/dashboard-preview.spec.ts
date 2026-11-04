import { expect, test } from "@playwright/test";

for (const [width, locale, title, back] of [[1440, "en", "Dashboard", "Back"], [768, "sv", "Översikt", "Tillbaka"], [390, "ar", "لوحة العميل", "رجوع"]] as const) {
  test(`local-only dashboard transition ${locale} at ${width}px`, async ({ page, context }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(locale => localStorage.setItem("bluemind-language", locale), locale);
    const forbidden: string[] = [];
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.route("**/api/**", route => { forbidden.push(route.request().url()); return route.abort(); });
    page.on("request", request => {
      if (request.method() !== "GET" || /preview-user|preview-password/.test(request.url() + (request.postData() || ""))) forbidden.push(request.url());
    });
    await page.goto("/sign-in");
    const cookies = await context.cookies();
    const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
    await page.locator("#sign-in-email").fill("preview-user@example.invalid");
    await page.locator("#sign-in-password").fill("preview-password-not-real");
    const button = page.locator('button[type="submit"]');
    const dimensions = await button.boundingBox();
    const start = Date.now();
    await button.evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("aria-busy", "true");
    expect(await button.boundingBox()).toEqual(dimensions);
    await expect(page).toHaveURL(/\/dashboard-preview$/);
    expect(Date.now() - start).toBeGreaterThanOrEqual(850);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator("footer, header nav, header button")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/preview-user|preview-password/);
    await page.waitForTimeout(300);
    await page.screenshot({ path: info.outputPath("preview.png"), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await page.getByRole("link", { name: back, exact: true }).click();
    await expect(page.locator("#sign-in-email")).toHaveValue("");
    await expect(page.locator("#sign-in-password")).toHaveValue("");
    await expect(button).toBeEnabled();
    // Empty fields are allowed: this is navigation preview, not authentication.
    await button.click();
    await expect(page).toHaveURL(/\/dashboard-preview$/);
    await page.goBack();
    await expect(button).toBeEnabled();
    expect(await context.cookies()).toEqual(cookies);
    expect(await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }))).toBe(storage);
    expect(forbidden).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("preview supports reduced motion and leaving during loading cancels navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dashboard-preview");
  await expect(page.locator("main")).toHaveCSS("animation-name", "none");
  await page.getByRole("link", { name: "Back", exact: true }).click();
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('button[type="submit"]')).toBeDisabled();
  await page.getByRole("link", { name: "Back", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.waitForTimeout(1200);
  await expect(page).toHaveURL(/\/$/);
  await page.goBack();
  await expect(page.locator('button[type="submit"]')).toBeEnabled();
});
