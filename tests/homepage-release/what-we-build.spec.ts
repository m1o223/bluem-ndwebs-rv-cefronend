import { expect, test } from "@playwright/test";

for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]]) {
  test(`homepage order and payment bar fit ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => localStorage.setItem("bluemind:brand-intro:v1", "complete"));
    await page.goto("/");

    const hero = page.locator("[data-hero]");
    const visual = hero.locator("[data-hero-visual]");
    const payments = hero.locator("[data-payment-methods]");
    const whatWeDo = page.locator("[data-what-we-do]");
    await expect(hero).toBeVisible();
    await expect(visual).toBeVisible();
    await expect(payments).toBeVisible();
    await expect(whatWeDo).toBeVisible();
    await expect(page.locator(".scrollCue")).toHaveCount(0);

    const visualBox = (await visual.boundingBox())!;
    const paymentsBox = (await payments.boundingBox())!;
    const whatWeDoBox = (await whatWeDo.boundingBox())!;
    expect(paymentsBox.y).toBeGreaterThanOrEqual(visualBox.y + visualBox.height - 1);
    expect(whatWeDoBox.y).toBeGreaterThanOrEqual(paymentsBox.y + paymentsBox.height - 1);

    const primary = payments.locator('[data-payment-set="primary"]');
    expect(await primary.locator("[data-payment-name]").evaluateAll(elements => elements.map(element => element.getAttribute("data-payment-name")))).toEqual([
      "Klarna", "Swish", "Faktura", "Visa", "Mastercard", "Apple Pay", "Google Pay", "PayPal", "American Express", "Alipay", "mada", "Pix",
    ]);
    for (const name of ["Klarna", "Swish", "Faktura"]) await expect(primary.locator(`[data-payment-name="${name}"]`)).toBeVisible();
    await expect(primary.locator('[data-payment-name="Klarna"] img')).toHaveAttribute("src", /klarna/);
    await expect(primary.locator('[data-payment-name="Swish"] img')).toHaveAttribute("src", /swish/);
    await expect(primary.locator('[data-payment-name="Faktura"]')).toContainText("Faktura");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

test("payment bar holds briefly then uses a slow seamless marquee", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem("bluemind:brand-intro:v1", "complete"));
  await page.goto("/");
  const track = page.locator("[data-payment-track]");
  await expect(track).toBeVisible();
  const timing = await track.evaluate(element => {
    const animation = element.getAnimations()[0];
    const effect = animation?.effect?.getTiming();
    return { delay: effect?.delay, duration: effect?.duration };
  });
  expect(timing).toEqual({ delay: 1200, duration: 72000 });
});

for (const [locale, paymentTitle, sectionTitle] of [["ar", "طرق الدفع", "شو منعمل؟"], ["sv", "Betalningsmetoder", "Vad vi gör"]]) {
  test(`localized What We Do and payment title in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(value => localStorage.setItem("bluemind-language", value), locale);
    await page.goto("/");
    await expect(page.locator("#payment-methods-title")).toHaveText(paymentTitle);
    await expect(page.locator("#what-we-do-title")).toHaveText(sectionTitle);
    await expect(page.locator("[data-payment-methods]")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await expect(page.locator("[data-what-we-do]")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
  });
}
