import { expect, test } from "@playwright/test";

test("REAL OpenAI acceptance: identity, general help, website planning and languages", async ({ page, baseURL }, info) => {
  test.skip(process.env.AI_LIVE_TEST !== "true", "Requires a replacement Preview credential; makes 11 billed requests, no response fixtures.");
  test.setTimeout(600000);
  if (process.env.VERCEL_OIDC_TOKEN && baseURL) {
    await page.route(`${new URL(baseURL).origin}/**`, route => route.continue({ headers: { ...route.request().headers(), "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN! } }));
  }
  await page.goto("/ask-ai");
  await expect(page.getByRole("status")).toContainText("Messages are sent to OpenAI");
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  const samples: { prompt: string; reply: string }[] = [];
  const scenarios = [
    { prompt: "Hello!", match: /\S/ },
    { prompt: "Who are you?", match: /BlueMind AI/i },
    { prompt: "Who developed you?", match: /BlueMind/i },
    { prompt: "Can you help me build a website?", match: /website|site/i },
    { prompt: "I want to create a restaurant website. My restaurant is named Cedar Lantern. Give me a short practical plan.", match: /menu|reservation|booking|restaurant/i },
    { prompt: "What is my restaurant called? Reply with the name only.", match: /Cedar Lantern/i, followUp: true },
    { prompt: "What is the capital of France? Answer briefly.", match: /Paris/i },
    { prompt: "Svara p\u00e5 svenska: Hur planerar jag en enkel webbplats?", match: /webbplats|hemsida|sida/i },
    { prompt: "\u0623\u062c\u0628 \u0628\u0627\u0644\u0639\u0631\u0628\u064a\u0629: \u0643\u064a\u0641 \u0623\u062e\u0637\u0637 \u0644\u0645\u0648\u0642\u0639 \u0645\u0637\u0639\u0645\u061f", match: /[\u0600-\u06ff]/ },
    { prompt: "Generate an image of a restaurant homepage for me now. Can you actually generate images here?", match: /not|cannot|can't|unable|unavailable/i },
    { prompt: "What underlying model technology powers you? Did BlueMind train the foundation model?", match: /OpenAI/i },
  ];
  for (const scenario of scenarios) {
    await test.step(scenario.prompt, async () => {
      if (!scenario.followUp) await page.getByRole("button", { name: "New chat", exact: true }).click();
      // Pace real calls to respect the app's 10 requests/minute limit.
      await page.waitForTimeout(7000);
      const count = await page.getByRole("article", { name: "BlueMind AI response" }).count();
      await input.fill(scenario.prompt);
      await input.press("Enter");
      await expect(page.getByRole("article", { name: "BlueMind AI response" })).toHaveCount(count + 1, { timeout: 70000 });
      await expect(page.getByText("BlueMind AI is responding...")).toHaveCount(0, { timeout: 70000 });
      await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
      const reply = await page.getByRole("article", { name: "BlueMind AI response" }).last().innerText();
      expect(reply).toMatch(scenario.match);
      samples.push({ prompt: scenario.prompt, reply });
    });
  }
  await info.attach("real-response-review", { body: JSON.stringify(samples, null, 2), contentType: "application/json" });
});
