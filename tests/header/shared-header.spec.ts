import { expect, test, type Page } from "@playwright/test";

const header = (page: Page) => page.locator("body > header");
const menu = (page: Page) => header(page).locator('button[aria-controls="home-navigation"]');
const language = (page: Page) => header(page).locator('button[aria-controls="header-languages"]');
const home = (page: Page) => header(page).getByRole("link", { name: "BlueMind Web Service home" });

async function appearance(page: Page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.fonts.ready);
  return header(page).evaluate(element => {
    const selectors = ['a[href="/"]', 'a[href="/sign-in"]', 'button[aria-controls="header-languages"]', 'button[aria-controls="home-navigation"]'];
    const style = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      position: style.position,
      background: style.backgroundColor,
      controls: selectors.map(selector => {
        const control = element.querySelector(selector)!;
        const box = control.getBoundingClientRect(), css = getComputedStyle(control);
        return { x: box.x, y: box.y, width: box.width, height: box.height, font: css.font, background: css.backgroundColor, border: css.borderWidth === "0px" ? "none" : css.border, radius: css.borderRadius, shadow: css.boxShadow, icons: [...control.querySelectorAll("svg")].map(svg => ({ width: svg.getAttribute("width"), height: svg.getAttribute("height"), paths: svg.innerHTML })) };
      }),
    };
  });
}

for (const width of [320, 390, 768, 1440]) {
  test(`all website routes use the released modern header at ${width}px`, async ({ page, context }, info) => {
    test.setTimeout(90000);
    const reference = await context.newPage();
    try {
      for (const target of [page, reference]) {
        await target.setViewportSize({ width, height: 900 });
        await target.emulateMedia({ reducedMotion: "reduce" });
      }
      await reference.goto("https://bluemind-web-service.vercel.app/templates/morrow");
      const expected = await appearance(reference);
      for (const path of ["/", "/templates", "/templates/morrow", "/templates/aster", "/templates/june-atlas", "/templates/meridian", "/templates/form-field", "/templates/haven", "/templates/sera", "/about", "/services", "/how-we-work", "/care", "/contact", "/quote", "/sign-in", "/our-work"]) {
        expect((await page.goto(path))?.status(), path).toBe(200);
        await expect(header(page)).toHaveCount(1);
        await expect(header(page).locator('a[href="/sign-in"]')).toBeVisible();
        expect(await appearance(page), path).toEqual(expected);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      }
      await page.goto("/");
      await page.screenshot({ path: info.outputPath("home-modern-header.png") });
    } finally { await reference.close(); }
  });

  test(`client navigation, browser back and forward keep the modern header at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/");
    const expected = await appearance(page);
    const assertHeader = async () => {
      await page.evaluate(() => scrollTo(0, 0));
      await expect(menu(page)).toHaveAttribute("aria-expanded", "false");
      await expect(language(page)).toHaveAttribute("aria-expanded", "false");
      expect(await appearance(page)).toEqual(expected);
    };
    const navigate = async (href: string) => {
      await menu(page).click();
      await header(page).locator(`#home-navigation a[href="${href}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${href === "/" ? "/" : href}$`));
      await assertHeader();
    };
    await navigate("/templates");
    await page.locator('[data-project-card="ecommerce"]').click();
    await expect(page).toHaveURL(/\/templates\/morrow$/);
    await assertHeader();
    await home(page).click();
    await expect(page).toHaveURL(/\/$/);
    await assertHeader();
    await menu(page).click();
    await page.goBack();
    await expect(page).toHaveURL(/\/templates\/morrow$/);
    await assertHeader();
    await language(page).click();
    await page.goForward();
    await expect(page).toHaveURL(/\/$/);
    await assertHeader();
    await navigate("/about");
    await header(page).locator('a[href="/sign-in"]').click();
    await expect(page).toHaveURL(/\/sign-in$/);
    await assertHeader();
    await navigate("/");
    await page.reload();
    await assertHeader();
    await page.evaluate(() => scrollTo(0, 600));
    await expect(header(page)).toHaveAttribute("data-scrolled", "true");
    await expect.poll(async () => (await header(page).boundingBox())!.y).toBe(0);
    await page.screenshot({ path: info.outputPath("home-return-sticky.png") });
    expect(errors).toEqual([]);
  });
}
