import { expect, test } from "@playwright/test";

const templates = [
  ["ecommerce", "morrow"],
  ["ai-platform", "aster"],
  ["photography", "june-atlas"],
  ["corporate", "meridian"],
  ["furniture", "form-field"],
  ["real-estate", "haven"],
  ["restaurant", "sera"],
  ["online-store", "online-store"],
] as const;

for (const width of [390, 768, 1440]) {
  test(`website concepts open an interactive preview at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/templates");

    const card = page.locator('[data-project-card="restaurant"]');
    await expect(card).toHaveAttribute("href", "/templates/sera");
    await card.click();

    const dialog = page.locator("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-project-viewport] h1")).toBeVisible();
    const initialMode = width < 600 ? "Phone" : width < 1000 ? "iPad" : "Desktop";
    await expect(dialog.getByRole("button", { name: initialMode, exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    for (const label of ["Phone", "iPad", "Desktop"]) {
      const control = dialog.getByRole("button", { name: label, exact: true });
      await expect(control).toBeVisible();
      await control.click();
      await expect(control).toHaveAttribute("aria-pressed", "true");
    }

    const viewport = dialog.locator("[data-project-viewport]");
    await viewport.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    await dialog.getByRole("button", { name: /Close preview/i }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/templates$/);
  });
}

test("all website concept cards remain available and show a touch-friendly preview action", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/templates");

  const cards = page.locator("[data-project-card]");
  await expect(cards).toHaveCount(8);
  for (const card of await cards.all()) {
    await expect(card.locator("[data-demo-cta]")).toHaveCSS("opacity", "1");
  }

  const last = cards.last();
  await last.scrollIntoViewIfNeeded();
  await last.click();
  const dialog = page.locator("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("#project-viewer-title")).toHaveText("VERRA");
  await dialog.getByRole("button", { name: /Close preview/i }).click();
  await expect(dialog).toHaveCount(0);
});
