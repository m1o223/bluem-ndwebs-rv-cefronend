import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1440]) {
  for (const [locale, title, back] of [["en", "Sign in", "Back"], ["sv", "Logga in", "Tillbaka"], ["ar", "تسجيل الدخول", "رجوع"]]) {
    test(`dedicated sign-in ${locale} at ${width}px`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(locale => localStorage.setItem("bluemind-language", locale), locale);
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/sign-in");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(page.locator("header button, header nav, header a[href='/sign-in'], footer")).toHaveCount(0);
      await expect(page.locator("main section")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      await expect(page.locator("main input")).toHaveCount(2);
      await expect(page.locator("main")).not.toContainText("Apple ID");
      await expect(page.locator("main")).toContainText("BankID");
      await expect(page.locator("main")).toContainText("Google");
      await expect.poll(() => page.locator("img").evaluateAll(images => images.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      for (const input of await page.locator("main input, main button").all()) {
        const box = (await input.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      await page.screenshot({ path: info.outputPath("sign-in.png"), fullPage: true });
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

test("unconnected methods never submit credentials or simulate authentication", async ({ page }) => {
  await page.goto("/sign-in");
  const requests: string[] = [];
  page.on("request", request => { if (request.method() !== "GET") requests.push(request.url()); });
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  expect(await page.locator("#sign-in-email").evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
  await page.getByLabel("Email", { exact: true }).fill("ui-test@example.invalid");
  await page.getByLabel("Password", { exact: true }).fill("not-a-real-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Your details have not been sent");
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await expect(page.getByRole("status")).toHaveText("Password recovery is not available yet.");
  for (const name of ["Continue with Google", "Continue with BankID"]) {
    await page.getByRole("button", { name }).click();
    await expect(page.getByRole("status")).toHaveText("This sign-in method is not connected yet.");
  }
  await expect(page).toHaveURL(/\/sign-in$/);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toMatch(/ui-test|not-a-real-password/);
});
