import { test, expect, type Page } from "@playwright/test";
const paths = ["/dashboard", "/my-project", "/blue-mind-ai", "/dashboard/contact", "/account"];
async function login(page: Page, index: number) {
  await page.goto("/sign-in");
  await page.getByLabel("Email", { exact: true }).fill(`customer-${index}@example.invalid`);
  await page.getByLabel("Password", { exact: true }).fill("Isolated-browser-test-123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
}
test("unauthenticated and forged sessions cannot reach any customer page", async ({ page, context }) => {
  for (const path of paths) { await page.goto(path); await expect(page).toHaveURL(/\/sign-in$/); }
  await context.addCookies([{ name: "__Host-bluemind_customer", value: "a".repeat(64), url: "https://localhost", secure: true, httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/contact");
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator("footer")).toHaveCount(1);
});
for (const [index, width] of [390, 768, 1440].entries()) {
  test(`customer navigation and sign out at ${width}px`, async ({ page, context }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await login(page, index);
    const token = (await context.cookies()).find(cookie => cookie.name === "__Host-bluemind_customer")!;
    expect(token.httpOnly).toBe(true); expect(token.secure).toBe(true); expect(token.sameSite).toBe("Lax");
    expect(await page.evaluate(() => document.cookie)).not.toContain(token.value);
    expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(token.value);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.locator("header")).not.toContainText(/Services|Pricing|Templates/);
    const menu = page.getByRole("button", { name: "Open menu", exact: true });
    await menu.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").locator("nav a")).toHaveCount(5);
    await expect(page.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
    await page.screenshot({ path: info.outputPath("customer-menu.png") });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    for (const [name, path] of [["My Project", "/my-project"], ["BlueMind AI", "/blue-mind-ai"], ["Contact Us", "/dashboard/contact"], ["Account / Settings", "/account"], ["Home", "/dashboard"]]) {
      await menu.click();
      await page.getByRole("dialog").getByRole("link", { name, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(path + "$"));
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
      await expect(page.getByRole("dialog")).not.toBeVisible();
      await expect(page.locator("main input, main textarea, main form")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    }
    await page.screenshot({ path: info.outputPath("customer-home.png") });
    const other = await context.newPage();
    await other.goto("/dashboard");
    await expect(other.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
    await menu.click();
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(other).toHaveURL(/\/sign-in$/);
    await other.close();
    expect((await context.cookies()).find(cookie => cookie.name === "__Host-bluemind_customer")).toBeUndefined();
    await page.goBack();
    await expect(page).toHaveURL(/\/sign-in$/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in$/);
    expect(errors).toEqual([]);
  });
}
test("invalid login, CSRF, unavailable providers and duplicate submits", async ({ page, request }) => {
  const blocked = await request.post("/api/customer/login", { headers: { Origin: "https://evil.invalid" }, data: { email: "x", password: "x" } });
  expect(blocked.status()).toBe(403);
  await page.goto("/sign-in");
  await page.getByLabel("Email", { exact: true }).fill("customer-4@example.invalid");
  await page.getByLabel("Password", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Email or password is incorrect");
  for (const name of ["Continue with Google", "Continue with BankID"]) {
    await page.getByRole("button", { name }).click();
    await expect(page.getByRole("status")).toContainText("not connected");
  }
  let calls = 0;
  page.on("request", request => { if (request.url().endsWith("/api/customer/login")) calls++; });
  await page.getByLabel("Password", { exact: true }).fill("Isolated-browser-test-123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(calls).toBe(1);
});
test("Arabic customer shell preserves RTL and only the approved items", async ({ page }, info) => {
  await page.addInitScript(() => localStorage.setItem("bluemind-language", "ar"));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sign-in");
  await page.locator("#sign-in-email").fill("customer-5@example.invalid");
  await page.locator("#sign-in-password").fill("Isolated-browser-test-123!");
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole("heading", { name: "الرئيسية", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "فتح القائمة" }).click();
  await expect(page.getByRole("dialog").locator("nav a")).toHaveCount(5);
  await expect.poll(async () => (await page.getByRole("dialog").boundingBox())!.x).toBeGreaterThanOrEqual(0);
  const drawer = (await page.getByRole("dialog").boundingBox())!;
  expect(drawer.x + drawer.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: info.outputPath("customer-arabic.png") });
});
