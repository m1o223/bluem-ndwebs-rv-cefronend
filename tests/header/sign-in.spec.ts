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

test("email, BankID and recovery remain local previews without authentication", async ({ page, context }) => {
  await page.goto("/sign-in");
  const requests: string[] = [];
  const cookies = await context.cookies();
  page.on("request", request => { if (request.method() !== "GET" || request.url().includes("/api/") || /ui-test|not-a-real-password/.test(request.url() + (request.postData() || ""))) requests.push(request.url()); });
  await page.getByLabel("Email", { exact: true }).fill("ui-test@example.invalid");
  await page.getByLabel("Password", { exact: true }).fill("not-a-real-password");
  await page.locator("#sign-in-customer-type").selectOption("company");
  for (const name of ["Continue with BankID", "Forgot password?"]) {
    const button = page.getByRole("button", { name, exact: true });
    const before = await button.boundingBox();
    await button.evaluate(element => { (element as HTMLButtonElement).click(); (element as HTMLButtonElement).click(); });
    await expect(page.getByRole("status")).toHaveText("Previewing interaction...");
    await expect(button).toBeDisabled();
    expect(await button.boundingBox()).toEqual(before);
    await expect(page.getByRole("status")).toHaveText("Preview complete. You have not been signed in.");
    await expect(button).toBeEnabled();
  }
  await page.getByLabel("Password", { exact: true }).press("Enter");
  await expect(page.getByRole("status")).toHaveText("Previewing interaction...");
  await expect(page).toHaveURL(/\/dashboard-preview$/);
  expect(requests).toEqual([]);
  expect(await context.cookies()).toEqual(cookies);
  expect(context.pages()).toHaveLength(1);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toMatch(/ui-test|not-a-real-password/);
  await page.goBack();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
  await expect(page.locator("#sign-in-customer-type")).toHaveValue("");
});

test("preview respects reduced motion, keyboard focus and navigation cleanup", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/sign-in");
  await page.getByLabel("Email", { exact: true }).focus();
  await expect(page.getByLabel("Email", { exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Password", { exact: true })).toBeFocused();
  const bankid = page.getByRole("button", { name: "Continue with BankID" });
  await bankid.click();
  await expect(bankid.locator("svg")).toHaveCSS("animation-name", "none");
  await page.getByRole("link", { name: "Back", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goBack();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeEnabled();
  await expect(page.getByRole("status")).toBeEmpty();
});
