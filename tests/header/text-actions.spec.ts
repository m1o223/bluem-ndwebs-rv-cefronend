import { expect, test, type Locator } from "@playwright/test";

async function opacity(action: Locator) {
  return action.locator("[data-text-action-label]").first().evaluate(element => getComputedStyle(element, "::after").opacity);
}

test("homepage underline reverses smoothly without changing header geometry", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const skip = page.getByRole("button", { name: /skip intro/i });
  if (await skip.isVisible()) await skip.click();
  const signIn = page.locator('header a[href="/sign-in"]');
  const before = await signIn.boundingBox();
  await expect.poll(() => opacity(signIn)).toBe("0");
  await signIn.hover();
  await expect.poll(() => opacity(signIn)).toBe("1");
  expect(await signIn.boundingBox()).toEqual(before);
  const line = await signIn.locator("[data-text-action-label]").evaluate(element => {
    const style = getComputedStyle(element, "::after");
    return { height: style.height, duration: style.transitionDuration, glow: style.boxShadow };
  });
  expect(line.height).toBe("1px");
  expect(line.duration).toContain("0.22s");
  expect(line.glow).not.toBe("none");
  await page.screenshot({ path: info.outputPath("desktop-underline.png") });
  await page.mouse.move(0, 0);
  await expect.poll(() => opacity(signIn)).toBe("0");
  await signIn.focus();
  await page.keyboard.press("Tab");
  const language = page.locator('header button[aria-controls="header-languages"]');
  await expect(language).toBeFocused();
  await expect.poll(() => opacity(language)).toBe("1");
  await page.keyboard.press("Tab");
  const menu = page.locator('header button[aria-controls="home-navigation"]');
  await expect(menu).toBeFocused();
  await expect.poll(() => opacity(menu)).toBe("1");
  await page.keyboard.press("Enter");
  const contact = page.locator('header nav a[href="/contact"]');
  await contact.hover();
  await expect.poll(() => opacity(contact)).toBe("1");
  await page.keyboard.press("Escape");
  const footer = page.locator('footer a[href="/contact"]').last();
  await footer.hover();
  await expect.poll(() => opacity(footer)).toBe("1");
  await expect(footer).toHaveCSS("text-decoration-line", "none");
  await page.goto("/about");
  await expect(page.locator("[data-text-action-label]")).toHaveCount(0);
});

test("sign-in effects preserve pill dimensions and local preview behavior", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/sign-in");
  const mutations: string[] = [];
  page.on("request", request => { if (request.method() !== "GET" || request.url().includes("/api/")) mutations.push(request.url()); });
  for (const name of ["Continue with Google", "Continue with BankID", "Forgot password?"]) {
    const button = page.getByRole("button", { name, exact: true });
    await button.scrollIntoViewIfNeeded();
    const before = await button.boundingBox();
    await button.hover();
    await expect.poll(() => opacity(button)).toBe("1");
    expect(await button.boundingBox()).toEqual(before);
    await button.click();
    await page.mouse.move(0, 0);
    await expect(button).toHaveAttribute("data-active", "true");
    await expect.poll(() => opacity(button)).toBe("1");
    await expect(button).toHaveAttribute("data-active", "false");
  }
  const back = page.getByRole("link", { name: "Back", exact: true });
  await back.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect.poll(() => opacity(back)).toBe("1");
  await page.screenshot({ path: info.outputPath("sign-in-underline.png"), fullPage: true });
  expect(mutations).toEqual([]);
});

test("mobile touch, RTL and reduced motion retain usable text feedback", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem("bluemind-language", "ar"));
  await page.goto((test.info().project.use.baseURL as string) + "/sign-in");
  const button = page.locator('button[type="submit"]');
  const before = await button.boundingBox();
  await button.tap();
  await expect.poll(() => opacity(button)).toBe("1");
  expect(await button.boundingBox()).toEqual(before);
  const duration = await button.locator("[data-text-action-label]").evaluate(element => getComputedStyle(element, "::after").transitionDuration);
  expect(duration).toBe("0s");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});
