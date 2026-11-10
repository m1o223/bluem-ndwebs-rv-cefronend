import { expect, test } from "@playwright/test";

for (const width of [390, 768, 1440]) {
  test(`Online Store demo is usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/templates");
    await page.locator('[data-project-card="online-store"] [data-demo-cta]').click();
    await expect(page).toHaveURL(/\/templates\/online-store$/);
    const viewport = page.locator("[data-project-viewport]");
    await expect(viewport.getByRole("heading", { name: "Made for the way you move." })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect(await viewport.evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(viewport.locator("img").first()).toHaveAttribute("alt", /Editorial still life/);

    await viewport.getByLabel("Search products").fill("does not exist");
    await expect(viewport.getByRole("heading", { name: "No pieces match that search." })).toBeVisible();
    await viewport.getByRole("button", { name: "Clear search" }).click();
    await viewport.getByRole("button", { name: "View Arc jacket" }).click();
    const detail = page.getByRole("dialog", { name: "Arc jacket" });
    await expect(detail).toBeVisible();
    await detail.getByRole("button", { name: "M", exact: true }).click();
    await detail.getByRole("button", { name: /Add to bag/ }).click();
    const bag = page.getByRole("dialog", { name: /Your bag/ });
    await expect(bag).toContainText("Arc jacket");
    await bag.getByRole("button", { name: "Continue to checkout" }).click();
    const checkout = page.getByRole("dialog", { name: "Checkout preview" });
    await checkout.getByLabel("Full name").fill("Demo Customer");
    await checkout.getByLabel("Email address").fill("demo@example.com");
    await checkout.getByLabel("Shipping address").fill("1 Preview Street");
    await checkout.getByLabel("City").fill("London");
    await checkout.getByLabel("Postcode").fill("SW1A 1AA");
    await checkout.getByRole("button", { name: "Preview order" }).click();
    await expect(page.getByRole("dialog", { name: "Order received" })).toContainText(/demo order VERRA-\d{4}/);
    expect(errors).toEqual([]);
  });
}
