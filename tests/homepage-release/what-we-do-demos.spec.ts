import { expect, test } from "@playwright/test";

test.describe("What We Do interactive demos", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("bluemind:brand-intro:v1", "complete"));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
  });

  test("exposes every category and completes a restaurant demo order", async ({ page }) => {
    const categories = page.locator("[data-demo-categories] button");
    await expect(categories).toHaveCount(16);
    await expect(page.locator('[data-demo-category="restaurant"]')).toContainText("Restaurant");
    await expect(page.locator('[data-demo-category="cafe"]')).toContainText("Café");

    const restaurant = page.locator('[data-demo-category="restaurant"]');
    await restaurant.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[data-demo-site][data-demo-category="restaurant"]')).toBeVisible();
    await expect(page.getByText("Demo website", { exact: true })).toBeVisible();

    const frame = page.locator("[data-demo-viewport]");
    await expect(frame).toHaveAttribute("data-demo-device", "desktop");
    await page.getByRole("button", { name: "Phone", exact: true }).click();
    await expect(frame).toHaveAttribute("data-demo-device", "phone");
    await page.getByRole("button", { name: "Desktop", exact: true }).click();

    await page.getByRole("button", { name: "Order from the menu", exact: true }).first().click();
    await page.getByRole("button", { name: /Add$/ }).first().click();
    await page.getByRole("button", { name: "Review checkout" }).click();
    await page.getByLabel("Name").fill("Demo guest");
    await page.getByLabel("Email").fill("guest@example.com");
    await page.getByLabel("Pickup or delivery note").fill("Please prepare this for the evening.");
    await page.getByRole("button", { name: "Place demo order" }).click();
    await expect(page.getByText("Demo complete", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Close demo" }).click();
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(restaurant).toBeFocused();
  });

  test("keeps the cafe demo usable on mobile and preserves a separate identity", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const cafe = page.locator('[data-demo-category="cafe"]');
    await cafe.click();
    const site = page.locator('[data-demo-site][data-demo-category="cafe"]');
    await expect(site).toBeVisible();
    await expect(site.locator("header strong")).toHaveText("DAYLIGHT");
    await page.getByRole("button", { name: "Phone", exact: true }).click();
    await expect(site.getByRole("button", { name: "Open menu" })).toBeVisible();
    await site.getByRole("button", { name: "Open menu" }).click();
    await expect(site.locator("nav")).toBeVisible();
    await site.getByRole("button", { name: "Order for pickup", exact: true }).first().click();
    await expect(site.getByText("Demo order", { exact: true })).toBeVisible();
    await expect(site.locator("textarea")).toHaveCount(0);
  });

  test("opens the correct demo for every What We Do category", async ({ page }) => {
    const categoryIds = [
      "restaurant",
      "cafe",
      "salon",
      "store",
      "company",
      "portfolio",
      "product-launch",
      "appointment",
      "hotel",
      "real-estate",
      "clinic",
      "fitness",
      "courses",
      "events",
      "nonprofit",
      "ai-platform",
    ];

    for (const id of categoryIds) {
      const opener = page.locator(`[data-demo-category="${id}"]`);
      await opener.click();
      await expect(page.locator(`[data-demo-site][data-demo-category="${id}"]`)).toBeVisible();
      await page.getByRole("button", { name: "Close demo" }).click();
      await expect(page.locator("[role=dialog]")).toHaveCount(0);
      await expect(opener).toBeFocused();
    }
  });

  test("completes the primary journey for every demo", async ({ page }) => {
    const cartIds = new Set(["restaurant", "cafe", "store"]);
    const bookingIds = new Set(["salon", "appointment", "hotel", "clinic", "fitness"]);
    const categoryIds = [
      "restaurant",
      "cafe",
      "salon",
      "store",
      "company",
      "portfolio",
      "product-launch",
      "appointment",
      "hotel",
      "real-estate",
      "clinic",
      "fitness",
      "courses",
      "events",
      "nonprofit",
      "ai-platform",
    ];

    for (const id of categoryIds) {
      const opener = page.locator(`[data-demo-category="${id}"]`);
      await opener.click();
      const site = page.locator(`[data-demo-site][data-demo-category="${id}"]`);
      const flow = site.locator("[data-demo-flow]");
      await site.locator('[data-demo-section="home"] button').first().click();

      if (cartIds.has(id)) {
        await flow.getByRole("button", { name: /Add$/ }).first().click();
        await flow.getByRole("button", { name: "Review checkout" }).click();
        await site.getByLabel("Name").fill("Demo guest");
        await site.getByLabel("Email").fill("guest@example.com");
        await site.getByLabel("Pickup or delivery note").fill("A demo request.");
      } else if (bookingIds.has(id)) {
        await flow.locator("button").nth(1).click();
        await site.getByLabel("Name").fill("Demo guest");
      } else if (id === "ai-platform") {
        await flow.locator("textarea").fill("A calm website for a small studio.");
      } else {
        if (id === "events" || id === "nonprofit") await flow.locator("button").nth(1).click();
        await site.getByLabel("Name").fill("Demo guest");
        await site.getByLabel("Email").fill("guest@example.com");
        if (id === "real-estate") await site.getByLabel("Preferred date").fill("2026-06-18");
        else await site.getByLabel("Message").fill("Please send the next step.");
      }

      await flow.locator('form button[type="submit"]').click();
      await expect(site.getByText("Demo complete", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Close demo" }).click();
      await expect(opener).toBeFocused();
    }
  });
});
