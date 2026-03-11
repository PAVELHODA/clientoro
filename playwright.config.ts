import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: 0,

  use: {
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    baseURL: "http://localhost:3000",
  },

  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true,
  },
});
