import { expect, test } from "@playwright/test";

for (const width of [320, 375, 768, 1440]) {
  test(`assistant responses are borderless without changing user bubbles at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 850 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/ai/chat", route => route.fulfill({
      contentType: "application/x-ndjson",
      body: JSON.stringify({ type: "delta", text: "## Website plan\n\nStart with **clear goals**.\n\n- Design\n- Develop\n\n```js\nconst ready = true;\n```" }) + '\n{"type":"done"}\n',
    }));
    await page.goto("/ask-ai");
    const input = page.getByRole("textbox", { name: "Message", exact: true });
    await input.fill("Plan my website");
    await input.press("Enter");
    const answer = page.getByLabel("BlueMind AI response", { exact: true });
    const actions = answer.getByRole("group", { name: "Response actions" });
    await expect(actions).toBeVisible();
    await expect(actions.getByRole("button")).toHaveCount(5);
    await expect(answer).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    for (const side of ["top", "right", "bottom", "left"]) {
      await expect(answer).toHaveCSS(`border-${side}-width`, "0px");
    }
    await expect(answer).toHaveCSS("box-shadow", "none");
    await expect(answer).toHaveCSS("outline-style", "none");
    await expect(answer).toHaveCSS("padding", width < 768 ? "16px" : "20px 24px");
    await expect(answer.getByRole("heading", { name: "Website plan" })).toBeVisible();
    await expect(answer.locator("strong")).toHaveText("clear goals");
    await expect(answer.getByRole("listitem")).toHaveCount(2);
    await expect(answer.locator("pre")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const user = page.getByLabel("Your message", { exact: true });
    await expect(user).toHaveCSS("background-color", "rgb(237, 243, 250)");
    await expect(user).toHaveCSS("border-radius", "8px");
    await expect(user.getByRole("group", { name: "Response actions" })).toHaveCount(0);
    await actions.getByRole("button", { name: "Like response", exact: true }).focus();
    await expect(actions.getByRole("button", { name: "Like response", exact: true })).toHaveCSS("outline-style", "solid");
    expect(await answer.evaluate(el => el.getBoundingClientRect().width)).toBeLessThanOrEqual(800);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(input).toBeInViewport();
    await page.screenshot({ path: testInfo.outputPath("borderless.png") });
  });
}
