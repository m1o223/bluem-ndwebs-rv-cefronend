import { test, expect, type Page } from "@playwright/test";
import { closeCustomerMenu, visitCustomerPage } from "./menu-helpers";
const paths = ["/dashboard", "/my-project", "/blue-mind-ai", "/dashboard/contact", "/account"];
// Seed isolated test sessions through the real backend handler, never production data.
async function authenticate(page: Page, index: number, customerType?: string) {
  const response = await page.request.post("/api/customer/login", { headers: { Origin: "http://localhost:3199" }, data: { email: `customer-${index}@example.invalid`, password: "Isolated-browser-test-123!", customerType } });
  expect(response.status()).toBe(200);
  await page.goto("/dashboard");
}
async function login(page: Page, index: number) {
  await authenticate(page, index);
  await expect(page).toHaveURL(/\/dashboard$/);
  await closeCustomerMenu(page);
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
    await page.emulateMedia({ reducedMotion: width === 768 ? "reduce" : "no-preference" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await authenticate(page, index);
    const token = (await context.cookies()).find(cookie => cookie.name === "__Host-bluemind_customer")!;
    expect(token.httpOnly).toBe(true); expect(token.secure).toBe(true); expect(token.sameSite).toBe("Lax");
    expect(await page.evaluate(() => document.cookie)).not.toContain(token.value);
    expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(token.value);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.locator("header")).not.toContainText(/Services|Pricing|Templates/);
    const menu = page.getByRole("button", { name: "Open menu", exact: true });
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").locator("nav a")).toHaveCount(5);
    await expect(page.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Tab");
    for (const action of await page.getByRole("dialog").locator("nav a, button:has([data-text-action-label])").all()) {
      const before = await action.boundingBox();
      await action.focus();
      await expect.poll(() => action.locator("[data-text-action-label]").evaluate(element => getComputedStyle(element, "::after").opacity)).toBe("1");
      expect(await action.boundingBox()).toEqual(before);
    }
    await page.screenshot({ path: info.outputPath("customer-menu.png") });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(menu).toBeFocused();
    await menu.click();
    for (const [name, path] of [["My Project", "/my-project"], ["BlueMind AI", "/blue-mind-ai"], ["Contact Us", "/dashboard/contact"], ["Account / Settings", "/account"], ["Home", "/dashboard"]]) {
      await page.getByRole("dialog").getByRole("link", { name, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(path + "$"));
      await expect(page.locator("main h1")).toHaveText(name);
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByRole("dialog").getByRole("link", { name, exact: true })).toHaveAttribute("aria-current", "page");
      await expect(page.locator("main")).not.toContainText("Unable to load");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    }
    await closeCustomerMenu(page);
    await page.locator("header a[href='/account']").click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.locator("main h1")).toHaveText("Account / Settings");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.locator("header a[href='/dashboard']").click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.locator("main h1")).toHaveText("Home");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.reload();
    await expect(page.getByRole("dialog")).toBeVisible();
    await closeCustomerMenu(page);
    await menu.click();
    await page.screenshot({ path: info.outputPath("customer-home.png") });
    const other = await context.newPage();
    await other.goto("/dashboard");
    await expect(other.getByRole("dialog")).toBeVisible();
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
test("existing authentication API still rejects invalid credentials and CSRF", async ({ page, request }) => {
  const blocked = await request.post("/api/customer/login", { headers: { Origin: "https://evil.invalid" }, data: { email: "x", password: "x" } });
  expect(blocked.status()).toBe(403);
  const invalid = await request.post("/api/customer/login", { headers: { Origin: "http://localhost:3199" }, data: { email: "customer-4@example.invalid", password: "wrong" } });
  expect(invalid.status()).toBe(401);
  await login(page, 4);
});

test("optional customer type, account persistence, demo messages and contact receipt", async ({ page }, info) => {
  await login(page, 6);
  await expect(page.getByText("No project linked to your account yet.")).toBeVisible();
  await page.getByRole("link", { name: "Notifications", exact: true }).click();
  await expect(page).toHaveURL(/\/notifications$/);
  await expect(page.locator("main h1")).toHaveText("Notifications & messages");
  await page.getByRole("button", { name: "Design direction updated", exact: true }).click();
  await expect(page.getByText("Demo conversation", { exact: true })).toBeVisible();
  await page.getByPlaceholder("Write a demo reply...").fill("A test-only reply.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText("A test-only reply.", { exact: true })).toBeVisible();
  await visitCustomerPage(page, "/account");
  await page.getByLabel("Full name", { exact: true }).fill("Customer Six");
  await page.getByLabel("Customer type (optional)").selectOption("company");
  await page.getByLabel("Company name", { exact: true }).fill("Example Company");
  await page.getByRole("switch", { name: "Project updates" }).check();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Changes saved to your account.")).toBeVisible();
  await page.screenshot({ path: info.outputPath("account-desktop.png"), fullPage: true });
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await login(page, 6);
  await expect(page.getByText("Welcome, Customer Six", { exact: true })).toBeVisible();
  await visitCustomerPage(page, "/account");
  await expect(page.getByLabel("Company name", { exact: true })).toHaveValue("Example Company");
  await expect(page.getByRole("switch", { name: "Project updates" })).toBeChecked();
  await expect(page.getByRole("button", { name: "Delete account", exact: true })).toHaveCount(0);
  await visitCustomerPage(page, "/dashboard/contact");
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("Customer Six");
  await page.getByLabel("Customer type (optional)").selectOption("");
  await expect(page.getByLabel("Company name", { exact: true })).toHaveCount(0);
  await page.getByLabel("Message", { exact: true }).fill("Please review this test-only idea.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByText("Your message has been received by the team.")).toBeVisible();
  await visitCustomerPage(page, "/account");
  await page.getByLabel("Customer type (optional)").selectOption("");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Changes saved to your account.")).toBeVisible();
  await page.reload();
  await closeCustomerMenu(page);
  await expect(page.getByLabel("Customer type (optional)")).toHaveValue("");
});

for (const width of [1440, 390]) {
  test(`notifications page supports desktop and mobile conversations at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await authenticate(page, width);
    await closeCustomerMenu(page);
    await page.getByRole("link", { name: "Notifications", exact: true }).click();
    await expect(page).toHaveURL(/\/notifications$/);
    await expect(page.getByRole("button", { name: "Design direction updated", exact: true })).toBeVisible();
    if (width === 1440) await expect(page.getByText("Demo conversation", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Design direction updated", exact: true }).click();
    await expect(page.getByPlaceholder("Write a demo reply...")).toBeVisible();
    if (width === 390) {
      await expect(page.locator(".messageList")).toBeHidden();
      await page.getByRole("button", { name: "Back to messages", exact: true }).click();
      await expect(page.locator(".messageList")).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

test("real project projection, seven stages, amounts, notifications and responsive layouts", async ({ page }, info) => {
  test.setTimeout(120000);
  await login(page, 8);
  await expect(page.locator("progress")).toHaveAttribute("value", "29");
  await expect(page.getByText("5 steps remaining until your website is ready.")).toBeVisible();
  await page.getByRole("link", { name: "Notifications", exact: true }).click();
  await expect(page).toHaveURL(/\/notifications$/);
  await expect(page.getByText("Design direction updated", { exact: true })).toBeVisible();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/dashboard", "/my-project", "/dashboard/contact", "/account", "/blue-mind-ai"]) {
      await visitCustomerPage(page, path);
      await expect(page.locator("main h1")).toBeVisible();
      await expect(page.getByText("Loading account information", { exact: true })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await page.screenshot({ path: info.outputPath(`${path.replaceAll("/", "-")}-${width}.png`), fullPage: true });
    }
  }
  await visitCustomerPage(page, "/my-project");
  await expect(page.getByText("TEST-8", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "View invoice" })).toBeDisabled();
  await expect(page.getByText("Fixture review completed")).toBeVisible();
});

test("account errors are not empty states; write failures do not show success", async ({ page }) => {
  await login(page, 9);
  await page.route("**/api/customer/overview", route => route.fulfill({ status: 503, json: { code: "unavailable" } }));
  await visitCustomerPage(page, "/account");
  await expect(page.locator("main").getByText("Unable to load your account information.")).toBeVisible();
  await page.unroute("**/api/customer/overview");
  await page.getByRole("button", { name: "Try again" }).click();
  await page.getByLabel("Full name", { exact: true }).fill("Unsaved");
  await page.route("**/api/customer/profile", route => route.fulfill({ status: 503, json: { code: "unavailable" } }));
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Unable to complete this request. Please try again.")).toBeVisible();
  await expect(page.getByText("Changes saved to your account.")).toHaveCount(0);
});
test("Arabic customer shell preserves RTL and only the approved items", async ({ page }, info) => {
  await page.addInitScript(() => localStorage.setItem("bluemind-language", "ar"));
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticate(page, 5);
  await expect(page.locator("main h1")).toHaveText("الرئيسية");
  await expect(page.getByRole("dialog").locator("nav a")).toHaveCount(5);
  await expect.poll(async () => (await page.getByRole("dialog").boundingBox())!.x).toBeGreaterThanOrEqual(0);
  const drawer = (await page.getByRole("dialog").boundingBox())!;
  expect(drawer.x + drawer.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: info.outputPath("customer-arabic.png") });
  await page.keyboard.press("Escape");
  await visitCustomerPage(page, "/account");
  await expect(page.getByLabel("نوع العميل (اختياري)")).toBeVisible();
  await page.getByLabel("نوع العميل (اختياري)").selectOption("company");
  await expect(page.getByLabel("اسم الشركة", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: info.outputPath("account-arabic.png"), fullPage: true });
});

test("Swedish account labels, optional login choice and contact failure", async ({ page }, info) => {
  await page.addInitScript(() => localStorage.setItem("bluemind-language", "sv"));
  await page.setViewportSize({ width: 768, height: 1024 });
  await authenticate(page, 10, "private");
  await expect(page).toHaveURL(/\/dashboard$/);
  await visitCustomerPage(page, "/account");
  await expect(page.getByLabel("Kundtyp (valfritt)")).toHaveValue("private");
  await page.screenshot({ path: info.outputPath("account-swedish.png"), fullPage: true });
  await visitCustomerPage(page, "/dashboard/contact");
  await page.getByLabel("Meddelande", { exact: true }).fill("A test-only message which must not be sent.");
  await page.route("**/api/customer/contact", route => route.fulfill({ status: 503, json: { code: "unavailable" } }));
  await page.getByRole("button", { name: "Skicka meddelande" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Det gick inte att slutföra begäran.");
  await expect(page.getByRole("textbox", { name: "Meddelande", exact: true })).toHaveValue("A test-only message which must not be sent.");
});
