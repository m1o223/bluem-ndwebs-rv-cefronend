import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page, baseURL }) => {
  if (process.env.VERCEL_OIDC_TOKEN && baseURL) {
    const origin = new URL(baseURL).origin;
    await page.route(`${origin}/**`, route => route.continue({ headers: { ...route.request().headers(), "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN! } }));
  }
});

for (const width of [375, 1440]) {
  test(`test fixture: reply, context, new chat and history at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const payloads: { messages: { role: string; content: string }[] }[] = [];
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.route("**/api/ai/chat", async route => {
      payloads.push(route.request().postDataJSON());
      await new Promise(resolve => setTimeout(resolve, 350));
      await route.fulfill({ contentType: "application/x-ndjson", body: '{"type":"delta","text":"Test fixture: "}\n{"type":"delta","text":"website planning reply."}\n{"type":"done"}\n' });
    });
    await page.goto("/ask-ai");
    await page.getByRole("button", { name: "Create a website", exact: true }).click();
    const input = page.getByRole("textbox", { name: "Message", exact: true });
    await input.press("Enter");
    await expect(page.getByText("BlueMind AI is responding...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled();
    await expect(page.getByRole("article", { name: "BlueMind AI response" })).toHaveText("Test fixture: website planning reply.");
    await expect(page.getByText("BlueMind AI is responding...")).toHaveCount(0);
    await input.fill("What should the homepage include?");
    await input.press("Enter");
    await expect(page.getByRole("article", { name: "BlueMind AI response" })).toHaveCount(2);
    await expect(page.getByText("BlueMind AI is responding...")).toHaveCount(0);
    expect(payloads[1].messages).toEqual([
      { role: "user", content: "Create a website" },
      { role: "assistant", content: "Test fixture: website planning reply." },
      { role: "user", content: "What should the homepage include?" },
    ]);
    await page.screenshot({ path: info.outputPath("fixture-replies.png") });
    if (width < 768) await page.getByRole("button", { name: "Open sidebar" }).click();
    await page.getByRole("button", { name: "New chat", exact: true }).click();
    await expect(page.getByRole("heading", { name: "BlueMind AI" })).toBeVisible();
    await input.fill("Fresh question"); await input.press("Enter");
    await expect(page.getByRole("article", { name: "BlueMind AI response" })).toHaveCount(1);
    await expect(page.getByText("BlueMind AI is responding...")).toHaveCount(0);
    expect(payloads[2].messages).toEqual([{ role: "user", content: "Fresh question" }]);
    if (width < 768) await page.getByRole("button", { name: "Open sidebar" }).click();
    await page.getByRole("navigation", { name: "Conversation history" }).getByRole("button", { name: "Create a website", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(4);
    expect(errors).toEqual([]);
  });
}

test("test fixture: rate error, retry without duplicate user message, and incomplete stream", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/ai/chat", route => {
    calls++;
    if (calls === 1) return route.fulfill({ status: 429, contentType: "application/json", body: '{"code":"rate","internal":"must never be displayed"}' });
    if (calls === 2) return route.fulfill({ contentType: "application/x-ndjson", body: '{"type":"delta","text":"Test partial"}\n' });
    return route.fulfill({ contentType: "application/x-ndjson", body: '{"type":"delta","text":"Test recovered"}\n{"type":"done"}\n' });
  });
  await page.goto("/ask-ai");
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Test retry");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Too many requests");
  await expect(page.getByText("must never be displayed")).toHaveCount(0);
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("could not complete");
  await expect(page.getByText("Incomplete response")).toBeVisible();
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByRole("article", { name: "BlueMind AI response" })).toHaveText("Test recovered");
  await expect(page.getByRole("article", { name: "Your message" })).toHaveCount(1);
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
});

test("test fixture: switching chats cancels a request without leaking its reply", async ({ page }) => {
  let release!: () => void;
  const wait = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/ai/chat", async route => {
    await wait;
    await route.fulfill({ contentType: "application/x-ndjson", body: '{"type":"delta","text":"Late test reply"}\n{"type":"done"}\n' }).catch(() => {});
  });
  await page.goto("/ask-ai");
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("First conversation");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("BlueMind AI is responding...")).toBeVisible();
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  release();
  await expect(page.getByRole("heading", { name: "BlueMind AI" })).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(0);
  await page.getByRole("button", { name: "First conversation", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("stopped");
  await expect(page.getByRole("article", { name: "BlueMind AI response" })).toHaveCount(0);
});

test("REAL OpenAI smoke: initial response and remembered context", async ({ page }) => {
  test.skip(process.env.AI_LIVE_TEST !== "true", "Opt in only after configuring a replacement Preview key; makes two billed API calls.");
  test.setTimeout(150000);
  await page.goto("/ask-ai");
  await expect(page.getByRole("status")).toContainText("Messages are sent to OpenAI");
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  await input.fill("My project is named Cedar Lantern. Suggest one short homepage heading for a florist.");
  await input.press("Enter");
  await expect(page.getByRole("article", { name: "BlueMind AI response" })).toBeVisible({ timeout: 70000 });
  await expect(page.getByText("BlueMind AI is responding...")).toHaveCount(0, { timeout: 70000 });
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  await input.fill("What project name did I just give you? Reply with only the name."); await input.press("Enter");
  await expect(page.getByRole("article", { name: "BlueMind AI response" })).toHaveCount(2, { timeout: 70000 });
  await expect(page.getByText("BlueMind AI is responding...")).toHaveCount(0, { timeout: 70000 });
  await expect(page.getByRole("article", { name: "BlueMind AI response" }).last()).toContainText("Cedar Lantern");
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
});

test("unconfigured deployment returns a safe real endpoint error without an assistant reply", async ({ page }) => {
  await page.goto("/ask-ai");
  test.skip(!(await page.getByText("AI responses are not connected", { exact: true }).isVisible()), "Key configured: use the opt-in real-provider smoke test.");
  const response = await page.evaluate(async () => {
    const result = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: "Configuration check" }] }) });
    return { status: result.status, body: await result.json() };
  });
  expect(response).toEqual({ status: 503, body: { code: "unavailable" } });
  await expect(page.getByRole("article", { name: "BlueMind AI response" })).toHaveCount(0);
});
