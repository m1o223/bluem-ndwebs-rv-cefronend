import { expect, test, type Page } from "@playwright/test";

type Event = { type: string; text?: string; code?: string };
type Stream = {
  controller?: ReadableStreamDefaultController<Uint8Array>; signal?: AbortSignal | null;
  messages: { role: string; content: string }[]; aborts: number; cancels: number; closed: boolean;
  release?: () => void;
};
type Harness = {
  streams: Stream[]; deferHeaders: boolean;
  emit: (index: number, events: Event[], close?: boolean) => boolean;
  fail: (index: number) => void;
};
declare global { interface Window { controlTest: Harness } }

const input = (page: Page) => page.getByRole("textbox", { name: "Message", exact: true });
const answer = (page: Page) => page.getByLabel("BlueMind AI response", { exact: true });
const stop = (page: Page) => page.getByRole("button", { name: "Stop response", exact: true });
const sendButton = (page: Page) => page.getByRole("button", { name: "Send message", exact: true });
const instant = (page: Page) => page.getByRole("button", { name: "Show instantly", exact: true });
async function send(page: Page, value = "Make a plan") { await input(page).fill(value); await input(page).press("Enter"); }
async function emit(page: Page, index: number, text: string, done = false) {
  return page.evaluate(({ index, text, done }) => window.controlTest.emit(index,
    [{ type: "delta", text }, ...(done ? [{ type: "done" }] : [])], done), { index, text, done });
}
async function calls(page: Page, count: number) { await expect.poll(() => page.evaluate(() => window.controlTest.streams.length)).toBe(count); }
async function open(page: Page) {
  await page.addInitScript(() => {
    const original = window.fetch;
    const encoder = new TextEncoder();
    const harness: Harness = {
      streams: [], deferHeaders: false,
      emit(index, events, close = false) {
        const stream = this.streams[index];
        if (!stream.controller || stream.closed) return false;
        stream.controller.enqueue(encoder.encode(events.map(event => JSON.stringify(event) + "\n").join("")));
        if (close) { stream.closed = true; stream.controller.close(); }
        return true;
      },
      fail(index) { const stream = this.streams[index]; stream.closed = true; stream.controller?.error(new Error("Network interrupted")); },
    };
    window.controlTest = harness;
    window.fetch = async (...args) => {
      if (args[0] !== "/api/ai/chat") return original(...args);
      const stream: Stream = { signal: args[1]?.signal, messages: JSON.parse(String(args[1]?.body)).messages, aborts: 0, cancels: 0, closed: false };
      harness.streams.push(stream);
      stream.signal?.addEventListener("abort", () => { stream.aborts++; }, { once: true });
      // Deliberately do not cancel here: the client must also cancel its stream reader.
      const body = new ReadableStream<Uint8Array>({
        start(controller) { stream.controller = controller; },
        cancel() { stream.closed = true; stream.cancels++; },
      });
      if (harness.deferHeaders) { harness.deferHeaders = false; await new Promise<void>(resolve => { stream.release = resolve; }); }
      return new Response(body, { headers: { "Content-Type": "application/x-ndjson" } });
    };
  });
  await page.goto("/ask-ai");
}

for (const width of [320, 375, 768, 1440]) {
  test(`Show instantly never aborts and all later chunks remain immediate at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page);
    const idleBox = await sendButton(page).boundingBox();
    await input(page).fill("Make a plan");
    await sendButton(page).evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
    await calls(page, 1);
    await expect(stop(page)).toBeEnabled();
    expect((await stop(page).boundingBox())?.width).toBe(idleBox?.width);
    expect((await stop(page).boundingBox())?.height).toBe(idleBox?.height);
    await expect(stop(page)).toHaveCSS("border-radius", "50%");
    await input(page).fill("Unsent follow-up");
    await input(page).press("Enter");
    await calls(page, 1);
    const first = "## Website plan\n\n" + "Clear requirements. ".repeat(50);
    await emit(page, 0, first);
    await instant(page).evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
    await expect(answer(page).getByRole("heading")).toHaveText("Website plan");
    await expect(answer(page).locator("p")).toHaveText("Clear requirements. ".repeat(50).trim());
    await expect(answer(page)).toContainText("Showing new text as it arrives...");
    await expect(stop(page)).toBeEnabled();
    expect(await page.evaluate(() => window.controlTest.streams[0].aborts)).toBe(0);
    expect(await page.evaluate(() => window.controlTest.streams[0].cancels)).toBe(0);
    await page.waitForTimeout(250);
    await emit(page, 0, "\n\n**Next arrival**");
    await expect(answer(page).locator("strong")).toHaveText("Next arrival");
    await expect(instant(page)).toHaveCount(0);
    await expect(stop(page)).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath("streaming-controls.png") });
    await emit(page, 0, '\n\n```js\nconst complete = true;\n```\n\nFinal words.', true);
    await expect(answer(page).locator("pre code")).toHaveText("const complete = true;\n");
    await expect(answer(page)).toContainText("Final words.");
    await expect(answer(page).getByRole("group", { name: "Response actions" })).toBeVisible();
    await expect(stop(page)).toHaveCount(0);
    await expect(sendButton(page)).toBeEnabled();
    await expect(input(page)).toHaveValue("Unsent follow-up");
    expect(await page.evaluate(() => window.controlTest.streams[0].aborts)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`Stop freezes received text, preserves the draft and allows a new request at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page); await send(page); await calls(page, 1);
    const partial = "## Received response\n\n" + "Keep this paragraph. ".repeat(40);
    await emit(page, 0, partial);
    await expect(instant(page)).toBeVisible();
    await input(page).fill("Continue with a new answer");
    await stop(page).evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
    await expect(answer(page)).toContainText("Response stopped");
    await expect(answer(page).locator("p")).toHaveText("Keep this paragraph. ".repeat(40).trim());
    await expect(instant(page)).toHaveCount(0);
    await expect(sendButton(page)).toBeEnabled();
    await expect(input(page)).toHaveValue("Continue with a new answer");
    expect(await page.evaluate(() => window.controlTest.streams[0].signal?.aborted)).toBe(true);
    expect(await page.evaluate(() => window.controlTest.streams[0].cancels)).toBe(1);
    expect(await emit(page, 0, "Late chunk must not appear", true)).toBe(false);
    const frozen = await answer(page).innerText();
    await page.waitForTimeout(200);
    expect(await answer(page).innerText()).toBe(frozen);
    await calls(page, 1);
    await sendButton(page).click();
    await calls(page, 2);
    await expect(stop(page)).toBeEnabled();
    expect(await page.evaluate(() => window.controlTest.streams[1].messages[1])).toEqual({ role: "assistant", content: partial });
    await expect(answer(page).first()).toHaveAttribute("aria-busy", "false");
    await emit(page, 1, "New response succeeds.", true);
    await expect(answer(page).last()).toContainText("New response succeeds.");
    await expect(stop(page)).toHaveCount(0);
    await expect(answer(page).last().getByRole("group", { name: "Response actions" })).toBeVisible();
  });
}

test("Stop before response headers ignores the old request when a new one starts", async ({ page }) => {
  await open(page);
  await page.evaluate(() => { window.controlTest.deferHeaders = true; });
  await send(page); await calls(page, 1);
  await stop(page).click();
  await expect(answer(page)).toHaveCount(0);
  await send(page, "Fresh request"); await calls(page, 2);
  await page.evaluate(() => { window.controlTest.emit(0, [{ type: "delta", text: "Stale response" }, { type: "done" }]); window.controlTest.streams[0].release?.(); });
  await expect(stop(page)).toBeEnabled();
  await page.waitForTimeout(100);
  await expect(answer(page)).toHaveCount(0);
  await emit(page, 1, "Only the fresh response.", true);
  await expect(answer(page)).toContainText("Only the fresh response.");
  await expect(answer(page)).not.toContainText("Stale response");
  await expect(stop(page)).toHaveCount(0);
});

test("Stop keeps partial regeneration instead of restoring the old response", async ({ page }) => {
  await open(page); await send(page); await calls(page, 1);
  await emit(page, 0, "Original complete response.", true);
  await answer(page).getByRole("button", { name: "Regenerate response" }).click();
  await calls(page, 2);
  await emit(page, 1, "Partial regenerated response.");
  await expect(answer(page)).toContainText("Partial regenerated response.");
  await stop(page).click();
  await expect(answer(page)).toHaveCount(1);
  await expect(answer(page)).toContainText("Partial regenerated response.");
  await expect(answer(page)).not.toContainText("Original complete response.");
  await expect(answer(page)).toContainText("Response stopped");
});

test("switching conversations aborts the active stream without contaminating the new conversation", async ({ page }) => {
  await open(page); await send(page, "First conversation"); await calls(page, 1);
  await emit(page, 0, "Partial first answer.");
  await instant(page).click();
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  expect(await page.evaluate(() => window.controlTest.streams[0].signal?.aborted)).toBe(true);
  await expect(stop(page)).toHaveCount(0);
  await send(page, "Second conversation"); await calls(page, 2);
  expect(await emit(page, 0, "Late first answer", true)).toBe(false);
  await emit(page, 1, "Second answer.", true);
  await expect(answer(page)).toContainText("Second answer.");
  await expect(answer(page)).not.toContainText("Partial first answer.");
  await page.getByRole("button", { name: "First conversation", exact: true }).click();
  await expect(answer(page)).toContainText("Partial first answer.");
  await expect(answer(page)).not.toContainText("Late first answer");
});

test("network failure restores Send and Retry completes normally", async ({ page }) => {
  await open(page); await send(page); await calls(page, 1);
  await emit(page, 0, "Partial answer.");
  await page.evaluate(() => window.controlTest.fail(0));
  await expect(page.getByRole("button", { name: "Retry", exact: true })).toBeVisible();
  await expect(stop(page)).toHaveCount(0);
  await expect(sendButton(page)).toBeVisible();
  await page.getByRole("button", { name: "Retry", exact: true }).click(); await calls(page, 2);
  await emit(page, 1, "Recovered answer.", true);
  await expect(answer(page)).toContainText("Recovered answer.");
  await expect(stop(page)).toHaveCount(0);
});

test("timeout cancels the reader and does not leave Stop stuck", async ({ page }) => {
  await page.clock.install();
  await open(page); await send(page); await calls(page, 1);
  await page.clock.fastForward(65001);
  await expect(page.getByText("The response took too long. Please try again.")).toBeVisible();
  await expect(stop(page)).toHaveCount(0);
  expect(await page.evaluate(() => window.controlTest.streams[0].signal?.aborted)).toBe(true);
  expect(await page.evaluate(() => window.controlTest.streams[0].cancels)).toBe(1);
});
