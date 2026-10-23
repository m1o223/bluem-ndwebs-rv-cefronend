import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/ai-public", outputDir: "./test-results/ai-public", workers: 1,
  timeout: 60000, expect: { timeout: 15000 },
  use: { baseURL: "http://localhost:3198", browserName: "chromium", trace: "retain-on-failure" },
  webServer: { command: "npm run start -- --port 3198", url: "http://localhost:3198", reuseExistingServer: false, timeout: 60000 },
});
