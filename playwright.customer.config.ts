import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/customer-app", testMatch: "*.spec.ts", outputDir: "./test-results/customer-app",
  workers: 1, use: { baseURL: "http://localhost:3199", browserName: "chromium", trace: "retain-on-failure" },
  webServer: [
    { command: "node tests/customer-app/backend-fixture.mjs", url: "http://127.0.0.1:4209/health", reuseExistingServer: false },
    { command: "npm run start -- --port 3199", url: "http://localhost:3199", env: { CUSTOMER_AUTH_BACKEND_URL: "http://127.0.0.1:4209" }, reuseExistingServer: false, timeout: 60000 },
  ],
});
