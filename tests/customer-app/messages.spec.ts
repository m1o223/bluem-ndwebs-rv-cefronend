import { expect, test } from "@playwright/test";

for (const [width, customer] of [[1440, 8], [768, 9], [390, 10]] as const) {
  test(`customer messages list and conversation flow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.request.post("/api/customer/login", {
      headers: { Origin: "http://localhost:3199" },
      data: { email: `customer-${customer}@example.invalid`, password: "Isolated-browser-test-123!" },
    });
    expect(response.status()).toBe(200);

    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: "Messages", exact: true })).toBeVisible();
    await expect(page.locator("[data-message-list]")).toBeVisible();
    await expect(page.locator("[data-message-conversation]")).toBeHidden();
    await expect(page.getByRole("button", { name: /BlueMind Web Service/ })).toBeVisible();
    await expect(page.locator("[data-message-list]").getByText("Welcome to BlueMind Web Service. How can I help you today?", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /BlueMind Web Service/ }).click();
    await expect(page.locator("[data-message-list]")).toBeHidden();
    await expect(page.locator("[data-account-header]")).toBeHidden();
    await expect(page.locator("[data-message-conversation-header]")).toBeVisible();
    await expect(page.locator("[data-message-conversation]").getByText("Welcome to BlueMind Web Service. How can I help you today?", { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder("Write your message...")).toBeVisible();
    await expect(page).toHaveURL(/conversation=team/);
    await page.reload();
    await expect(page.locator("[data-message-list]")).toBeHidden();
    await expect(page.locator("[data-message-conversation-header]")).toBeVisible();
    await page.getByPlaceholder("Write your message...").fill("A test-only reply.");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.locator("[data-message-conversation]").getByText("A test-only reply.", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.locator("[data-message-list]")).toBeVisible();
    await expect(page.locator("[data-account-header]")).toBeVisible();
    await expect(page.locator("[data-message-conversation-header]")).toBeHidden();
    await expect(page.getByRole("button", { name: /BlueMind Web Service.*A test-only reply/ })).toBeVisible();
    await page.getByRole("button", { name: /BlueMind Web Service.*A test-only reply/ }).click();
    await page.goBack();
    await expect(page.locator("[data-message-list]")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}
