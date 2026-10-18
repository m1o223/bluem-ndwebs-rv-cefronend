import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/about",
  workers: 1,
  timeout: 45000,
  use: { baseURL: process.env.BASE_URL || "http://localhost:3198", browserName: "chromium", trace: process.env.VERCEL_OIDC_TOKEN ? "off" : "retain-on-failure" },
  webServer: process.env.BASE_URL ? undefined : {
    command: "npm run start -- --port 3198",
    url: "http://localhost:3198/about",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
