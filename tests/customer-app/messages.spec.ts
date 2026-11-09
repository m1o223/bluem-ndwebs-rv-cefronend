import { expect, test } from "@playwright/test";

for (const [index, width] of [1440, 768, 390].entries()) {
  test(`customer messages list and conversation flow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.request.post("/api/customer/login", {
      headers: { Origin: "http://localhost:3199" },
      data: { email: `customer-${index}@example.invalid`, password: "Isolated-browser-test-123!" },
    });
    expect(response.status()).toBe(200);

    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: "Notifications & messages", exact: true })).toBeVisible();
    await expect(page.locator("[data-message-list]")).toBeVisible();
    await expect(page.locator("[data-message-conversation]")).toBeHidden();
    await expect(page.getByRole("button", { name: /BlueMind Team/ })).toBeVisible();

    await page.getByRole("button", { name: /BlueMind Team/ }).click();
    await expect(page.locator("[data-message-list]")).toBeHidden();
    await expect(page.getByPlaceholder("Write a message...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Voice message", exact: true })).toBeVisible();

    await page.getByPlaceholder("Write a message...").fill("A test-only reply.");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.getByText("A test-only reply.", { exact: true })).toBeVisible();
    await expect(page.getByText("Thanks for your message. This local demo reply", { exact: false }).last()).toBeVisible();

    await page.getByRole("button", { name: "Back to messages", exact: true }).click();
    await expect(page.locator("[data-message-list]")).toBeVisible();
    await expect(page.getByRole("button", { name: /BlueMind Team.*Thanks for your message/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}
