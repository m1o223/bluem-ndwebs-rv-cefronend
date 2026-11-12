import { expect, test } from "@playwright/test";

test("desktop, tablet, and mobile show the website planning preview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const demo = page.locator("[data-ai-demo]");
  await expect(demo).toBeVisible();
  await expect(demo.locator("[data-planner-field]")).toBeVisible();
  await expect(demo.locator("video")).toHaveCount(0);
  await expect(page.locator("#bluemind-ai-title")).toHaveText("Let’s plan your website");
  await expect(demo.locator("[data-planner-field]")).toContainText("Help me plan a café website");

  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(demo).toBeVisible();
});

test("mobile keeps the planning preview within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-ai-demo]")).toBeVisible();
  const section = page.locator("[data-bluemind-ai]");
  await expect(section.locator("#bluemind-ai-title")).toBeVisible();
  await expect(section.locator("[data-planner-field]")).toContainText("Help me plan a café website");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
