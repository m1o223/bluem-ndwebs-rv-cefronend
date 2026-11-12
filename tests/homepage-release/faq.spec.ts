import { expect, test } from "@playwright/test";

test.describe("homepage FAQ", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => localStorage.setItem("bluemind:brand-intro:v1", "complete"));
    await page.goto("/");
  });

  test("opens a homepage answer and links to the complete FAQ page", async ({ page }) => {
    const section = page.locator("[data-home-faq]");
    await expect(section).toBeVisible();
    await expect(section.locator("details")).toHaveCount(4);
    await expect(section.locator("summary").first()).toHaveText("Who are we?");
    await expect(section.locator("details").first().locator("p")).toBeHidden();

    await section.locator("summary").first().click();
    await expect(section.locator("details").first().locator("p")).toContainText("BlueMind");
    await expect(section.locator("details").first()).toHaveAttribute("open", "");

    await section.getByRole("link", { name: "View all FAQs" }).click();
    await expect(page).toHaveURL(/\/faq$/);
    await expect(page.locator("[data-faq-list] details")).toHaveCount(11);
    await expect(page.locator("[data-faq-list] h2")).toHaveText("Frequently Asked Questions");
  });

  test("keeps the accordion usable on mobile and localizes the FAQ", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => localStorage.setItem("bluemind-language", "ar"));
    await page.reload();
    const section = page.locator("[data-home-faq]");
    await expect(section.locator("[data-faq-list]")).toHaveAttribute("dir", "rtl");
    await expect(section.locator("summary").first()).toHaveText("مين نحنا؟");
    await section.locator("summary").first().click();
    await expect(section.locator("details").first().locator("p")).toContainText("BlueMind");
    await section.locator('a[href="/faq"]').click();
    await expect(page).toHaveURL(/\/faq$/);
    await expect(page.locator("[data-faq-list]")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("[data-faq-list] details")).toHaveCount(11);
  });

  test("shows the updated contact details, payment methods, and FAQ footer link", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer.locator('a[href="mailto:contactusbluemind@gmail.com"]')).toBeVisible();
    await expect(footer.getByRole("link", { name: /Contact Us/ })).toHaveAttribute("href", "/contact");
    await expect(footer.locator('[aria-labelledby="footer-payments-title"] li')).toHaveCount(12);
    await expect(footer.locator('[aria-labelledby="footer-payments-title"] img[alt="Google Pay"]')).toBeVisible();
    await expect(footer.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/faq");
    await expect(footer.getByText("Coming soon", { exact: true })).toHaveCount(0);
  });

  test("links each social icon to the matching BlueMind account", async ({ page }) => {
    const footer = page.locator("footer");
    const socialLinks = [
      ["TikTok", "https://www.tiktok.com/@bluemind_ai?_r=1&_t=ZN-9BLvODcOezm"],
      ["Instagram", "https://www.instagram.com/bluemind_ai?srtk=NmlsbG52bjBneDQ3&utm_source=qr"],
      ["X", "https://x.com/bluemind_ai?s=11"],
    ] as const;

    for (const [name, href] of socialLinks) {
      const link = footer.getByRole("link", { name: `BlueMind Web Service on ${name}` });
      await expect(link).toHaveAttribute("href", href);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
