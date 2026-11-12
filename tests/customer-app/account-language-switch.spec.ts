import { expect, test } from "@playwright/test";
import { openEmailLogin } from "./menu-helpers";

async function login(page: import("@playwright/test").Page, email = "customer-11@example.invalid") {
  const response = await page.request.post("/api/customer/login", {
    headers: { Origin: "http://localhost:3199" },
    data: { email, password: "Isolated-browser-test-123!" },
  });
  expect(response.status()).toBe(200);
  await page.goto("/account");
  await page.waitForURL(/\/(account|sign-in|login)$/);
  if (/\/(sign-in|login)$/.test(page.url())) {
    await openEmailLogin(page);
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Isolated-browser-test-123!");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.goto("/account");
  }
  await expect(page.locator("[data-account-header]")).toBeVisible();
}

for (const [code, name, heading, label] of [
  ["sv", "Svenska", "Profil", "Kundtyp (valfritt)"],
  ["ar", "العربية", "الملف الشخصي", "نوع العميل (اختياري)"],
  ["en", "English", "Profile", "Customer type (optional)"],
] as const) {
  test(`account language can switch live to ${code}`, async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: /Selected language|Valt språk|اللغة المختارة/ }).click();
    await page.getByRole("menuitemradio", { name }).click();
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await expect(page.getByRole("combobox").first()).toHaveAccessibleName(label);
    await expect(page.locator("[data-account-header] button").first()).toContainText(code === "sv" ? "SV" : code === "ar" ? "AR" : "EN");
    await expect(page.locator("html")).toHaveAttribute("lang", code === "sv" ? "sv" : code === "ar" ? "ar" : "en");
    await expect(page.locator("body")).toHaveAttribute("data-locale", code === "sv" ? "sv" : code === "ar" ? "ar" : "en");
  });
}

test("account AI language control updates the live chat without losing its draft", async ({ page }) => {
  await login(page);
  await page.goto("/blue-mind-ai");
  await expect(page.locator("[data-account-fullscreen='true'] dialog")).toBeVisible();
  const language = page.getByRole("button", { name: /Selected language|Valt språk|اللغة المختارة/ });

  await language.click();
  await page.getByRole("menuitemradio", { name: "Svenska" }).click();
  await expect(page.locator("main p").first()).toContainText("Hur kan jag");

  const composer = page.locator("textarea").first();
  await composer.fill("A draft that must survive a language change.");
  await language.click();
  await page.getByRole("menuitemradio", { name: "العربية" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("main p").first()).toContainText("كيف يمكنني");
  await expect(page.locator("textarea").first()).toHaveValue("A draft that must survive a language change.");
  await expect(page.getByRole("heading", { name: "BlueMind AI", exact: true }).last()).toBeVisible();
});

test("the saved team welcome follows the account language without duplicating", async ({ page }) => {
  await login(page);
  await page.goto("/notifications");
  await expect(page.getByRole("heading", { name: "Messages", exact: true })).toBeVisible();

  const language = page.getByRole("button", { name: /Selected language|Valt språk|اللغة المختارة/ });
  await language.click();
  await page.getByRole("menuitemradio", { name: "Svenska" }).click();
  await expect(page.locator("[data-message-list]").getByText(/Välkommen till BlueMind Web Service/)).toHaveCount(1);
  await page.getByRole("button", { name: /BlueMind Web Service/ }).click();
  await expect(page.locator("[data-message-conversation]").getByText(/Välkommen till BlueMind Web Service/)).toHaveCount(1);

  await page.getByRole("button", { name: "Tillbaka", exact: true }).click();
  await language.click();
  await page.getByRole("menuitemradio", { name: "English" }).click();
  await expect(page.locator("[data-message-list]").getByText(/Welcome to BlueMind Web Service/)).toHaveCount(1);
});

test("messages language control keeps the open conversation and draft", async ({ page }) => {
  await login(page, "customer-10@example.invalid");
  await page.goto("/notifications");
  await page.locator("[data-message-list] button").click();
  await expect(page.locator("[data-message-conversation]")).toBeVisible();

  const draft = "Keep this draft while the account language changes.";
  await page.locator("[data-message-conversation] textarea").fill(draft);
  const language = page.locator("[data-message-conversation-header] button[aria-haspopup='menu']");
  await language.click();
  await page.getByRole("menuitemradio", { name: "العربية" }).click();

  await expect(page.locator("[data-message-conversation]").getByText("مرحباً بك في BlueMind Web Service. كيف يمكنني مساعدتك اليوم?", { exact: true })).toBeVisible();
  await expect(page.locator("[data-message-conversation] textarea")).toHaveValue(draft);
  await expect(page).toHaveURL(/\/notifications\?conversation=team$/);
});

test("the selected language follows every account route and a refresh", async ({ page }) => {
  await login(page, "customer-9@example.invalid");
  await page.getByRole("button", { name: /Selected language/ }).click();
  await page.getByRole("menuitemradio", { name: "Svenska" }).click();

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Välkommen, UI test", exact: true })).toBeVisible();
  await page.goto("/notifications");
  await expect(page.getByRole("heading", { name: "Meddelanden", exact: true })).toBeVisible();
  await page.goto("/blue-mind-ai");
  await expect(page.locator("main p").first()).toContainText("Hur kan jag");
  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Profil", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Profil", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "sv");
});
