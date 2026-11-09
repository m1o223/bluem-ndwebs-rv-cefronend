import { devices, expect, test } from "@playwright/test";

test.use({ ...devices["iPhone 13"] });

test("starts a What We Do preview in phone mode on a real mobile viewport", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("bluemind:brand-intro:v1", "complete"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const cafe = page.locator('[data-demo-category="cafe"]');
  await cafe.click();
  const dialog = page.locator('[role="dialog"]');
  const site = page.locator('[data-demo-site][data-demo-category="cafe"]');
  await expect(dialog).toBeVisible();
  await expect(page.locator("[data-demo-viewport]")).toHaveAttribute("data-demo-device", "phone");
  await expect(page.getByRole("button", { name: "Close demo" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Phone", exact: true })).toBeVisible();
  await expect(site.getByRole("button", { name: "Open menu" })).toBeVisible();

  await page.getByRole("button", { name: "Close demo" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(cafe).toBeFocused();
});
