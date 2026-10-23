import { expect, test, type Page } from "@playwright/test";

const draft = { title: "Website inquiry", body: "Hello BlueMind,\n\nI would like a restaurant website with a menu and reservations.\n\nPlease let me know the next steps.\n\nThank you." };
const packet = (card = draft) => JSON.stringify({ type: "message_card", card }) + '\n{"type":"done"}\n';
const input = (page: Page) => page.getByRole("textbox", { name: "Message", exact: true });
const card = (page: Page) => page.getByRole("region", { name: "Message card", exact: true });
const actions = (page: Page) => card(page).getByRole("group", { name: "Message card actions" });
async function send(page: Page, text = "Draft an inquiry") { await input(page).fill(text); await input(page).press("Enter"); }
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
    await expect(card(page)).toHaveCSS("background-color", theme === "dark" ? "rgb(32, 33, 36)" : "rgb(255, 255, 255)");
    await expect(card(page).getByRole("heading")).toHaveText(draft.title);
    await actions(page).getByRole("button", { name: "Edit message" }).click();
    await card(page).getByRole("textbox", { name: "Title", exact: true }).fill("Updated inquiry");
    await card(page).getByRole("textbox", { name: "Message body" }).fill("Hello,\n\nPlease include online reservations.\n\nThank you.");
    await card(page).getByRole("button", { name: "Save changes" }).click();
    await expect(card(page).getByRole("heading")).toHaveText("Updated inquiry");
    await actions(page).getByRole("button", { name: "Copy message" }).click();
    const expected = "Updated inquiry\n\nHello,\n\nPlease include online reservations.\n\nThank you.";
    expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n")).toBe(expected);
    await expect(card(page).getByRole("status")).toHaveText("Message copied.");
    await actions(page).getByRole("button", { name: "Share message" }).click();
    await expect(card(page).getByRole("status")).toHaveText("Message copied for sharing.");
    expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n")).toBe(expected);
    await actions(page).getByRole("button", { name: "Edit message" }).click();
    await expect(card(page).getByRole("textbox", { name: "Title", exact: true })).toHaveValue("Updated inquiry");
    await actions(page).getByRole("button", { name: "Edit message" }).click();
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
  await card(page).getByRole("textbox", { name: "Title", exact: true }).fill("Edited subject");
  await card(page).getByRole("button", { name: "Save changes" }).click();
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
  await expect(card(page).getByRole("status")).toHaveText("Could not copy. Please select and copy the message.");
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
  await card(page).getByRole("textbox", { name: "Title", exact: true }).fill(" ");
  await expect(card(page).getByRole("button", { name: "Save changes" })).toBeDisabled();
  expect(errors).toEqual([]);
});
