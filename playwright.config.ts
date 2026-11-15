import { defineConfig } from "@playwright/test";

// Playwright runs only behind `pnpm ui:shots`, on this machine: `pnpm verify` and CI never start it, and CI installs
// no browser. Its files end in .shots.ts, which Vitest's globs don't match.
const baseURL = "http://127.0.0.1:3001";

export default defineConfig({
  testDir: "test/ui",
  testMatch: "*.shots.ts",
  reporter: "list",
  use: {
    baseURL,
    browserName: "chromium",
    // Two device pixels to each CSS pixel, so type in the pictures is sharp enough to judge.
    deviceScaleFactor: 2,
  },
  // Starts the interface's dev server with its placeholder settings, or uses the one `pnpm ui:dev` already has running.
  webServer: { command: "pnpm ui:dev", url: `${baseURL}/specimen`, reuseExistingServer: true },
});
