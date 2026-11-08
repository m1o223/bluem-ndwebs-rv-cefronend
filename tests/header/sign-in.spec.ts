import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1440]) {
  for (const [locale, title, back] of [["en", "Get Started", "Back"], ["sv", "Kom igång", "Tillbaka"], ["ar", "ابدأ الآن", "رجوع"]]) {
    test(`dedicated Get Started ${locale} at ${width}px`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(locale => localStorage.setItem("bluemind-language", locale), locale);
      const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
      await page.goto("/sign-in");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(page.locator("header button, header nav, header a[href='/sign-in'], footer")).toHaveCount(0);
      await expect(page.locator("main section")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      await expect(page.locator("main input")).toHaveCount(0);
      await expect(page.locator("main")).not.toContainText("Apple ID");
      await expect(page.getByRole("button", { name: /BankID/ })).toBeDisabled();
      await expect(page.locator("[data-auth-card]")).toContainText("Google");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      const emailOption=page.locator("[data-auth-card] button").last();
      await emailOption.click();
      await expect(page.locator("[data-auth-card] input")).toHaveCount(3);
      await expect(page.locator("#sign-in-customer-type")).toHaveValue("");
      await expect(page.locator("#sign-in-customer-type")).not.toHaveAttribute("required", "");
      for (const input of await page.locator("[data-auth-card] input, [data-auth-card] select, [data-auth-card] button").all()) {
        const box = (await input.boundingBox())!; expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      await page.screenshot({ path: info.outputPath("registration.png"), fullPage: true });
      await page.getByRole("link", { name: back, exact: true }).click();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator('header button[aria-controls="home-navigation"]')).toBeVisible();
      await expect(page.locator("footer")).toHaveCount(1);
      await page.goBack();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(page.locator("footer")).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }
}

test("email login keeps real error handling and keyboard access", async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue with Email & Password", exact: true }).click();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByLabel("Email", { exact: true }).fill("ui-test@example.invalid");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Password", { exact: true })).toBeFocused();
  await page.getByLabel("Password", { exact: true }).fill("not-a-real-password");
  await page.route("**/api/customer/login", route => route.fulfill({ status: 401, json: { code: "credentials" } }));
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Email or password is incorrect");
  expect((await context.cookies()).some(c => c.name === "__Host-bluemind_customer")).toBe(false);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toMatch(/ui-test|not-a-real-password/);
});
