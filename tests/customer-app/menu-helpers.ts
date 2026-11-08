import { expect, type Page } from "@playwright/test";

export async function openEmailLogin(page: Page) {
  await page.getByRole("button", { name: "Continue with Email & Password", exact: true }).click();
}

export async function closeCustomerMenu(page: Page) {
  const menu = page.locator("#customer-menu");
  await expect(menu).toBeVisible();
  await menu.locator("button").first().click();
  await expect(menu).not.toBeVisible();
}

export async function visitCustomerPage(page: Page, path: string) {
  await page.goto(path);
  await closeCustomerMenu(page);
}
