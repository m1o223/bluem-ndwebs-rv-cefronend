import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/ai-preview",
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: process.env.AI_PREVIEW_URL || "http://127.0.0.1:3112",
    screenshot: "only-on-failure",
    browserName: "chromium",
  },
  webServer: process.env.AI_PREVIEW_URL ? undefined : {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3112",
    url: "http://127.0.0.1:3112",
    reuseExistingServer: !process.env.CI,
  },
});
