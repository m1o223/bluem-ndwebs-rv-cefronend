import { expect, test, type Page, type Route } from "@playwright/test";

const response = "## A useful plan\n\nStart with **clear goals**.\n\n- Design\n- Develop\n\n```js\nconst ready = true;\n```";
const answers = (page: Page) => page.getByLabel("BlueMind AI response", { exact: true });
const input = (page: Page) => page.getByRole("textbox", { name: "Message", exact: true });
const actions = (page: Page) => page.getByRole("group", { name: "Response actions", exact: true });
const body = (text: string) => JSON.stringify({ type: "delta", text }) + '\n{"type":"done"}\n';
const fulfill = (route: Route, text: string) => route.fulfill({ contentType: "application/x-ndjson", body: body(text) });
async function send(page: Page, text = "Plan my website") {
  await input(page).fill(text); await input(page).press("Enter");
}
async function open(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ask-ai");
}

for (const width of [320, 375, 768, 1440]) test(`five accessible actions and exclusive feedback at ${width}px`, async ({ page, context }, testInfo) => {
  await page.setViewportSize({ width, height: 850 });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() => Object.defineProperty(navigator, "share", { configurable: true, value: undefined }));
  const calls: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/")) calls.push(request.url()); });
  await page.route("**/api/ai/chat", route => fulfill(route, response));
  await open(page); await send(page);
  await expect(actions(page)).toBeVisible();
  await expect(actions(page).getByRole("button")).toHaveCount(5);
  await expect(page.getByLabel("Your message", { exact: true }).getByRole("button")).toHaveCount(0);
  const like = actions(page).getByRole("button", { name: "Like response", exact: true });
  const dislike = actions(page).getByRole("button", { name: "Dislike response", exact: true });
  await like.click(); await expect(like).toHaveAttribute("aria-pressed", "true");
  await dislike.click(); await expect(dislike).toHaveAttribute("aria-pressed", "true");
  await expect(like).toHaveAttribute("aria-pressed", "false");
  await dislike.click(); await expect(dislike).toHaveAttribute("aria-pressed", "false");
  await like.focus(); await page.keyboard.press("Enter");
  await expect(like).toHaveAttribute("aria-pressed", "true");
  expect(await like.evaluate(el => getComputedStyle(el, "::after").content)).toBe('"Like"');
  await actions(page).getByRole("button", { name: "Copy response" }).click();
  await expect(answers(page).getByRole("status")).toHaveText("Copied!");
  expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n")).toBe(response);
  await expect(answers(page).getByRole("status")).toBeEmpty({ timeout: 4000 });
  await actions(page).getByRole("button", { name: "Share response" }).click();
  await expect(answers(page).getByRole("status")).toHaveText("Response copied for sharing.");
  expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n")).toBe(response);
  if (width < 768) await page.getByRole("button", { name: "Open sidebar", exact: true }).click();
  await page.getByRole("button", { name: "New chat", exact: true }).filter({ visible: true }).click();
  await expect(actions(page)).toHaveCount(0);
  if (width < 768) await page.getByRole("button", { name: "Open sidebar", exact: true }).click();
  await page.getByRole("button", { name: "Plan my website", exact: true }).filter({ visible: true }).click();
  await expect(like).toHaveAttribute("aria-pressed", "true");
  expect(calls).toHaveLength(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(input(page)).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath("actions.png") });
});

test("native share receives only the full answer; cancellation never copies", async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, { shared: [], copied: [], cancelShare: false });
    const state = window as unknown as { shared: ShareData[]; copied: string[]; cancelShare: boolean };
    Object.defineProperty(navigator, "share", { value: async (data: ShareData) => {
      if (state.cancelShare) throw new DOMException("Cancelled", "AbortError");
      state.shared.push(data);
    } });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text: string) => { state.copied.push(text); } } });
  });
  await page.route("**/api/ai/chat", route => fulfill(route, response));
  await open(page); await send(page);
  await actions(page).getByRole("button", { name: "Share response" }).click();
  expect(await page.evaluate(() => (window as unknown as { shared: ShareData[] }).shared)).toEqual([{ title: "BlueMind AI response", text: response }]);
  await page.evaluate(() => { (window as unknown as { cancelShare: boolean }).cancelShare = true; });
  await actions(page).getByRole("button", { name: "Share response" }).click();
  expect(await page.evaluate(() => (window as unknown as { copied: string[] }).copied)).toEqual([]);
  await expect(answers(page).getByRole("status")).toBeEmpty();
});

test("share permission failure falls back to clipboard and clipboard errors are honest", async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, { copied: "", denyCopy: false });
    const state = window as unknown as { copied: string; denyCopy: boolean };
    Object.defineProperty(navigator, "share", { value: async () => { throw new DOMException("Blocked", "NotAllowedError"); } });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text: string) => {
      if (state.denyCopy) throw new DOMException("Blocked", "NotAllowedError");
      state.copied = text;
    } } });
  });
  await page.route("**/api/ai/chat", route => fulfill(route, response));
  await open(page); await send(page);
  await actions(page).getByRole("button", { name: "Share response" }).click();
  expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toBe(response);
  await page.evaluate(() => { (window as unknown as { denyCopy: boolean }).denyCopy = true; });
  await actions(page).getByRole("button", { name: "Copy response" }).click();
  await expect(answers(page).getByRole("status")).toHaveText("Could not copy. Please select and copy the response.");
  await expect(actions(page).getByRole("button", { name: "Copy response" })).toBeEnabled();
});

test("regenerating an older answer uses its original context and preserves later messages", async ({ page }) => {
  const contexts: { role: string; content: string }[][] = [];
  await page.route("**/api/ai/chat", route => {
    contexts.push(route.request().postDataJSON().messages);
    return fulfill(route, ["Original answer", "Follow-up answer", "Replacement answer", "Final answer"][contexts.length - 1]);
  });
  await open(page); await send(page, "First question");
  await expect(actions(page)).toHaveCount(1);
  await actions(page).getByRole("button", { name: "Like response", exact: true }).click();
  await send(page, "Follow-up question");
  await expect(actions(page)).toHaveCount(2);
  await actions(page).first().getByRole("button", { name: "Regenerate response" }).click();
  await expect(answers(page).first()).toContainText("Replacement answer");
  await expect(answers(page).last()).toContainText("Follow-up answer");
  await expect(page.getByLabel("Your message", { exact: true })).toHaveCount(2);
  expect(contexts[2]).toEqual([{ role: "user", content: "First question" }]);
  await expect(actions(page).first().getByRole("button", { name: "Like response", exact: true })).toHaveAttribute("aria-pressed", "false");
  await send(page, "Last question");
  await expect(answers(page)).toHaveCount(3);
  expect(contexts[3].map(turn => turn.content)).toEqual(["First question", "Replacement answer", "Follow-up question", "Follow-up answer", "Last question"]);
});

test("failed partial regeneration restores the answer and Retry targets the same older turn", async ({ page }) => {
  const contexts: { role: string; content: string }[][] = [];
  await page.route("**/api/ai/chat", route => {
    contexts.push(route.request().postDataJSON().messages);
    if (contexts.length === 3) return route.fulfill({ contentType: "application/x-ndjson", body: '{"type":"delta","text":"Partial replacement"}\n{"type":"error","code":"failed"}\n' });
    return fulfill(route, ["Original answer", "Later answer", "", "Recovered answer"][contexts.length - 1]);
  });
  await open(page); await send(page, "First question"); await expect(actions(page)).toHaveCount(1);
  await send(page, "Later question"); await expect(actions(page)).toHaveCount(2);
  await actions(page).first().getByRole("button", { name: "Regenerate response" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "We could not complete" })).toBeVisible();
  await expect(answers(page).first()).toContainText("Original answer");
  await expect(answers(page).last()).toContainText("Later answer");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(answers(page).first()).toContainText("Recovered answer");
  await expect(page.getByRole("alert").filter({ hasText: "We could not complete" })).toHaveCount(0);
  expect(contexts[3]).toEqual(contexts[2]);
  await expect(answers(page)).toHaveCount(2);
});

test("actions wait for streaming; regenerate is locked and cancelled replacement restores history", async ({ page }) => {
  await page.addInitScript(() => {
    let calls = 0;
    const original = window.fetch;
    window.fetch = async (...args) => {
      if (args[0] !== "/api/ai/chat") return original(...args);
      calls++;
      Object.assign(window, { actionTestCalls: calls });
      if (calls === 1) return new Response('{"type":"delta","text":"Original answer"}\n{"type":"done"}\n', { headers: { "Content-Type": "application/x-ndjson" } });
      return new Response(new ReadableStream({ start(controller) {
        controller.enqueue(new TextEncoder().encode('{"type":"delta","text":"Replacement in progress"}\n'));
        args[1]?.signal?.addEventListener("abort", () => controller.error(new DOMException("Aborted", "AbortError")), { once: true });
      } }), { headers: { "Content-Type": "application/x-ndjson" } });
    };
  });
  await open(page); await send(page);
  await expect(actions(page)).toBeVisible();
  await actions(page).getByRole("button", { name: "Regenerate response" }).evaluate(button => {
    (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click();
  });
  await expect(answers(page)).toContainText("Replacement in progress");
  await expect(actions(page)).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { actionTestCalls: number }).actionTestCalls)).toBe(2);
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  await page.getByRole("button", { name: "Plan my website", exact: true }).click();
  await expect(answers(page)).toContainText("Original answer");
  await expect(actions(page)).toHaveCount(1);
});

test("Regenerate is disabled on completed answers while another request is running", async ({ page }) => {
  let calls = 0;
  let release: () => void = () => {};
  const waiting = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/ai/chat", async route => {
    calls++;
    if (calls === 2) await waiting;
    await fulfill(route, "Completed answer");
  });
  await open(page); await send(page); await expect(actions(page)).toHaveCount(1);
  await send(page, "Second question");
  await expect(actions(page).getByRole("button", { name: "Regenerate response" })).toBeDisabled();
  release();
  await expect(actions(page)).toHaveCount(2);
  await expect(actions(page).first().getByRole("button", { name: "Regenerate response" })).toBeEnabled();
});

test("toolbar waits for progressive text to finish without changing instant reveal", async ({ page }) => {
  await page.route("**/api/ai/chat", route => fulfill(route, "A complete response. ".repeat(100)));
  await page.goto("/ask-ai"); await send(page);
  await expect(page.getByRole("button", { name: "Show instantly" })).toBeVisible();
  await expect(actions(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Show instantly" }).click();
  await expect(actions(page)).toHaveCount(1);
});
