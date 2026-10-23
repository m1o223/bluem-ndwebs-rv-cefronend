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
    await expect(answer(page)).not.toContainText("Showing new text as it arrives...");
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

  test(`Stop freezes only visible text, preserves the draft and allows a new request at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page); await send(page); await calls(page, 1);
    const partial = "Keep this paragraph. ".repeat(400);
    await emit(page, 0, partial);
    await expect(instant(page)).toBeVisible();
    await input(page).fill("Continue with a new answer");
    await expect.poll(() => answer(page).locator("p").textContent()).not.toBe("");
    const visible = await stop(page).evaluate(button => {
      const text = document.querySelector('[aria-label="BlueMind AI response"] p')!.textContent!;
      (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click();
      return text;
    });
    expect(visible.length).toBeLessThan(partial.length);
    await expect(answer(page)).toHaveText(visible.trim());
    await expect(answer(page).locator("small, [role=status]")).toHaveCount(0);
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
    expect(await page.evaluate(() => window.controlTest.streams[1].messages[1])).toEqual({ role: "assistant", content: visible.trim() });
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
  await expect(answer(page).locator("small, [role=status]")).toHaveCount(0);
});

test("switching conversations aborts the active stream without contaminating the new conversation", async ({ page }) => {
  await open(page); await send(page, "First conversation"); await calls(page, 1);
  await emit(page, 0, "Partial first answer. ".repeat(30));
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

const thinking = (page: Page) => page.getByRole("status", { name: "BlueMind AI is preparing a response", exact: true });

for (const width of [320, 375, 768, 1440]) {
  test(`one stationary black thinking dot hands off to text at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page);
    await page.evaluate(() => {
      Object.assign(window, { thinkingOverlap: false });
      new MutationObserver(() => {
        if (document.querySelector('[aria-label="BlueMind AI is preparing a response"]')
          && document.querySelector('[aria-label="BlueMind AI response"]')) Object.assign(window, { thinkingOverlap: true });
      }).observe(document.body, { childList: true, subtree: true });
    });
    await send(page); await calls(page, 1);
    await expect(thinking(page)).toHaveCount(1);
    await expect(thinking(page)).toBeInViewport();
    await expect(thinking(page)).toHaveText("");
    await expect(thinking(page)).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(thinking(page)).toHaveCSS("border-top-width", "0px");
    await expect(thinking(page)).toHaveCSS("box-shadow", "none");
    await expect(thinking(page)).toHaveCSS("animation-name", "none");
    await expect(answer(page)).toHaveCount(0);
    const dot = thinking(page).locator("span");
    await expect(dot).toHaveCount(1);
    const size = width < 768 ? "15px" : "18px";
    await expect(dot).toHaveCSS("width", size);
    await expect(dot).toHaveCSS("height", size);
    await expect(dot).toHaveCSS("border-radius", "50%");
    await expect(dot).toHaveCSS("background-color", "rgb(0, 0, 0)");
    await expect(dot).toHaveCSS("animation-duration", "1.2s");
    await expect(dot).toHaveCSS("animation-iteration-count", "infinite");
    const frames = await dot.evaluate(element => (element.getAnimations()[0].effect as KeyframeEffect).getKeyframes().map(frame => frame.transform));
    expect(frames).toEqual(["scale(0.9)", "scale(1)", "scale(0.9)"]);
    const left = await thinking(page).evaluate(element => element.getBoundingClientRect().left + parseFloat(getComputedStyle(element).paddingLeft));
    await page.screenshot({ path: testInfo.outputPath("thinking-dot.png") });
    await expect(stop(page)).toBeEnabled();
    await emit(page, 0, "First content. ".repeat(30));
    await expect(thinking(page)).toHaveCount(0);
    await expect(instant(page)).toBeVisible();
    expect(await answer(page).locator("p").evaluate(element => element.getBoundingClientRect().left)).toBeCloseTo(left, 1);
    expect(await page.evaluate(() => (window as unknown as { thinkingOverlap: boolean }).thinkingOverlap)).toBe(false);
    await instant(page).click();
    await expect(page.getByText(/BlueMind AI is (thinking|responding)|Generating response|Showing new text as it arrives/)).toHaveCount(0);
    await page.waitForTimeout(200);
    await expect(thinking(page)).toHaveCount(0);
    await emit(page, 0, "\n\n**Last content.**", true);
    await expect(answer(page).locator("strong")).toHaveText("Last content.");
    await expect(stop(page)).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("thinking dot clears on Stop and errors, reappears for Retry and handles instant completion", async ({ page }) => {
  await open(page); await send(page); await calls(page, 1);
  await expect(thinking(page)).toBeVisible();
  await stop(page).click();
  await expect(thinking(page)).toHaveCount(0);
  await expect(answer(page)).toHaveCount(0);
  await send(page, "Try again"); await calls(page, 2);
  await expect(thinking(page)).toBeVisible();
  await page.evaluate(() => window.controlTest.fail(1));
  await expect(thinking(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Retry", exact: true }).click(); await calls(page, 3);
  await expect(thinking(page)).toBeVisible();
  await emit(page, 2, "Completed without delay.", true);
  await expect(answer(page)).toContainText("Completed without delay.");
  await expect(thinking(page)).toHaveCount(0);
});

test("regeneration uses the same response position and Stop restores the unchanged answer", async ({ page }) => {
  await open(page); await send(page); await calls(page, 1);
  await emit(page, 0, "Original complete answer.", true);
  await answer(page).getByRole("button", { name: "Regenerate response" }).click(); await calls(page, 2);
  await expect(thinking(page)).toBeVisible();
  await expect(answer(page)).toHaveCount(0);
  await stop(page).click();
  await expect(thinking(page)).toHaveCount(0);
  await expect(answer(page)).toContainText("Original complete answer.");
  await answer(page).getByRole("button", { name: "Regenerate response" }).click(); await calls(page, 3);
  await expect(thinking(page)).toBeVisible();
  await emit(page, 2, "Regenerated answer.", true);
  await expect(answer(page)).toContainText("Regenerated answer.");
  await expect(thinking(page)).toHaveCount(0);
});

test("switching conversations removes the dot and cancels its handoff timer", async ({ page }) => {
  await open(page); await send(page, "First chat"); await calls(page, 1);
  await emit(page, 0, "First partial content.");
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  await expect(thinking(page)).toHaveCount(0);
  await send(page, "Second chat"); await calls(page, 2);
  await page.waitForTimeout(250);
  await expect(thinking(page)).toBeVisible();
  await expect(answer(page)).toHaveCount(0);
  await emit(page, 1, "Second conversation answer.", true);
  await expect(thinking(page)).toHaveCount(0);
  await expect(answer(page)).toContainText("Second conversation answer.");
});

test("reduced motion keeps a static black dot and displays the first content without animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page); await send(page); await calls(page, 1);
  await expect(thinking(page).locator("span")).toHaveCSS("animation-name", "none");
  await expect(thinking(page).locator("span")).toHaveCSS("opacity", "1");
  await emit(page, 0, "First accessible response.");
  await expect(thinking(page)).toHaveCount(0);
  await expect(answer(page)).toHaveText("First accessible response.");
  await stop(page).click();
});

test("fast completed responses stay buffered behind the dot for 5.5 seconds without delaying the API", async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page); await send(page); await calls(page, 1);
  await emit(page, 0, "A fast, complete response.", true);
  await expect.poll(() => page.evaluate(() => window.controlTest.streams[0].closed)).toBe(true);
  await page.clock.runFor(4800);
  await expect(thinking(page)).toBeVisible();
  await expect(answer(page)).toHaveCount(0);
  await expect(stop(page)).toBeEnabled();
  expect(await page.evaluate(() => window.controlTest.streams[0].aborts)).toBe(0);
  await page.clock.runFor(900);
  await expect(answer(page)).toHaveText("A fast, complete response.");
  await expect(stop(page)).toHaveCount(0);
  await expect(answer(page).locator("small, [role=status]")).toHaveCount(0);
});

for (const done of [false, true]) test(`Stop during thinking discards all hidden buffered text (network complete: ${done})`, async ({ page }) => {
  await page.clock.install();
  await open(page); await send(page); await calls(page, 1);
  await emit(page, 0, "This hidden answer must never appear.", done);
  await expect(thinking(page)).toBeVisible();
  await expect(answer(page)).toHaveCount(0);
  await stop(page).click();
  await expect(stop(page)).toHaveCount(0);
  await expect(thinking(page)).toHaveCount(0);
  expect(await page.evaluate(() => window.controlTest.streams[0].signal?.aborted)).toBe(true);
  await page.clock.runFor(8000);
  await expect(answer(page)).toHaveCount(0);
  await send(page, "A fresh question"); await calls(page, 2);
  expect(await page.evaluate(() => window.controlTest.streams[1].messages.some(message => message.role === "assistant"))).toBe(false);
  await emit(page, 1, "A fresh answer.", true);
  await page.clock.runFor(5800);
  await page.clock.runFor(1000);
  await expect(answer(page)).toHaveText("A fresh answer.");
});

test("Stop remains available after the network ends and cancels queued visual rendering exactly", async ({ page }) => {
  await page.clock.install();
  await open(page); await send(page); await calls(page, 1);
  const full = "A useful recommendation. ".repeat(400);
  await emit(page, 0, full, true);
  await page.clock.runFor(5700);
  await page.clock.runFor(300);
  await expect(instant(page)).toBeVisible();
  await expect(answer(page).locator("p")).toBeVisible();
  const visible = await stop(page).evaluate(button => {
    const text = document.querySelector('[aria-label="BlueMind AI response"] p')!.textContent!;
    (button as HTMLButtonElement).click();
    return text;
  });
  expect(visible.length).toBeGreaterThan(0);
  expect(visible.length).toBeLessThan(full.length);
  await expect(answer(page)).toHaveText(visible.trim());
  await expect(sendButton(page)).toBeVisible();
  await page.clock.runFor(20000);
  await expect(answer(page)).toHaveText(visible.trim());
  await expect(instant(page)).toHaveCount(0);
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  await page.getByRole("button", { name: "Make a plan", exact: true }).click();
  await expect(answer(page)).toHaveText(visible.trim());
});
