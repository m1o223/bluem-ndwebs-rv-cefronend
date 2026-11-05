import { expect, test } from "@playwright/test";

const origin = "http://localhost:3199";
const callback = "https://bluemindwebservice.com/api/auth/callback/google";
async function begin(request: import("@playwright/test").APIRequestContext) {
  const response = await request.post("/api/auth/google", { headers: { Origin: origin } });
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(Object.keys(data)).toEqual(["authorizationUrl"]);
  const url = new URL(data.authorizationUrl);
  expect(url.searchParams.get("redirect_uri")).toBe(callback);
  for (const part of ["__Host-bluemind_google_flow=", "HttpOnly", "Secure", "SameSite=lax"]) expect(response.headers()["set-cookie"]).toContain(part);
  return url;
}

test("Google callback rejects missing state and browser cookie and start rejects CSRF", async ({ request }) => {
  expect((await request.get("/api/auth/callback/google")).status()).toBe(400);
  expect((await request.post("/api/auth/google")).status()).toBe(403);
  expect((await request.post("/api/auth/google", { headers: { Origin: "https://attacker.invalid" } })).status()).toBe(403);
  expect((await request.get("/api/auth/google")).status()).toBe(405);
});

for (const width of [390, 768, 1440]) {
  test(`Google button and verified callback enter customer dashboard at ${width}px`, async ({ page, context }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("https://accounts.google.com/**", route => route.fulfill({ body: "Isolated provider test", contentType: "text/plain" }));
    await page.goto("/sign-in");
    await page.getByLabel("Email", { exact: true }).fill("must-not-send@example.invalid");
    await page.getByLabel("Password", { exact: true }).fill("must-not-send-password");
    const requests: string[] = [];
    page.on("request", request => { if (request.method() === "POST") requests.push(request.url() + (request.postData() || "")); });
    await page.getByRole("button", { name: "Continue with Google", exact: true }).click();
    await expect(page).toHaveURL(/^https:\/\/accounts\.google\.com\//);
    const google = new URL(page.url());
    expect(google.searchParams.get("redirect_uri")).toBe(callback);
    expect(requests.join()).not.toContain("must-not-send");
    const cookie = (await context.cookies(origin)).find(cookie => cookie.name === "__Host-bluemind_google_flow")!;
    expect(cookie.httpOnly && cookie.secure).toBe(true);
    const query = new URLSearchParams({ state: google.searchParams.get("state")!, code: google.searchParams.get("nonce")! });
    await page.goto(`${origin}/api/auth/callback/google?${query}`);
    await expect(page).toHaveURL(`${origin}/dashboard`);
    await expect(page.locator("body")).toContainText("Google test customer");
    expect((await context.cookies(origin)).some(cookie => cookie.name === "__Host-bluemind_customer")).toBe(true);
    expect((await context.cookies(origin)).some(cookie => cookie.name === "__Host-bluemind_google_flow")).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await context.request.post(`${origin}/api/customer/logout`, { headers: { Origin: origin } });
    await page.goto(`${origin}/dashboard`);
    await expect(page).toHaveURL(`${origin}/sign-in`);
  });
}

test("Google callback consumes flow once, sets no public token and rejects replay", async ({ request }) => {
  const url = await begin(request);
  const path = `/api/auth/callback/google?${new URLSearchParams({ state: url.searchParams.get("state")!, code: url.searchParams.get("nonce")! })}`;
  const response = await request.get(path, { maxRedirects: 0 });
  expect(response.status()).toBe(303);
  expect(response.headers().location).toBe(`${origin}/dashboard`);
  expect(await response.text()).not.toContain("token");
  expect((await request.get(path, { maxRedirects: 0 })).status()).toBe(400);
});

test("Google cancellation and provider errors never create authenticated sessions", async ({ request }) => {
  let url = await begin(request);
  let response = await request.get(`/api/auth/callback/google?state=${url.searchParams.get("state")}&error=access_denied`, { maxRedirects: 0 });
  expect(response.headers().location).toBe(`${origin}/sign-in?google=cancelled`);
  url = await begin(request);
  response = await request.get(`/api/auth/callback/google?state=${url.searchParams.get("state")}&code=failed-provider`, { maxRedirects: 0 });
  expect(response.headers().location).toBe(`${origin}/sign-in?google=failed`);
  expect((await request.storageState()).cookies.some(cookie => cookie.name === "__Host-bluemind_customer")).toBe(false);
});

test("Google not configured shows a truthful message and prevents duplicate starts", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/auth/google*", async route => { calls++; await new Promise(resolve => setTimeout(resolve, 300)); await route.fulfill({ status: 503, json: { code: "google_unavailable" } }); });
  await page.goto("/sign-in");
  const button = page.getByRole("button", { name: "Continue with Google", exact: true });
  await button.evaluate(element => { (element as HTMLButtonElement).click(); (element as HTMLButtonElement).click(); });
  await expect(button).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("not configured yet");
  await expect(button).toBeEnabled();
  expect(calls).toBe(1);
  await expect(page).toHaveURL(/\/sign-in$/);
});
