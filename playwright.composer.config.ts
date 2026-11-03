import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/ai-public",
  testMatch: "composer-position.spec.ts",
  outputDir: "./test-results/composer",
  workers: 1,
  timeout: 60000,
  use: { baseURL: process.env.BASE_URL || "http://localhost:3198", browserName: "chromium", trace: "retain-on-failure" },
  webServer: process.env.BASE_URL ? undefined : {
    command: "npm run start -- --port 3198", url: "http://localhost:3198", reuseExistingServer: false, timeout: 60000,
  },
});
