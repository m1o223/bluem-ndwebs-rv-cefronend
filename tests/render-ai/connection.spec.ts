import { expect, test } from "@playwright/test";

for (const width of [375, 1440]) {
  test(`real cross-origin HTTP flow with test-only provider at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const endpoints: string[] = [];
    const errors: string[] = [];
    page.on("request", request => { if (request.method() === "POST") endpoints.push(request.url()); });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/ask-ai");
    const input = page.getByRole("textbox", { name: "Message", exact: true });
    await page.getByRole("button", { name: "Create a website", exact: true }).click();
    await input.press("Enter");
    await expect(page.getByRole("article", { name: "BlueMind AI response" })).toContainText("context has 1 turns; first question: Create a website");
    await expect(page.getByText("BlueMind AI is responding...")).toHaveCount(0);
    await input.fill("What comes next?"); await input.press("Enter");
    await expect(page.getByRole("article", { name: "BlueMind AI response" }).last()).toContainText("context has 3 turns; first question: Create a website");
    await expect(page.getByText("BlueMind AI is responding...")).toHaveCount(0);
    if (width < 768) await page.getByRole("button", { name: "Open sidebar" }).click();
    await page.getByRole("button", { name: "New chat", exact: true }).click();
    await input.fill("New idea"); await input.press("Enter");
    await expect(page.getByRole("article", { name: "BlueMind AI response" })).toContainText("context has 1 turns; first question: New idea");
    await expect(page.getByText("BlueMind AI is responding...")).toHaveCount(0);
    if (width < 768) await page.getByRole("button", { name: "Open sidebar" }).click();
    await page.getByRole("navigation", { name: "Conversation history" }).getByRole("button", { name: "Create a website", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(4);
    expect(endpoints).toEqual(Array(3).fill("http://127.0.0.1:4198/api/ai/chat"));
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.screenshot({ path: info.outputPath("render-fixture-chat.png") });
  });
}

test("real backend failure and manual retry do not duplicate messages or fall back to Vercel", async ({ page }) => {
  const endpoints: string[] = [];
  page.on("request", request => { if (request.method() === "POST") endpoints.push(request.url()); });
  await page.goto("/ask-ai");
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Retry fixture");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("temporarily unavailable");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByRole("article", { name: "BlueMind AI response" })).toContainText("context has 1 turns");
  await expect(page.getByText("BlueMind AI is responding...")).toHaveCount(0);
  await expect(page.getByRole("article", { name: "Your message" })).toHaveCount(1);
  await expect(page.getByText("private test detail")).toHaveCount(0);
  expect(endpoints).toEqual(Array(2).fill("http://127.0.0.1:4198/api/ai/chat"));
});

test("Vercel execution stays disabled and Render AI CORS does not open customer APIs", async ({ page, request }) => {
  await page.goto("/ask-ai");
  const legacy = await request.post("/api/ai/chat", { data: { messages: [{ role: "user", content: "Hello" }] } });
  expect(legacy.status()).toBe(503);
  expect(await legacy.json()).toEqual({ code: "unavailable" });
  const preflight = await request.fetch("http://127.0.0.1:4198/api/ai/chat", { method: "OPTIONS", headers: { Origin: "http://localhost:3197", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type" } });
  expect(preflight.status()).toBe(204);
  expect(preflight.headers()["access-control-allow-origin"]).toBe("http://localhost:3197");
  const orders = await request.get("http://127.0.0.1:4198/api/admin/orders", { headers: { Origin: "http://localhost:3197" } });
  expect(orders.status()).toBe(403);
  expect(orders.headers()["access-control-allow-origin"]).toBeUndefined();
  const invalid = await request.post("http://127.0.0.1:4198/api/ai/chat", { headers: { Origin: "http://localhost:3197" }, data: { messages: [] } });
  expect(invalid.status()).toBe(400);
  expect(await invalid.json()).toEqual({ code: "invalid" });
});
