import { expect, test, type Page } from "@playwright/test";

const draft = { title: "Website inquiry", body: "Hello BlueMind,\n\nI would like a restaurant website with a menu and reservations.\n\nPlease let me know the next steps.\n\nThank you." };
const packet = (card = draft) => JSON.stringify({ type: "message_card", card }) + '\n{"type":"done"}\n';
const input = (page: Page) => page.getByRole("textbox", { name: "Message", exact: true });
const card = (page: Page) => page.getByRole("region", { name: "Message card", exact: true });
const actions = (page: Page) => card(page).getByRole("group", { name: "Message card actions" });
async function send(page: Page, text = "Draft an inquiry") { await input(page).fill(text); await input(page).press("Enter"); }
const editor = (page: Page) => page.getByRole("textbox", { name: "Message document", exact: true });
async function replaceDocument(page: Page, title: string, body: string) {
  await editor(page).click();
  await editor(page).press("ControlOrMeta+a");
  await editor(page).press("Backspace");
  const paragraphs = [title, ...body.split("\n\n")];
  for (let index = 0; index < paragraphs.length; index++) {
    if (index) await page.keyboard.press("Enter");
    await page.keyboard.insertText(paragraphs[index]);
  }
}
async function replaceTitle(page: Page, title: string) {
  await editor(page).press("ControlOrMeta+Home");
  await editor(page).press("Shift+End");
  await page.keyboard.insertText(title);
}
async function sidebar(page: Page) { if ((page.viewportSize()?.width ?? 1440) < 768) await page.getByRole("button", { name: "Open sidebar" }).click(); }

for (const width of [320, 375, 768, 1440]) for (const theme of ["light", "dark"] as const) {
  test(`Message Card edits, copy and history at ${width}px in ${theme}`, async ({ page, context }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => Object.defineProperty(navigator, "share", { configurable: true, value: undefined }));
    const requests: { messages: { role: string; content: string }[]; responseFormat: string }[] = [];
    await page.route("**/api/ai/chat", route => {
      requests.push(route.request().postDataJSON());
      return route.fulfill({ contentType: "application/x-ndjson", body: packet() });
    });
    await page.goto("/ask-ai"); await send(page);
    await expect(card(page)).toBeVisible();
    await expect(actions(page).getByRole("button")).toHaveCount(3);
    await expect(page.getByRole("group", { name: "Response actions", exact: true })).toHaveCount(0);
    await expect(card(page)).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(card(page).getByRole("heading")).toHaveText(draft.title);
    expect(await card(page).locator("p").first().evaluate(el => parseFloat(getComputedStyle(el).marginBottom))).toBeGreaterThan(10);
    await actions(page).getByRole("button", { name: "Edit message" }).click();
    await replaceDocument(page, "Updated inquiry", "Hello,\n\nPlease include online reservations.\n\nThank you.");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(card(page).getByRole("heading")).toHaveText("Updated inquiry");
    await actions(page).getByRole("button", { name: "Copy message" }).click();
    const expected = "Updated inquiry\n\nHello,\n\nPlease include online reservations.\n\nThank you.";
    expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n")).toBe(expected);
    await expect(page.getByRole("status").filter({ hasText: "Message copied" })).toHaveText("Message copied");
    await actions(page).getByRole("button", { name: "Share message" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Message copied" })).toHaveText("Message copied");
    expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n")).toBe(expected);
    await actions(page).getByRole("button", { name: "Edit message" }).click();
    await expect(editor(page)).toContainText("Updated inquiry");
    await page.getByRole("button", { name: "Close editor" }).click();
    await sidebar(page);
    await page.getByRole("button", { name: "New chat", exact: true }).filter({ visible: true }).click();
    await expect(card(page)).toHaveCount(0);
    await sidebar(page);
    await page.getByRole("button", { name: "Draft an inquiry", exact: true }).filter({ visible: true }).click();
    await expect(card(page).getByRole("heading")).toHaveText("Updated inquiry");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(input(page)).toBeInViewport();
    await page.screenshot({ path: testInfo.outputPath("message-card.png") });
    await send(page, "Make it more formal");
    await expect(card(page)).toHaveCount(2);
    expect(requests[0].responseFormat).toBe("message-card-v1");
    expect(requests[1].messages[1]).toEqual({ role: "assistant", content: expected });
  });
}

test("native sharing uses edited title and complete body; cancelling does not copy", async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, { shares: [], copies: [], cancelled: false });
    const state = window as unknown as { shares: ShareData[]; copies: string[]; cancelled: boolean };
    Object.defineProperty(navigator, "share", { value: async (data: ShareData) => {
      if (state.cancelled) throw new DOMException("Cancelled", "AbortError");
      state.shares.push(data);
    } });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (value: string) => { state.copies.push(value); } } });
  });
  await page.route("**/api/ai/chat", route => route.fulfill({ contentType: "application/x-ndjson", body: packet() }));
  await page.goto("/ask-ai"); await send(page);
  await actions(page).getByRole("button", { name: "Edit message" }).click();
  await replaceTitle(page, "Edited subject");
  await page.getByRole("button", { name: "Save changes" }).click();
  await actions(page).getByRole("button", { name: "Share message" }).click();
  expect(await page.evaluate(() => (window as unknown as { shares: ShareData[] }).shares)).toEqual([{ title: "Edited subject", text: `Edited subject\n\n${draft.body}` }]);
  await page.evaluate(() => { (window as unknown as { cancelled: boolean }).cancelled = true; });
  await actions(page).getByRole("button", { name: "Share message" }).click();
  expect(await page.evaluate(() => (window as unknown as { copies: string[] }).copies)).toEqual([]);
});

test("share falls back after API failure; clipboard failure is actionable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: async () => { throw new Error("Unavailable"); } });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => { throw new Error("Blocked"); } } });
  });
  await page.route("**/api/ai/chat", route => route.fulfill({ contentType: "application/x-ndjson", body: packet() }));
  await page.goto("/ask-ai"); await send(page);
  await actions(page).getByRole("button", { name: "Share message" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Could not copy" })).toHaveText("Could not copy. Please select and copy the message.");
  await expect(actions(page).getByRole("button", { name: "Copy message" })).toHaveAttribute("title", "Copy");
  await expect(actions(page).getByRole("button", { name: "Copy message" })).toBeEnabled();
});

test("invalid or interrupted structured data never becomes a saved card and Retry works", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/ai/chat", route => route.fulfill({ contentType: "application/x-ndjson", body: [
    JSON.stringify({ type: "message_card", card: draft }) + '\n{"type":"error","code":"failed"}\n',
    packet({ ...draft, body: "x".repeat(11001) }),
    packet(),
  ][attempts++] }));
  await page.goto("/ask-ai"); await send(page);
  await expect(page.getByRole("button", { name: "Retry", exact: true })).toBeVisible();
  await expect(card(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByRole("button", { name: "Retry", exact: true })).toBeEnabled();
  await expect(card(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(card(page)).toBeVisible();
});

test("plain text is not keyword-detected; long multilingual card content is safe and bounded", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  let count = 0;
  const body = "مرحبا،\n\n" + "LongWord".repeat(80) + '\n\n<script>alert("unsafe")</script>\n\nTack så mycket.';
  await page.route("**/api/ai/chat", route => route.fulfill({ contentType: "application/x-ndjson", body: count++
    ? packet({ title: "طلب موقع إلكتروني", body })
    : '{"type":"delta","text":"Draft email subject: Hello"}\n{"type":"done"}\n' }));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/ask-ai"); await send(page);
  await expect(page.getByRole("group", { name: "Response actions", exact: true })).toBeVisible();
  await expect(card(page)).toHaveCount(0);
  await send(page, "Now a draft");
  await expect(card(page).getByRole("heading")).toHaveText("طلب موقع إلكتروني");
  expect(await card(page).locator('[dir="auto"]').last().evaluate(el => getComputedStyle(el).direction)).toBe("rtl");
  await expect(card(page).locator("script")).toHaveCount(0);
  await expect(card(page)).toContainText('<script>alert("unsafe")</script>');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await card(page).evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await actions(page).getByRole("button", { name: "Edit message" }).click();
  await replaceTitle(page, " ");
  await expect(page.getByRole("button", { name: "Save changes" })).toBeDisabled();
  expect(errors).toEqual([]);
});

for (const width of [375, 768, 1024, 1440]) {
  test(`unified editor fills the available space and protects unsaved changes at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/api/ai/chat", route => route.fulfill({ contentType: "application/x-ndjson", body: packet() }));
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/ask-ai"); await send(page);
    await actions(page).getByRole("button", { name: "Edit message" }).click();
    const modal = page.getByRole("dialog", { name: "Edit message", exact: true });
    await expect(editor(page)).toBeFocused();
    await expect(modal.getByRole("textbox")).toHaveCount(1);
    await expect(modal.locator("input, textarea")).toHaveCount(0);
    const box = (await modal.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(width * .9);
    expect(box.height).toBeGreaterThanOrEqual(830);
    if (width < 1024) expect(box).toMatchObject({ x: 0, y: 0, width, height: 900 });
    expect(await editor(page).locator(":scope > :first-child").evaluate(el => parseFloat(getComputedStyle(el).fontSize)))
      .toBeGreaterThan(await editor(page).locator("p").first().evaluate(el => parseFloat(getComputedStyle(el).fontSize)));
    await page.screenshot({ path: testInfo.outputPath("expanded-editor.png") });
    await replaceTitle(page, "Unsaved subject");
    page.once("dialog", dialog => dialog.dismiss());
    await page.getByRole("button", { name: "Close editor" }).click();
    await expect(modal).toBeVisible();
    await expect(editor(page)).toContainText("Unsaved subject");
    await editor(page).press("ControlOrMeta+z");
    await editor(page).press("ControlOrMeta+Shift+z");
    page.once("dialog", dialog => dialog.accept());
    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
    await expect(card(page).getByRole("heading")).toHaveText(draft.title);
    await expect(actions(page).getByRole("button", { name: "Edit message" })).toBeFocused();
    await actions(page).getByRole("button", { name: "Edit message" }).click();
    await expect(editor(page)).toContainText(draft.title);
    await editor(page).press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
    if (width < 1024) {
      await page.setViewportSize({ width, height: 480 });
      await expect(page.getByRole("button", { name: "Save changes" })).toBeInViewport();
      await expect(editor(page)).toBeInViewport();
    }
    await page.getByRole("button", { name: "Close editor" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("copy checkmark and localized top toast last two seconds, with no card notice", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => {} } }));
  await page.route("**/api/ai/chat", route => route.fulfill({ contentType: "application/x-ndjson", body: packet() }));
  await page.goto("/ask-ai"); await send(page);
  const copy = actions(page).getByRole("button", { name: "Copy message" });
  for (const [language, text] of [["en", "Message copied"], ["sv", "Meddelandet kopierat"], ["ar", "تم نسخ الرسالة"]]) {
    await page.evaluate(lang => { document.documentElement.lang = lang; }, language);
    await copy.click();
    await expect(copy.locator(".lucide-check")).toBeVisible();
    const toast = page.getByRole("status").filter({ hasText: text });
    await expect(toast).toBeVisible();
    expect((await toast.boundingBox())!.y).toBeLessThan(50);
    await expect(card(page).getByRole("status")).toHaveCount(0);
    await expect(toast).toHaveCount(0, { timeout: 3000 });
    await expect(copy.locator(".lucide-copy")).toBeVisible();
  }
});

test("rich content and Arabic RTL survive editing, saving, reopening and copying", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const rich = { title: "طلب موقع للمطعم", body: "مرحباً،\n\n## التفاصيل\n\n- قائمة الطعام\n- **الحجز عبر الإنترنت**\n\n1. مراجعة المتطلبات\n2. الخطوة التالية\n\nشكراً لكم." };
  await page.route("**/api/ai/chat", route => route.fulfill({ contentType: "application/x-ndjson", body: packet(rich) }));
  await page.goto("/ask-ai"); await send(page);
  await actions(page).getByRole("button", { name: "Edit message" }).click();
  await expect(editor(page).locator("h2")).toHaveText("التفاصيل");
  await expect(editor(page).locator("ul li")).toHaveCount(2);
  await expect(editor(page).locator("ol li")).toHaveCount(2);
  await expect(editor(page).locator("strong")).toHaveText("الحجز عبر الإنترنت");
  expect(await editor(page).locator("h1").evaluate(el => getComputedStyle(el).direction)).toBe("rtl");
  await expect(editor(page)).toBeFocused();
  await editor(page).press("ControlOrMeta+End");
  await page.keyboard.insertText(" مع التحية");
  await expect(editor(page)).toContainText("مع التحية");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(card(page).locator("h2").last()).toHaveText("التفاصيل");
  await expect(card(page).locator("strong")).toHaveText("الحجز عبر الإنترنت");
  await expect(card(page)).toContainText("مع التحية");
  await actions(page).getByRole("button", { name: "Copy message" }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain(rich.title);
  expect(copied).toContain("## التفاصيل");
  expect(copied).toContain("**الحجز عبر الإنترنت**");
  expect(copied).toContain("مع التحية");
  await actions(page).getByRole("button", { name: "Edit message" }).click();
  await expect(editor(page).locator("ul li")).toHaveCount(2);
  await expect(editor(page).locator("ol li")).toHaveCount(2);
  await expect(editor(page)).toContainText("مع التحية");
});

test("wide touch tablets use a full-screen editor and long documents scroll without hiding controls", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, hasTouch: true });
  const page = await context.newPage();
  try {
    const body = Array.from({ length: 45 }, (_, index) => `Paragraph ${index + 1}: Website requirements and project details.`).join("\n\n");
    await page.route("**/api/ai/chat", route => route.fulfill({ contentType: "application/x-ndjson", body: packet({ ...draft, body }) }));
    await page.goto("/ask-ai"); await send(page);
    await actions(page).getByRole("button", { name: "Edit message" }).click();
    const modal = page.getByRole("dialog", { name: "Edit message", exact: true });
    expect(await modal.boundingBox()).toMatchObject({ x: 0, y: 0, width: 1366, height: 900 });
    await expect(editor(page)).toBeFocused();
    await editor(page).press("ControlOrMeta+End");
    await page.keyboard.insertText(" Final note.");
    await expect(editor(page).locator("p").last()).toBeInViewport();
    await expect(page.getByRole("button", { name: "Save changes" })).toBeInViewport();
    expect(await modal.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(card(page)).toContainText("Final note.");
  } finally { await context.close(); }
});
