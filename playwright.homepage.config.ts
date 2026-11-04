import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/homepage-release",
  outputDir: "./test-results/homepage-release",
  workers: 1,
  timeout: 45000,
  use: { baseURL: process.env.BASE_URL || "http://localhost:3196", browserName: "chromium", trace: "off" },
  webServer: process.env.BASE_URL ? undefined : {
    command: "npm run start -- --port 3196", url: "http://localhost:3196", reuseExistingServer: false, timeout: 60000,
  },
});
