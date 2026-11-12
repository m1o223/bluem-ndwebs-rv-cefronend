import { expect, test } from "@playwright/test";

test("desktop and tablet show the recorded BlueMind AI chat demo", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const demo = page.locator("[data-ai-demo]");
  await expect(demo).toBeVisible();
  const video = demo.locator("video");
  await expect(video).toBeVisible();
  await expect(video).toHaveAttribute("src", "/videos/bluemind-ai-demo.webm");
  await expect(video).toHaveAttribute("poster", "/videos/bluemind-ai-demo-poster.png");
  await expect.poll(() => video.evaluate(element => {
    const media = element as HTMLVideoElement;
    return { width: media.videoWidth, height: media.videoHeight };
  })).toEqual({ width: 1280, height: 800 });

  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(video).toBeVisible();
});

test("mobile keeps the explanation and full chat link", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-ai-demo]")).toBeHidden();
  const section = page.locator("[data-bluemind-ai]");
  await expect(section.locator("#bluemind-ai-title")).toBeVisible();
  await expect(section.getByRole("link", { name: /Ask BlueMind AI/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
