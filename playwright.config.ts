import { defineConfig, devices } from "@playwright/test";

/**
 * Sciath UI E2E tests.
 *
 * Prerequisites:
 *   1. Django backend running: cd ../Sciath && ./venv/bin/python manage.py runserver
 *   2. Next.js dev server: npm run dev
 *   3. Auth bypass enabled: NEXT_PUBLIC_AUTH_BYPASS=true in .env.local
 *
 * Run:
 *   npx playwright test
 *   npx playwright test --ui  (interactive mode)
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // sequential — tests share server state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  timeout: 30_000,

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Start Next.js dev server automatically if not already running
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run dev",
        port: 3000,
        reuseExistingServer: true,
        timeout: 30_000,
        env: {
          NEXT_PUBLIC_AUTH_BYPASS: "true",
          DJANGO_API_URL: process.env.DJANGO_API_URL ?? "http://localhost:8000",
          SESSION_SECRET: "e2e-test-secret-must-be-at-least-32-characters-long",
        },
      },
});
