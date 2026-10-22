import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/render-ai",
  workers: 1,
  use: { baseURL: "http://localhost:3197", browserName: "chromium", trace: "retain-on-failure" },
  webServer: [
    { command: "node tests/fixtures/render-ai-server.mjs", url: "http://127.0.0.1:4198/api/health", reuseExistingServer: false, timeout: 30000 },
    { command: "npm run start -- --port 3197", url: "http://localhost:3197", reuseExistingServer: false, timeout: 60000 },
  ],
});
