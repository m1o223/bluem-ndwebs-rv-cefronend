import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/intro",
  workers: 1,
  timeout: 45000,
  use: { baseURL: process.env.BASE_URL || "http://localhost:3196", browserName: "chromium", trace: process.env.VERCEL_OIDC_TOKEN ? "off" : "retain-on-failure" },
  webServer: process.env.BASE_URL ? undefined : {
    command: "npm run start -- --port 3196", url: "http://localhost:3196", reuseExistingServer: false, timeout: 60000,
  },
});
