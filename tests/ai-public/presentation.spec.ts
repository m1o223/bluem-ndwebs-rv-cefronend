import { expect, test, type Page } from "@playwright/test";

const markdown = '# Website plan\n\nA **clear** introduction with [a reference](https://example.com).\n\n## Essentials\n\n- Fast pages\n- Accessible navigation\n\n1. Plan\n2. Build\n\n```js\nconst site = "BlueMind";\n```\n\n> Keep it simple.\n\n' + 'A readable paragraph about the website. '.repeat(25);
const answer = (page: Page) => page.getByLabel("BlueMind AI response", { exact: true });
const input = (page: Page) => page.getByRole("textbox", { name: "Message", exact: true });

async function fixture(page: Page, text: string) {
  await page.route("**/api/ai/chat", route => route.fulfill({ contentType: "application/x-ndjson", body:
    JSON.stringify({ type: "delta", text }) + '\n{"type":"done"}\n' }));
  await page.goto("/ask-ai");
  await input(page).fill("Make a plan");
  await input(page).press("Enter");
}

test("burst response is paced independently, instantly revealed, and keeps full follow-up context", async ({ page }) => {
  await fixture(page, markdown);
  await expect(page.getByRole("button", { name: "Show instantly" })).toBeVisible();
  await expect(page.getByText("BlueMind AI is responding...")).toHaveCount(0);
  expect((await answer(page).innerText()).length).toBeLessThan(markdown.length);
  const first = (await answer(page).innerText()).length;
  await expect.poll(async () => (await answer(page).innerText()).length).toBeGreaterThan(first);
  await page.getByRole("button", { name: "Show instantly" }).click();
  await expect(answer(page).getByRole("heading", { name: "Website plan" })).toBeVisible();
  await expect(answer(page).locator("strong")).toHaveText("clear");
  await expect(answer(page).locator("ul li")).toHaveCount(2);
  await expect(answer(page).locator("ol li")).toHaveCount(2);
  await expect(answer(page).locator("pre code")).toContainText('const site = "BlueMind";');
  await expect(answer(page).getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByRole("button", { name: "Show instantly" })).toHaveCount(0);
  let context: { content: string }[] = [];
  await page.route("**/api/ai/chat", route => {
    context = route.request().postDataJSON().messages;
    return route.fulfill({ contentType: "application/x-ndjson", body: '{"type":"delta","text":"Follow-up fixture"}\n{"type":"done"}\n' });
  });
  await input(page).fill("Follow up"); await input(page).press("Enter");
  await expect(answer(page)).toHaveCount(2);
  expect(context[1].content).toBe(markdown);
});

test("delayed stream keeps receiving after instant reveal without restarting animation", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeFetch = window.fetch;
    window.fetch = async (...args) => {
      if (args[0] !== "/api/ai/chat") return nativeFetch(...args);
      const encoder = new TextEncoder();
      const body = new ReadableStream({ start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ type: "delta", text: "First streamed paragraph. ".repeat(25) }) + "\n"));
        setTimeout(() => {
          controller.enqueue(encoder.encode(JSON.stringify({ type: "delta", text: "\n\n**Final streamed words**" }) + '\n{"type":"done"}\n'));
          controller.close();
        }, 7000);
      } });
      return new Response(body, { headers: { "Content-Type": "application/x-ndjson" } });
    };
  });
  await page.goto("/ask-ai");
  await input(page).fill("Stream"); await input(page).press("Enter");
  await expect(page.getByRole("button", { name: "Stop response", exact: true })).toBeVisible();
  await expect(page.getByText("BlueMind AI is responding...")).toHaveCount(0);
  await page.getByRole("button", { name: "Show instantly" }).click();
  await expect(answer(page).locator("strong")).toHaveText("Final streamed words");
  await expect(page.getByText("BlueMind AI is responding...")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Show instantly" })).toHaveCount(0);
});

test("scroll follows presentation, stops on upward intent and resumes at the bottom", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 700 });
  await fixture(page, Array.from({ length: 120 }, (_, i) => `Paragraph ${i}: A useful website recommendation with comfortable spacing.\n\n`).join(""));
  const scroller = page.getByLabel("Chat messages", { exact: true });
  await expect.poll(() => scroller.evaluate(el => el.scrollTop)).toBeGreaterThan(200);
  await scroller.hover(); await page.mouse.wheel(0, -450);
  await page.waitForTimeout(200);
  const top = await scroller.evaluate(el => el.scrollTop);
  await page.waitForTimeout(500);
  expect(Math.abs(await scroller.evaluate(el => el.scrollTop) - top)).toBeLessThan(3);
  // Dispatch the programmatic scroll before a new typing frame changes the bottom.
  await scroller.evaluate(el => { el.scrollTop = el.scrollHeight; el.dispatchEvent(new Event("scroll")); });
  await expect.poll(() => scroller.evaluate(el => el.scrollHeight - el.scrollTop - el.clientHeight)).toBeLessThan(80);
  await page.getByRole("button", { name: "Show instantly" }).click();
  await expect.poll(() => scroller.evaluate(el => el.scrollHeight - el.scrollTop - el.clientHeight)).toBeLessThan(3);
  await expect(input(page)).toBeInViewport();
});

for (const width of [320, 375, 768, 1440]) test(`Markdown stays bounded at ${width}px; reduced motion skips pacing`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 850 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await fixture(page, markdown + '\n\n```txt\n' + 'long-code-line-'.repeat(100) + '\n```\n\n<script>window.injected = true</script>\n\n![not loaded](https://example.com/tracker.png)\n\n[Unsafe](javascript:alert(1))');
  await expect(answer(page).locator("pre")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Show instantly" })).toHaveCount(0);
  await expect(answer(page).locator("img, script, [href^='javascript:']")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.getByLabel("Chat messages", { exact: true }).evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await expect(input(page)).toBeInViewport();
  await input(page).fill("One\nTwo\nThree\nFour\nFive\nSix\nSeven\nEight\nNine\nTen");
  expect(await input(page).evaluate(el => el.clientHeight)).toBeLessThanOrEqual(180);
  await expect(input(page)).toBeInViewport();
  await page.getByLabel("Chat messages", { exact: true }).evaluate(el => { el.scrollTop = 0; });
  await page.screenshot({ path: testInfo.outputPath("markdown.png") });
  expect(errors).toEqual([]);
});

test("long reply finishes promptly, supports Unicode and does not replay from history", async ({ page }) => {
  test.setTimeout(30000);
  const text = "مرحبا 💙 Svenska och English. ".repeat(180);
  await fixture(page, text);
  await expect(page.getByRole("button", { name: "Show instantly" })).toBeVisible();
  await expect(answer(page)).toHaveText(text.trim(), { timeout: 12000 });
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  await expect(answer(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Make a plan", exact: true }).click();
  await expect(answer(page)).toHaveText(text.trim());
  await expect(page.getByRole("button", { name: "Show instantly" })).toHaveCount(0);
});

test("mobile touch intent pauses follow and a long response keeps typing responsive", async ({ page }) => {
  test.setTimeout(40000);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => {
    const durations: number[] = [];
    Object.assign(window, { presentationTasks: durations });
    new PerformanceObserver(list => durations.push(...list.getEntries().map(entry => entry.duration)))
      .observe({ type: "longtask", buffered: false });
  });
  await fixture(page, ("## Planning\n\nA **clear** design helps your visitors.\n\n- First priority\n- Second priority\n\n").repeat(100));
  const scroller = page.getByLabel("Chat messages", { exact: true });
  await expect.poll(() => scroller.evaluate(el => el.scrollTop)).toBeGreaterThan(150);
  await scroller.evaluate(el => {
    const touch = (clientY: number) => new Touch({ identifier: 1, target: el, clientY });
    el.dispatchEvent(new TouchEvent("touchstart", { touches: [touch(200)] }));
    el.dispatchEvent(new TouchEvent("touchmove", { touches: [touch(300)] }));
  });
  await scroller.evaluate(el => { el.scrollTop = 30; });
  await page.waitForTimeout(400);
  expect(await scroller.evaluate(el => el.scrollTop)).toBeLessThan(35);
  const start = Date.now();
  await input(page).fill("Draft while the response is appearing\nSecond line");
  await expect(input(page)).toHaveValue("Draft while the response is appearing\nSecond line");
  expect(Date.now() - start).toBeLessThan(1500);
  // This dense 100-section fixture also exceeds 15s on the unchanged production build.
  // Allow scheduling variance without relaxing typing latency or long-task assertions.
  await expect(page.getByRole("button", { name: "Show instantly" })).toHaveCount(0, { timeout: 25000 });
  const longest = await page.evaluate(() => Math.max(0, ...(window as unknown as { presentationTasks: number[] }).presentationTasks));
  expect(longest).toBeLessThan(500);
  await expect(input(page)).toBeInViewport();
});
