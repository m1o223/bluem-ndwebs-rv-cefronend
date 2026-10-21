import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/ask-ai",
  workers: 1,
  use: { baseURL: process.env.BASE_URL || "http://localhost:3197", browserName: "chromium", trace: process.env.VERCEL_OIDC_TOKEN ? "off" : "retain-on-failure" },
  webServer: process.env.BASE_URL ? undefined : {
    command: "npm run start -- --port 3197",
    url: "http://localhost:3197",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
