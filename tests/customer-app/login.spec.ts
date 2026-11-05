import { test, expect } from "@playwright/test";

for (const [index, width] of [390, 768, 1440].entries()) {
  test(`real email login and account redirect at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/login");
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.locator("header")).not.toContainText("Menu");
    await page.getByLabel("Email", { exact: true }).fill(`customer-${index}@example.invalid`);
    await page.getByLabel("Password", { exact: true }).fill("Isolated-browser-test-123!");
    await page.screenshot({ path: info.outputPath(`login-${width}.png`) });
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/dashboard$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

test("email failure never opens the demo dashboard; duplicate submissions are prevented", async ({ page }) => {
  await page.goto("/login");
  let calls = 0;
  await page.route("**/api/customer/login", async route => { calls++; await new Promise(resolve => setTimeout(resolve, 250)); await route.fulfill({ status: 401, json: { code: "credentials" } }); });
  await page.getByLabel("Email", { exact: true }).fill("customer-4@example.invalid");
  await page.getByLabel("Password", { exact: true }).fill("incorrect");
  const button = page.getByRole("button", { name: "Sign in", exact: true });
  await button.evaluate(element => { (element as HTMLButtonElement).click(); (element as HTMLButtonElement).click(); });
  await expect(page.getByRole("status")).toContainText("Email or password is incorrect");
  expect(calls).toBe(1);
  await expect(page).toHaveURL(/\/login$/);
});

test("password change revokes sessions and requires the new password", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("customer-11@example.invalid");
  await page.getByLabel("Password", { exact: true }).fill("Isolated-browser-test-123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const old = (await context.cookies()).find(cookie => cookie.name === "__Host-bluemind_customer")!;
  await page.goto("/account");
  await page.getByLabel("Current password", { exact: true }).fill("Isolated-browser-test-123!");
  await page.getByLabel("New password", { exact: true }).fill("Replacement-test-password-456!");
  await page.getByRole("button", { name: "Change password", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  expect((await context.cookies()).some(cookie => cookie.name === "__Host-bluemind_customer")).toBe(false);
  const response = await page.request.get("/api/customer/session", { headers: { Cookie: `${old.name}=${old.value}` } });
  expect(response.status()).toBe(401);
  await page.getByLabel("Email", { exact: true }).fill("customer-11@example.invalid");
  await page.getByLabel("Password", { exact: true }).fill("Replacement-test-password-456!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("customer API rejects cross-origin mutations even from another production alias", async ({ request }) => {
  const response = await request.post("/api/customer/login", { headers: { Origin: "https://bluemindwebservice.com" }, data: { email: "customer-1@example.invalid", password: "not-used" } });
  expect(response.status()).toBe(403);
});

test("session guard waits, retains cookies on temporary errors and retries without logging out", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("customer-9@example.invalid");
  await page.getByLabel("Password", { exact: true }).fill("Isolated-browser-test-123!");
  let fail = true;
  await page.route("**/api/customer/session", async route => {
    if (fail) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({ status: 503, json: { code: "unavailable" } });
    } else await route.continue();
  });
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("alert")).toBeVisible();
  expect((await context.cookies()).some(cookie => cookie.name === "__Host-bluemind_customer")).toBe(true);
  await expect(page.getByRole("heading", { name: "Home", exact: true })).toHaveCount(0);
  fail = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
  await page.route("**/api/customer/session", route => route.fulfill({ status: 401, json: { user: null } }));
  // Revoke the actual session too, so the login page does not legitimately return to dashboard.
  await context.request.post("/api/customer/logout", { headers: { Origin: "http://localhost:3199" } });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page).toHaveURL(/\/sign-in$/);
});
