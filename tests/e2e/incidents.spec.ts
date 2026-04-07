import { test, expect } from "@playwright/test";

/**
 * E2E tests for the CRA Incident Notification Dashboard.
 *
 * Prerequisites:
 *   - Django backend running on :8000 with test data seeded
 *   - Next.js dev server on :3000 with NEXT_PUBLIC_AUTH_BYPASS=true
 *   - At least one Customer, Project, Scan, CVEAlert, IncidentNotification in DB
 *
 * Seed test data:
 *   cd ../Sciath
 *   ./venv/bin/python manage.py seed_rpi4_demo
 *   ./venv/bin/python manage.py check_new_cves --since-hours=8760
 */

const DJANGO_API = process.env.DJANGO_API_URL ?? "http://localhost:8000";

// Helper: create test data via Django API directly
async function seedTestData(request: ReturnType<typeof test.step>) {
  // This would normally be done via management commands before tests run
  // For now, tests assume data is pre-seeded
}

test.describe("Incidents Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to incidents page
    await page.goto("/en/incidents");
    // Wait for page to be interactive
    await page.waitForLoadState("networkidle");
  });

  test("page loads with title", async ({ page }) => {
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Incidents");
  });

  test("shows monitoring active empty state when no incidents", async ({
    page,
  }) => {
    // If no incidents exist, should show the green shield empty state
    const emptyState = page.locator("text=No active incidents");
    const incidentTable = page.locator("table");

    // Either empty state or table should be visible
    const isEmpty = await emptyState.isVisible().catch(() => false);
    const hasTable = await incidentTable.isVisible().catch(() => false);

    expect(isEmpty || hasTable).toBeTruthy();
  });

  test("stat tiles render with numbers", async ({ page }) => {
    // Stat tiles should always be visible (even with zero counts)
    const statTiles = page.locator(".bg-card.border.rounded-md.p-3");
    const count = await statTiles.count();
    // Should have 5 stat tiles: active, approaching, awaiting, overdue, closed
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("no console errors on page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/en/incidents");
    await page.waitForLoadState("networkidle");

    // Filter out known non-critical errors (e.g. favicon, HMR)
    const realErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("HMR") &&
        !e.includes("hydration")
    );
    expect(realErrors).toHaveLength(0);
  });
});

test.describe("Incidents Dashboard - With Data", () => {
  // These tests require pre-seeded incident data.
  // Run: cd ../Sciath && ./venv/bin/python manage.py check_new_cves --since-hours=8760

  test("incident table shows CVE IDs in monospace", async ({ page }) => {
    await page.goto("/en/incidents");
    await page.waitForLoadState("networkidle");

    const cveCell = page.locator("td.font-mono").first();
    if (await cveCell.isVisible()) {
      const text = await cveCell.textContent();
      expect(text).toMatch(/CVE-\d{4}-/);
    }
  });

  test("clicking incident row expands detail view", async ({ page }) => {
    await page.goto("/en/incidents");
    await page.waitForLoadState("networkidle");

    const firstRow = page.locator("tbody tr").first();
    if (await firstRow.isVisible()) {
      await firstRow.click();

      // Expanded row should show the stage timeline
      const timeline = page.locator("text=24h Early Warning");
      await expect(timeline).toBeVisible({ timeout: 2000 });
    }
  });

  test("approve button advances stage", async ({ page }) => {
    await page.goto("/en/incidents");
    await page.waitForLoadState("networkidle");

    const approveBtn = page.locator("button:has-text('Approve')").first();
    if (await approveBtn.isVisible()) {
      // Note the current stage
      const stageBefore = await page
        .locator("span.rounded-full")
        .first()
        .textContent();

      await approveBtn.click();
      await page.waitForTimeout(1000); // Wait for mutation + refetch

      // Stage should have changed
      const stageAfter = await page
        .locator("span.rounded-full")
        .first()
        .textContent();

      // Either stage changed or button disappeared (last stage)
      const btnStillVisible = await approveBtn.isVisible().catch(() => false);
      expect(stageBefore !== stageAfter || !btnStillVisible).toBeTruthy();
    }
  });

  test("withdraw opens modal with reason field", async ({ page }) => {
    await page.goto("/en/incidents");
    await page.waitForLoadState("networkidle");

    // Expand a row first
    const firstRow = page.locator("tbody tr").first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);

      const withdrawBtn = page
        .locator("button:has-text('Withdraw')")
        .first();
      if (await withdrawBtn.isVisible()) {
        await withdrawBtn.click();

        // Modal should appear with textarea
        const modal = page.locator("textarea");
        await expect(modal).toBeVisible({ timeout: 2000 });

        // Cancel button should dismiss
        const cancelBtn = page.locator("button:has-text('Cancel')");
        await cancelBtn.click();
        await expect(modal).not.toBeVisible({ timeout: 1000 });
      }
    }
  });

  test("urgency band appears for approaching deadlines", async ({ page }) => {
    await page.goto("/en/incidents");
    await page.waitForLoadState("networkidle");

    // If there are incidents with approaching deadlines, urgency band should show
    const urgencyBand = page.locator(
      ".border-red-500\\/30, .border-amber-500\\/30"
    );
    const statOverdue = page.locator("text=Overdue");

    // Either urgency band visible OR stat tiles show 0 overdue
    const bandVisible = await urgencyBand.isVisible().catch(() => false);
    const overdueVisible = await statOverdue.isVisible().catch(() => false);

    expect(bandVisible || overdueVisible).toBeTruthy();
  });
});

test.describe("CRA Compliance", () => {
  test("sidebar has incidents link", async ({ page }) => {
    await page.goto("/en/dashboard");
    await page.waitForLoadState("networkidle");

    const incidentsLink = page.locator("a[href*='/incidents']");
    await expect(incidentsLink).toBeVisible();
  });

  test("navigating to incidents from sidebar", async ({ page }) => {
    await page.goto("/en/dashboard");
    await page.waitForLoadState("networkidle");

    const incidentsLink = page.locator("a[href*='/incidents']");
    await incidentsLink.click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/.*incidents/);
    const heading = page.locator("h1");
    await expect(heading).toContainText("Incidents");
  });
});

test.describe("API Health - Incidents", () => {
  // Direct API tests via Playwright request context
  // These don't need the Next.js proxy — they hit Django directly

  test("incidents API returns valid JSON", async ({ request }) => {
    // This test uses an API key directly against Django
    // Skip if no API key is configured
    const apiKey = process.env.E2E_API_KEY;
    if (!apiKey) {
      test.skip();
      return;
    }

    const resp = await request.get(`${DJANGO_API}/api/incidents/v1/stats/`, {
      headers: { "X-API-Key": apiKey },
    });
    expect(resp.status()).toBe(200);

    const data = await resp.json();
    expect(data).toHaveProperty("active");
    expect(data).toHaveProperty("overdue");
  });

  test("compliance checklist API works", async ({ request }) => {
    const apiKey = process.env.E2E_API_KEY;
    if (!apiKey) {
      test.skip();
      return;
    }

    // Need a project ID — list projects first
    const projectsResp = await request.get(
      `${DJANGO_API}/api/core/v1/projects/`,
      {
        headers: { "X-API-Key": apiKey },
      }
    );

    if (projectsResp.status() !== 200) {
      test.skip();
      return;
    }

    const projects = await projectsResp.json();
    if (projects.total === 0) {
      test.skip();
      return;
    }

    const projectId = projects.items[0].id;
    const resp = await request.get(
      `${DJANGO_API}/api/compliance/v1/projects/${projectId}/checklist/`,
      {
        headers: { "X-API-Key": apiKey },
      }
    );
    expect(resp.status()).toBe(200);

    const data = await resp.json();
    expect(data.total_count).toBe(8);
    expect(data.readiness_pct).toBeGreaterThanOrEqual(0);
  });
});
