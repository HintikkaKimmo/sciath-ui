import { test, expect } from "@playwright/test";

/**
 * E2E tests for the Scan Lifecycle & Export Workflows.
 *
 * Prerequisites:
 *   - Django backend running on :8000 with test data seeded
 *   - Next.js dev server on :3000 with NEXT_PUBLIC_AUTH_BYPASS=true
 *   - At least one Customer, Project, Scan in DB
 *
 * Seed test data:
 *   cd ../Sciath
 *   ./venv/bin/python manage.py seed_rpi4_demo
 */

const DJANGO_API = process.env.DJANGO_API_URL ?? "http://localhost:8000";

test.describe("Product Detail - New Scan Dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/products");
    await page.waitForLoadState("networkidle");

    // Click the first product to navigate to detail
    const firstProduct = page.locator("tbody tr a").first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState("networkidle");
    }
  });

  test("New Scan button opens dialog", async ({ page }) => {
    const newScanBtn = page.locator("button:has-text('New Scan')");
    await expect(newScanBtn).toBeVisible();

    await newScanBtn.click();

    const dialogTitle = page.locator("[role='dialog'] h2, [role='dialog'] h3").filter({ hasText: "New Scan" });
    await expect(dialogTitle).toBeVisible({ timeout: 2000 });
  });

  test("dialog shows SBOM upload drop zone", async ({ page }) => {
    const newScanBtn = page.locator("button:has-text('New Scan')");
    await newScanBtn.click();

    // Drop zone should be visible
    const dropZone = page.locator("text=Drop build artifacts here");
    await expect(dropZone).toBeVisible({ timeout: 2000 });
  });

  test("dialog validates required fields", async ({ page }) => {
    const newScanBtn = page.locator("button:has-text('New Scan')");
    await newScanBtn.click();

    // Try submitting without filling anything
    const submitBtn = page.locator("button:has-text('Create Scan')");
    await submitBtn.click();

    // Should show validation error
    const error = page.locator("text=Version label is required");
    await expect(error).toBeVisible({ timeout: 2000 });
  });

  test("dialog shows Advanced Options toggle", async ({ page }) => {
    const newScanBtn = page.locator("button:has-text('New Scan')");
    await newScanBtn.click();

    const advancedToggle = page.locator("text=Advanced Options");
    await expect(advancedToggle).toBeVisible();

    // Click to expand
    await advancedToggle.click();

    // Should show kconfig and DTB inputs
    const kconfigLabel = page.locator("text=Kernel Config");
    await expect(kconfigLabel).toBeVisible({ timeout: 1000 });
  });

  test("analysis settings callout is visible", async ({ page }) => {
    const newScanBtn = page.locator("button:has-text('New Scan')");
    await newScanBtn.click();

    const analyseCheckbox = page.locator("text=Run analysis after creation");
    await expect(analyseCheckbox).toBeVisible();

    const carryForward = page.locator("text=Carry forward previous assessments");
    await expect(carryForward).toBeVisible();
  });
});

test.describe("Scan Detail - Status & Tabs", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product with scans
    await page.goto("/en/products");
    await page.waitForLoadState("networkidle");

    // Click first product
    const firstProduct = page.locator("tbody tr a").first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState("networkidle");
    }

    // Click first scan
    const firstScan = page.locator("tbody tr a").first();
    if (await firstScan.isVisible()) {
      await firstScan.click();
      await page.waitForLoadState("networkidle");
    }
  });

  test("scan detail page loads with title", async ({ page }) => {
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Scan");
  });

  test("tab navigation is visible for triage/complete scans", async ({
    page,
  }) => {
    // If scan is in triage or complete state, tabs should be visible
    const assessmentsTab = page.locator("[role='tab']:has-text('Assessments')");
    const componentsTab = page.locator("[role='tab']:has-text('Components')");
    const reportsTab = page.locator("[role='tab']:has-text('Reports')");

    const hasTabs = await assessmentsTab.isVisible().catch(() => false);
    if (hasTabs) {
      await expect(componentsTab).toBeVisible();
      await expect(reportsTab).toBeVisible();
    }
  });

  test("switching to Components tab loads component table", async ({
    page,
  }) => {
    const componentsTab = page.locator("[role='tab']:has-text('Components')");
    if (await componentsTab.isVisible().catch(() => false)) {
      await componentsTab.click();

      // Should show either a table or empty state
      const table = page.locator("table");
      const emptyState = page.locator("text=No components found");
      const isTable = await table.isVisible().catch(() => false);
      const isEmpty = await emptyState.isVisible().catch(() => false);

      expect(isTable || isEmpty).toBeTruthy();

      // URL should update with tab param
      await expect(page).toHaveURL(/tab=components/);
    }
  });

  test("switching to Reports tab loads reports view", async ({ page }) => {
    const reportsTab = page.locator("[role='tab']:has-text('Reports')");
    if (await reportsTab.isVisible().catch(() => false)) {
      await reportsTab.click();

      // Should show either reports table, empty state, or generate button
      const generateBtn = page.locator("text=Generate Report");
      const noReports = page.locator("text=No reports yet");
      const table = page.locator("table");

      const hasGenerate = await generateBtn.isVisible().catch(() => false);
      const hasEmpty = await noReports.isVisible().catch(() => false);
      const hasTable = await table.isVisible().catch(() => false);

      expect(hasGenerate || hasEmpty || hasTable).toBeTruthy();

      // URL should update
      await expect(page).toHaveURL(/tab=reports/);
    }
  });

  test("tab state persists in URL", async ({ page }) => {
    const componentsTab = page.locator("[role='tab']:has-text('Components')");
    if (await componentsTab.isVisible().catch(() => false)) {
      await componentsTab.click();
      await expect(page).toHaveURL(/tab=components/);

      // Reload and check tab is still active
      await page.reload();
      await page.waitForLoadState("networkidle");

      const activeTab = page.locator("[role='tab'][data-selected]");
      if (await activeTab.isVisible().catch(() => false)) {
        await expect(activeTab).toContainText("Components");
      }
    }
  });
});

test.describe("Scan Detail - Export Dropdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/products");
    await page.waitForLoadState("networkidle");

    const firstProduct = page.locator("tbody tr a").first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState("networkidle");
    }

    const firstScan = page.locator("tbody tr a").first();
    if (await firstScan.isVisible()) {
      await firstScan.click();
      await page.waitForLoadState("networkidle");
    }
  });

  test("export dropdown shows format options", async ({ page }) => {
    const exportBtn = page.locator("button:has-text('Export'), [data-slot='dropdown-menu-trigger']:has-text('Export')");
    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();

      const vexOption = page.locator("text=VEX (CycloneDX)");
      await expect(vexOption).toBeVisible({ timeout: 2000 });

      const sbomOption = page.locator("[role='menuitem']:has-text('SBOM (CycloneDX)')");
      await expect(sbomOption).toBeVisible();

      const evidenceOption = page.locator("text=Evidence Pack");
      await expect(evidenceOption).toBeVisible();
    }
  });
});

test.describe("Findings - CSV Export", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/findings");
    await page.waitForLoadState("networkidle");
  });

  test("export CSV button is visible", async ({ page }) => {
    const exportBtn = page.locator("button:has-text('Export CSV')");
    await expect(exportBtn).toBeVisible();
  });

  test("export CSV button is disabled when no findings match", async ({
    page,
  }) => {
    // Apply a filter that matches nothing
    const searchInput = page.locator("input[placeholder*='Search']");
    await searchInput.fill("zzz-nonexistent-cve-zzz");

    // Wait for filtering
    await page.waitForTimeout(500);

    const exportBtn = page.locator("button:has-text('Export CSV')");
    if (await exportBtn.isVisible()) {
      await expect(exportBtn).toBeDisabled();
    }
  });

  test("no console errors on findings page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/en/findings");
    await page.waitForLoadState("networkidle");

    const realErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("HMR") &&
        !e.includes("hydration")
    );
    expect(realErrors).toHaveLength(0);
  });
});

test.describe("Scan Detail - Draft/Failed Status Banner", () => {
  // These tests require a scan in draft or failed status
  // The ScanStatusBanner only shows for draft/failed scans

  test("draft scan shows Run Analysis button", async ({ page }) => {
    // Navigate to a draft scan if available
    // This test gracefully skips if no draft scans exist
    await page.goto("/en/products");
    await page.waitForLoadState("networkidle");

    const firstProduct = page.locator("tbody tr a").first();
    if (!(await firstProduct.isVisible().catch(() => false))) return;

    await firstProduct.click();
    await page.waitForLoadState("networkidle");

    // Look for a scan in draft status (version column might show "draft")
    const runAnalysisBtn = page.locator("button:has-text('Run Analysis')");
    const hasDraft = await runAnalysisBtn.isVisible().catch(() => false);

    if (hasDraft) {
      await expect(runAnalysisBtn).toBeEnabled();
      const carryForward = page.locator(
        "text=Carry forward previous assessments"
      );
      await expect(carryForward).toBeVisible();
    }
  });
});

test.describe("API Health - Scan Lifecycle", () => {
  test("scans API returns valid JSON", async ({ request }) => {
    const apiKey = process.env.E2E_API_KEY;
    if (!apiKey) {
      test.skip();
      return;
    }

    const resp = await request.get(`${DJANGO_API}/api/core/v1/scans/`, {
      headers: { "X-API-Key": apiKey },
    });
    expect(resp.status()).toBe(200);

    const data = await resp.json();
    expect(data).toHaveProperty("items");
    expect(data).toHaveProperty("total");
  });

  test("components API returns valid JSON", async ({ request }) => {
    const apiKey = process.env.E2E_API_KEY;
    if (!apiKey) {
      test.skip();
      return;
    }

    const resp = await request.get(
      `${DJANGO_API}/api/core/v1/components/`,
      {
        headers: { "X-API-Key": apiKey },
      }
    );
    expect(resp.status()).toBe(200);

    const data = await resp.json();
    expect(data).toHaveProperty("items");
    expect(data).toHaveProperty("total");
  });

  test("reports API returns valid JSON", async ({ request }) => {
    const apiKey = process.env.E2E_API_KEY;
    if (!apiKey) {
      test.skip();
      return;
    }

    const resp = await request.get(
      `${DJANGO_API}/api/assessments/v1/reports/`,
      {
        headers: { "X-API-Key": apiKey },
      }
    );
    expect(resp.status()).toBe(200);

    const data = await resp.json();
    expect(data).toHaveProperty("items");
  });
});
