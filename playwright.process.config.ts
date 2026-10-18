import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/process",
  workers: 1,
  timeout: 60000,
  use: { baseURL: process.env.BASE_URL || "http://localhost:3199", browserName: "chromium", trace: process.env.VERCEL_OIDC_TOKEN ? "off" : "retain-on-failure" },
  webServer: process.env.BASE_URL ? undefined : {
    command: "npm run start -- --port 3199",
    url: "http://localhost:3199/how-we-work",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
