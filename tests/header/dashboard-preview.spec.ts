import { expect, test } from "@playwright/test";

// The legacy preview remains available; real sign-in no longer navigates to it.
for (const [width, locale, title, back] of [[1440, "en", "Dashboard", "Back"], [768, "sv", "Översikt", "Tillbaka"], [390, "ar", "لوحة العميل", "رجوع"]] as const) {
  test(`preserved standalone dashboard preview ${locale} at ${width}px`, async ({ page, context }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(locale => localStorage.setItem("bluemind-language", locale), locale);
    const forbidden: string[] = [];
    await page.route("**/api/**", route => { forbidden.push(route.request().url()); return route.abort(); });
    await page.goto("/dashboard-preview");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator("footer, header nav, header button")).toHaveCount(0);
    await page.screenshot({ path: info.outputPath("preview.png"), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await page.getByRole("link", { name: back, exact: true }).click();
    await expect(page.locator("#sign-in-email")).toHaveValue("");
    await expect(page.locator("#sign-in-password")).toHaveValue("");
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/sign-in$/);
    expect((await context.cookies()).some(cookie => cookie.name === "__Host-bluemind_customer")).toBe(false);
    expect(forbidden).toEqual([]);
  });
}

test("preview remains reduced-motion compatible and does not authenticate", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dashboard-preview");
  await expect(page.locator("main")).toHaveCSS("animation-name", "none");
  await page.getByRole("link", { name: "Back", exact: true }).click();
  await page.getByRole("link", { name: "Back", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});
