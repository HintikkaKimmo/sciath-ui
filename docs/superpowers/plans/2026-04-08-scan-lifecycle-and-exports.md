# Scan Lifecycle & Export Workflows — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the complete scan lifecycle in Next.js — SBOM upload, analysis triggering, scan detail tabs (components + reports), report generation/download, and all export actions — closing the critical feature gaps that block removing the Django UI.

**Architecture:** All API endpoints and service functions already exist. This plan adds only UI components that call existing services/hooks. The SBOM upload uses a dialog with file inputs and a multipart-style JSON body (the API accepts raw text, not multipart). Report generation uses polling via React Query's `refetchInterval`. Exports use direct download links or blob-to-file-save.

**Tech Stack:** Next.js 15 (App Router), React Query v5, next-intl, Tailwind v4, shadcn/ui (Dialog, Sheet, Select, Tabs), Lucide icons.

**Existing service layer (already implemented, DO NOT recreate):**
- `src/services/scans.ts` — `createScan()`, `triggerAnalysis()`, `getScanStatus()`
- `src/services/reports.ts` — `generateReport()`, `downloadReport()`, `exportEvidence()`
- `src/hooks/use-scans.ts` — `useCreateScan()`, `useTriggerAnalysis()`, `useScanStatus(polling)`
- `src/services/policies.ts` — `listPolicies()` (for policy dropdown in upload modal)

---

## Overview of Changes

| Task | What | Files |
|------|------|-------|
| 1 | SBOM Upload Dialog (New Scan) | Create: `src/components/new-scan-dialog.tsx` |
| 2 | Wire upload dialog to product detail | Modify: `src/app/[locale]/(app)/products/[id]/page.tsx` |
| 3 | Scan detail: analysis trigger + status polling | Modify: `src/app/[locale]/(app)/products/[id]/scans/[scanId]/page.tsx` |
| 4 | Scan detail: Components tab | Create: `src/components/scan/components-tab.tsx` |
| 5 | Scan detail: Reports tab | Create: `src/components/scan/reports-tab.tsx` |
| 6 | Scan detail: tab switching layout | Modify: `src/app/[locale]/(app)/products/[id]/scans/[scanId]/page.tsx` |
| 7 | Findings CSV export | Modify: `src/app/[locale]/(app)/findings/page.tsx` |
| 8 | Quick SBOM/VEX export on scan detail | Modify: scan detail page (export dropdown) |
| 9 | i18n keys | Modify: `messages/en.json`, `messages/de.json` |

---

### Task 1: SBOM Upload Dialog

**Goal:** Dialog component for creating a new scan with SBOM upload, optional kconfig/DTB files, and optional custom filter policy selection.

**Files:**
- Create: `src/components/new-scan-dialog.tsx`

The API (`POST /core/v1/scans/`) accepts JSON with `sbom_raw` as a string (not multipart). Files are read client-side via `FileReader`, then the text content is sent as JSON fields.

- [ ] **Step 1: Add i18n keys for the dialog**

In `messages/en.json`, add under a new `"newScan"` namespace:

```json
"newScan": {
  "title": "New Scan",
  "versionLabel": "Version Label",
  "versionPlaceholder": "e.g. kirkstone-5.15.32-1.0.0",
  "sbomFile": "SBOM File",
  "sbomFormat": "SBOM Format",
  "sbomFormatAuto": "Auto-detect",
  "kconfigFile": "Kernel Config (.config)",
  "kconfigOptional": "Optional — enables Kconfig filter layer",
  "dtbFile": "Device Tree Source (.dts)",
  "dtbOptional": "Optional — enables DTB filter layer",
  "filterPolicy": "Custom Filter Policy",
  "filterPolicyNone": "None",
  "filterPolicyUpload": "Upload one-off filter file...",
  "filterFile": "Custom Filter File (JSON)",
  "submit": "Create Scan",
  "creating": "Creating...",
  "maxFileSize": "Maximum file size: 50 MB",
  "invalidJson": "Invalid JSON file",
  "fileTooLarge": "File exceeds 50 MB limit",
  "versionRequired": "Version label is required",
  "sbomRequired": "SBOM file is required",
  "success": "Scan created. Redirecting...",
  "analyseAfterCreate": "Run analysis after creation",
  "carryForward": "Carry forward previous assessments"
}
```

Add equivalent German translations in `messages/de.json`.

- [ ] **Step 2: Create the dialog component**

Create `src/components/new-scan-dialog.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import { useCreateScan, useTriggerAnalysis } from "@/hooks/use-scans";
import { listPolicies } from "@/services/policies";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";
```

Props: `{ projectId: string; open: boolean; onOpenChange: (open: boolean) => void }`

State:
- `versionLabel: string`
- `sbomContent: string | null` (read from file)
- `sbomFilename: string`
- `sbomFormat: string` (default empty = auto-detect)
- `kconfigContent: string | null`
- `dtbContent: string | null`
- `filterPolicyId: string` (empty = none, "upload" = one-off)
- `filterContent: string | null` (for one-off upload)
- `analyseAfterCreate: boolean` (default true)
- `carryForward: boolean` (default true)
- `error: string | null`

File reading helper:
```tsx
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 50 * 1024 * 1024) {
      reject(new Error("File exceeds 50 MB limit"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
```

SBOM format options:
```tsx
const SBOM_FORMATS = [
  { value: "", label: t("sbomFormatAuto") },
  { value: "cyclonedx", label: "CycloneDX (JSON)" },
  { value: "spdx", label: "SPDX (JSON)" },
  { value: "yocto_manifest", label: "Yocto Manifest" },
];
```

Use `useQuery` to fetch filter policies for the dropdown:
```tsx
const { data: policiesData } = useQuery({
  queryKey: queryKeys.policies.list(),
  queryFn: () => listPolicies(),
  enabled: open,
});
```

Submit handler:
```tsx
const createScan = useCreateScan();
const triggerAnalysis = useTriggerAnalysis();
const router = useRouter();

async function handleSubmit() {
  if (!versionLabel.trim()) { setError(t("versionRequired")); return; }
  if (!sbomContent) { setError(t("sbomRequired")); return; }

  try {
    const scan = await createScan.mutateAsync({
      project_id: projectId,
      version_label: versionLabel.trim(),
      sbom_raw: sbomContent,
      ...(sbomFormat && { sbom_format: sbomFormat }),
      ...(kconfigContent && { kconfig_raw: kconfigContent }),
      ...(dtbContent && { dtb_raw: dtbContent }),
      ...(filterPolicyId && filterPolicyId !== "upload" && { policy_name: filterPolicyId }),
      ...(filterContent && { custom_filter_raw: filterContent }),
    });

    if (analyseAfterCreate) {
      await triggerAnalysis.mutateAsync({
        scanId: scan.id,
        carryForward,
      });
    }

    onOpenChange(false);
    router.push(`/products/${projectId}/scans/${scan.id}`);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to create scan");
  }
}
```

Layout: Dialog with form fields:
- Version label input (required)
- SBOM file input (required) with format override dropdown
- Kconfig file input (optional, with help text)
- DTB file input (optional, with help text)
- Filter policy select: None / saved policies / "Upload one-off..."
- If "Upload one-off": filter file input
- Checkbox: "Run analysis after creation" (default checked)
- If analysis enabled: checkbox "Carry forward previous assessments" (default checked)
- Error banner if error state
- Submit button with loading state

Styling: Follow existing dialog patterns. Use `space-y-4` for form sections, `text-xs text-muted-foreground` for help text, file inputs with `className="h-8 text-sm"`.

- [ ] **Step 3: Commit**

```bash
git add src/components/new-scan-dialog.tsx messages/en.json messages/de.json
git commit -m "feat: add SBOM upload dialog component for new scan creation"
```

---

### Task 2: Wire Upload Dialog to Product Detail

**Files:**
- Modify: `src/app/[locale]/(app)/products/[id]/page.tsx`

- [ ] **Step 1: Add dialog state and import**

In the product detail page, add:
```tsx
import { NewScanDialog } from "@/components/new-scan-dialog";
// ... inside component:
const [showNewScan, setShowNewScan] = useState(false);
```

Replace the existing "New Scan" button:
```tsx
<Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => setShowNewScan(true)}>
  <Play className="h-3 w-3" />
  New Scan
</Button>
```

Add the dialog at the bottom of the JSX:
```tsx
<NewScanDialog
  projectId={id}
  open={showNewScan}
  onOpenChange={setShowNewScan}
/>
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/[locale]/(app)/products/[id]/page.tsx"
git commit -m "feat: wire SBOM upload dialog to product detail page"
```

---

### Task 3: Scan Detail — Analysis Trigger + Status Polling

**Goal:** Add "Run Analysis" button for draft/failed scans, and auto-poll status during analysis.

**Files:**
- Modify: `src/app/[locale]/(app)/products/[id]/scans/[scanId]/page.tsx`

- [ ] **Step 1: Add analysis trigger UI**

Import `useTriggerAnalysis` and `useScanStatus` (already available from hooks).

Add status-based rendering:
- If `scan.status === "draft"` or `scan.status === "failed"`: show "Run Analysis" button with carry-forward checkbox
- If `scan.status === "analysing"`: show spinner with progress text, enable polling via `useScanStatus(scanId, true)`
- If `scan.status === "triage"` or `scan.status === "complete"`: show the triage table (current behavior)

Add a status banner component inline:
```tsx
function ScanStatusBanner({ scan, scanId }: { scan: Scan; scanId: string }) {
  const triggerAnalysis = useTriggerAnalysis();
  const [carryForward, setCarryForward] = useState(true);
  const { data: status } = useScanStatus(scanId, scan.status === "analysing");

  if (scan.status === "draft" || scan.status === "failed") {
    return (
      <div className="bg-card border rounded-md p-4 space-y-3">
        <p className="text-sm">{scan.status === "failed" ? status?.error_message || "Analysis failed" : "Scan is in draft. Run analysis to process the SBOM."}</p>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={carryForward} onChange={(e) => setCarryForward(e.target.checked)} />
          Carry forward previous assessments
        </label>
        <Button size="sm" className="h-7 text-xs" onClick={() => triggerAnalysis.mutate({ scanId, carryForward })} disabled={triggerAnalysis.isPending}>
          {triggerAnalysis.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Run Analysis"}
        </Button>
      </div>
    );
  }

  if (scan.status === "analysing") {
    return (
      <div className="bg-card border rounded-md p-4 flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <div>
          <p className="text-sm font-medium">Analysis in progress...</p>
          <p className="text-xs text-muted-foreground">
            {status?.total_components ? `${status.total_components} components, ${status.total_vulnerabilities} CVEs so far` : "Processing SBOM..."}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
```

Add `<ScanStatusBanner scan={scan} scanId={scanId} />` before the triage table. When analysis completes (status changes from "analysing"), React Query will invalidate and the page will re-render with assessment data.

- [ ] **Step 2: Add i18n keys for scan status**

Add to `messages/en.json` under `"scan"`:
```json
"draftMessage": "Scan is in draft. Run analysis to process the SBOM.",
"failedMessage": "Analysis failed. You can retry.",
"runAnalysis": "Run Analysis",
"analysing": "Analysis in progress...",
"analysingDetail": "{components} components, {cves} CVEs processed so far",
"processingSbom": "Processing SBOM...",
"carryForward": "Carry forward previous assessments"
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(app)/products/[id]/scans/[scanId]/page.tsx" messages/en.json messages/de.json
git commit -m "feat: add analysis trigger and status polling to scan detail"
```

---

### Task 4: Components Tab

**Goal:** Table of components for a scan with type filter and identity review flag.

**Files:**
- Create: `src/components/scan/components-tab.tsx`
- Modify: `src/lib/api.ts` (add components query key)

- [ ] **Step 1: Add service and hook**

The components API is at `GET /core/v1/components/?scan_id=X`. Add to `src/services/scans.ts` (or a new `src/services/components.ts`):

```tsx
export type ComponentSchema = components["schemas"]["ComponentSchema"];
export type PaginatedComponents = components["schemas"]["PaginatedComponents"];

export function listComponents(params?: PaginationParams & { scan_id?: string; component_type?: string; identity_needs_review?: boolean }) {
  return apiFetch<PaginatedComponents>(`/core/v1/components/${buildQuery(params)}`);
}
```

Add query key to `src/lib/api.ts`:
```tsx
components: {
  all: ["components"] as const,
  list: (params?: Record<string, string>) =>
    [...queryKeys.components.all, "list", params] as const,
},
```

- [ ] **Step 2: Create components tab component**

Create `src/components/scan/components-tab.tsx`:

Props: `{ scanId: string }`

Displays a table with columns: Name, Version, Type, CPE, License, Identity Review (badge if flagged).

Filters: component_type dropdown, identity_needs_review checkbox.

Use existing table styling patterns (bg-card border rounded-md, thead bg-secondary/30, etc.).

- [ ] **Step 3: Commit**

```bash
git add src/components/scan/components-tab.tsx src/lib/api.ts messages/en.json messages/de.json
git commit -m "feat: add components tab for scan detail"
```

---

### Task 5: Reports Tab

**Goal:** Generate compliance reports, track generation status, download completed reports.

**Files:**
- Create: `src/components/scan/reports-tab.tsx`

- [ ] **Step 1: Create reports tab component**

Create `src/components/scan/reports-tab.tsx`:

Props: `{ scanId: string }`

Uses:
- `useQuery` to fetch reports for this scan: `listReports({ scan_id: scanId })`
- `useMutation` wrapping `generateReport(scanId, format)`
- Polling: if any report has status `"generating"`, poll with `refetchInterval: 3000`

Layout:
- "Generate Report" button with format dropdown (Article 13 PDF, VEX CycloneDX, VEX CSAF, SBOM CycloneDX, SBOM SPDX, SARIF)
- Table of existing reports: Format (badge), Status (generating/ready/failed with color), Generated At, Download button
- Download button calls `downloadReport(reportId)` and triggers browser file save

Report format options:
```tsx
const REPORT_FORMATS = [
  { value: "article13", label: "Article 13 (PDF)" },
  { value: "vex_cdx", label: "VEX (CycloneDX)" },
  { value: "vex_csaf", label: "VEX (CSAF)" },
  { value: "sbom_cdx", label: "SBOM (CycloneDX)" },
  { value: "sbom_spdx", label: "SBOM (SPDX)" },
  { value: "sarif", label: "SARIF" },
];
```

Download helper:
```tsx
async function handleDownload(reportId: string, filename: string) {
  const blob = await downloadReport(reportId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/scan/reports-tab.tsx messages/en.json messages/de.json
git commit -m "feat: add reports tab with generation, polling, and download"
```

---

### Task 6: Tab Switching on Scan Detail

**Goal:** Add tab navigation (Assessments | Components | Reports) to the scan detail page.

**Files:**
- Modify: `src/app/[locale]/(app)/products/[id]/scans/[scanId]/page.tsx`

- [ ] **Step 1: Add tab state and imports**

```tsx
import { ComponentsTab } from "@/components/scan/components-tab";
import { ReportsTab } from "@/components/scan/reports-tab";

// Inside component:
const [activeTab, setActiveTab] = useState<"assessments" | "components" | "reports">("assessments");
```

Replace the flat triage table render with tab navigation:

```tsx
{/* Tab bar */}
<div className="flex gap-1 border-b">
  {(["assessments", "components", "reports"] as const).map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
        activeTab === tab
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {t(`tabs.${tab}`)}
    </button>
  ))}
</div>

{/* Tab content */}
{activeTab === "assessments" && (
  <>
    {waterfallStages.length > 0 && <VexWaterfall ... />}
    <TriageTable cves={cves} onStatusChange={handleStatusChange} />
  </>
)}
{activeTab === "components" && <ComponentsTab scanId={scanId} />}
{activeTab === "reports" && <ReportsTab scanId={scanId} />}
```

- [ ] **Step 2: Add i18n keys**

Add to `messages/en.json` under `"scan"`:
```json
"tabs": {
  "assessments": "Assessments",
  "components": "Components",
  "reports": "Reports"
}
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(app)/products/[id]/scans/[scanId]/page.tsx" messages/en.json messages/de.json
git commit -m "feat: add tab navigation to scan detail (assessments, components, reports)"
```

---

### Task 7: Findings CSV Export

**Goal:** Add CSV export button to the findings page.

**Files:**
- Modify: `src/app/[locale]/(app)/findings/page.tsx`

- [ ] **Step 1: Add export button**

The API endpoint `GET /core/v1/activity/export/csv/` exists for audit, but findings export goes through `GET /api/proxy/reports/v1/scans/{scanId}/export/?format=csv` or the dedicated findings CSV at a different path.

Looking at the Django view, findings CSV is at the `sciath_ui` level, not the API. But the scan-level CSV export is available at `GET /reports/v1/scans/{scanId}/export/?format=vex_cdx`.

For cross-product findings, there's no API-level CSV endpoint yet. Add a simple "Export CSV" button that opens `window.open("/api/proxy/core/v1/activity/export/csv/")` — wait, that's activity not findings.

**Alternative approach:** Client-side CSV generation from the currently loaded findings data. This is simpler and doesn't require a backend change:

```tsx
function exportToCsv(assessments: Assessment[]) {
  const headers = ["CVE ID", "CVSS", "Component", "Status", "Filter Layer", "Product"];
  const rows = assessments.map(a => [
    a.vulnerability?.vuln_id ?? "",
    a.vulnerability?.cvss_score?.toString() ?? "",
    a.vulnerability?.component?.name ?? "",
    a.status,
    a.filter_layer ?? "",
    a.project_name ?? "",
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sciath-findings-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

Add a "Export CSV" button in the findings page header next to the search bar.

- [ ] **Step 2: Commit**

```bash
git add "src/app/[locale]/(app)/findings/page.tsx" messages/en.json messages/de.json
git commit -m "feat: add CSV export to findings page"
```

---

### Task 8: Quick SBOM/VEX Export on Scan Detail

**Goal:** Add export dropdown to scan detail header for quick SBOM/VEX/SARIF downloads + evidence pack ZIP.

**Files:**
- Modify: `src/app/[locale]/(app)/products/[id]/scans/[scanId]/page.tsx`

- [ ] **Step 1: Replace the "Export VEX" button with an export dropdown**

The current scan detail has a single "Export VEX" button. Replace it with a dropdown:

```tsx
const [showExportMenu, setShowExportMenu] = useState(false);

const EXPORT_FORMATS = [
  { value: "vex_cdx", label: "VEX (CycloneDX)", ext: "vex.json" },
  { value: "sbom_cdx", label: "SBOM (CycloneDX)", ext: "sbom.json" },
  { value: "sbom_vex_cdx", label: "SBOM+VEX (CycloneDX)", ext: "sbom-vex.json" },
  { value: "sbom_spdx", label: "SBOM (SPDX)", ext: "sbom.spdx.json" },
  { value: "sarif", label: "SARIF", ext: "sarif.json" },
];

async function handleExport(format: string, ext: string) {
  const res = await fetch(`/api/proxy/reports/v1/scans/${scanId}/export/?format=${format}`, {
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sciath-${project?.name ?? "scan"}-${scan.version_label ?? scanId}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

async function handleEvidencePack() {
  const blob = await exportEvidence(scanId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sciath-evidence-${project?.name ?? "scan"}-${scan.version_label ?? scanId}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
```

Replace the button with a dropdown menu using a simple `<div>` with `relative` positioning and click-outside handler, or use a `<select>` for simplicity.

- [ ] **Step 2: Add i18n keys**

Add to `messages/en.json` under `"scan"`:
```json
"export": "Export",
"exportVex": "VEX (CycloneDX)",
"exportSbom": "SBOM (CycloneDX)",
"exportSbomVex": "SBOM+VEX (CycloneDX)",
"exportSpdx": "SBOM (SPDX)",
"exportSarif": "SARIF",
"exportEvidencePack": "Evidence Pack (ZIP)"
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(app)/products/[id]/scans/[scanId]/page.tsx" messages/en.json messages/de.json
git commit -m "feat: add SBOM/VEX/SARIF export dropdown and evidence pack download"
```

---

### Task 9: Final i18n Pass

**Goal:** Ensure all new strings are in both en.json and de.json.

- [ ] **Step 1: Verify all new namespaces exist in de.json**

Check that `newScan`, `scan.tabs`, `scan.draftMessage`, etc. all have German equivalents.

- [ ] **Step 2: Commit if changes needed**

```bash
git add messages/de.json
git commit -m "chore(i18n): add German translations for scan lifecycle features"
```

---

## Summary

| Task | Component | Depends On |
|------|-----------|------------|
| 1 | SBOM Upload Dialog | — |
| 2 | Wire to product detail | Task 1 |
| 3 | Analysis trigger + polling | — |
| 4 | Components tab | — |
| 5 | Reports tab | — |
| 6 | Tab switching layout | Tasks 4, 5 |
| 7 | Findings CSV export | — |
| 8 | Scan export dropdown | — |
| 9 | i18n pass | All above |

Tasks 1, 3, 4, 5, 7, 8 are independent and can be parallelized.
Tasks 2 depends on 1. Task 6 depends on 4 and 5. Task 9 is final.

---

## Design Review Decisions (2026-04-08)

The following design decisions were made during /plan-design-review and MUST be followed during implementation.

### D1. SBOM Upload Dialog — Reorder fields + reuse file-upload.tsx

Reorder the dialog fields to match the analyst's mental model:

1. **SBOM drop zone first** (large, prominent) — reuse `src/components/upload/file-upload.tsx` which already has drag-and-drop, progress bar, format detection, error states. Extend it to support single-file mode and provide file content as text via callback.
2. **Version label second** (required metadata input)
3. **Optional files collapsed** under "Advanced Options" disclosure (Kconfig, DTB, filter policy)
4. **Analysis Settings in a callout box** — carry-forward checkbox is compliance-critical (controls whether prior analyst triage is preserved or silently lost). Elevate it visually, not a buried checkbox at the bottom.

On SBOM format auto-detect failure: highlight the format dropdown and prompt "Could not detect format. Please select manually." Don't require re-upload.

### D2. Status-aware tab defaults on scan detail

The default tab/view depends on scan status:
- `draft/failed` → Status banner is primary content, tabs hidden or dimmed
- `analysing` → Phased progress view (see D4), tabs visible but secondary
- `triage/complete` → Assessments tab active by default. Reports tab gets a notification badge when reports are ready.

### D3. Full interaction state coverage

Every new component must specify these states:

| Feature | Loading | Empty | Error | Success | Partial |
|---------|---------|-------|-------|---------|---------|
| Upload dialog file read | Spinner inside drop zone with filename | N/A | Inline banner + retry | Filename shown in file list | — |
| Upload dialog submit | "Creating..." button disabled | — | Inline error banner below form | Redirect to scan detail | — |
| Analysis polling | Phased progress (D4) | — | Error message + "Retry" button + download raw SBOM option | Transition to triage view | Live counters during processing |
| Components tab | `TableSkeleton` | "No components found. Run analysis to process the SBOM." + CTA button if draft | `ErrorState` with retry | Table renders | — |
| Reports tab | `TableSkeleton` | "No reports yet. Generate your first compliance report." + Generate button as primary CTA | `ErrorState` with retry | Table renders | Mixed: 1 generating + 2 ready (show both in table) |
| CSV export | Button shows spinner, disabled during export | Button disabled + tooltip "No findings match current filters" | Toast notification with retry action | File downloads, button resets to normal | — |
| SBOM/VEX export | DropdownMenu item shows spinner for active format | — | Toast notification with retry | File downloads | — |

### D4. Phased analysis progress

Replace the single spinner with a phased progress indicator:

- **Phases:** "Parsing SBOM" → "Matching CVEs" → "Scoring vulnerabilities" → "Complete"
- **Progress bar** based on component/CVE counts from the polling endpoint (`useScanStatus`)
- **Live counter:** "847 components, 341 CVEs processed so far"
- **`aria-live="polite"`** on the progress region for screen reader updates
- **On completion:** brief success state (1-2s) with checkmark before transitioning to triage view with assessments

### D5. Use shadcn Tabs + DropdownMenu

- **Tabs:** Replace hand-rolled `<button>` tab bar with shadcn `Tabs` component. Gets keyboard nav (arrow keys) and ARIA (`role="tablist"`, `role="tab"`, `role="tabpanel"`) for free.
- **Export dropdown:** Replace vague "div with relative positioning or select" with shadcn `DropdownMenu`. The export button in the scan detail header triggers a proper dropdown.
- **Tab state in URL:** Use `useSearchParams` (not `useState`) for the active tab. This makes tabs bookmarkable and shareable per DESIGN.md rule 5. Example URL: `/products/abc/scans/xyz?tab=reports`

### D6. DESIGN.md compliance

All new tables and components MUST include:

- **`font-mono`** (Geist Mono) on CPE strings, CVE-IDs, version strings in Components tab
- **`tabular-nums`** on CVSS score columns and any numeric data
- **`border-l-4`** severity left-border on component/assessment table rows (color-coded per DESIGN.md severity palette)
- **Status badges with icon prefix** — use CheckCircle2/AlertCircle/Clock icons alongside color for color-blind accessibility (DESIGN.md rule 4)
- **`overflow-x-auto`** wrapper on ALL data tables (DESIGN.md rule 7)
- **Dialog radius:** `rounded-xl` (12px, `--radius-xl` token)

### D7. CSV export shows visible limitation

The "Export CSV" button must show the count: **"Export CSV (500 of 3,241)"** when total exceeds loaded count. If total > loaded, show a confirmation before exporting: "This exports the current view only (500 items). For a complete export, use the scan-level VEX/SBOM export on the scan detail page."

### D8. Report generation throttle

- Disable the specific format option in the DropdownMenu while that format is generating
- Other formats remain available for concurrent generation
- Reports table shows "Generating..." status with `Loader2` spinner for in-progress items
- Failed reports show error status with "Retry" action

### D9. Fix existing i18n bug in scan detail

The scan detail page (`src/app/[locale]/(app)/products/[id]/scans/[scanId]/page.tsx` line 2) imports `Link` from `"next/link"` instead of `"@/i18n/navigation"`. Fix this in the first task that touches this file (Task 3).

### D10. Responsive + Accessibility

- **Dialog:** Full viewport on mobile (`max-h-[90vh]` with internal scroll), touch-friendly drop zone (44px min touch targets)
- **Tables:** `overflow-x-auto` wrapper. On narrow viewports, consider hiding low-priority columns (License, Identity Review) behind a "more" expansion
- **Tab bar:** `overflow-x-auto` on the tab list for long translated labels (German tends 30% longer)
- **Drop zone:** `role="button"` with `tabIndex={0}`, keyboard activation via Enter/Space
- **Progress region:** `aria-live="polite"` region wrapping the analysis progress
- **Form fields:** `aria-required="true"` on required inputs, `aria-invalid="true"` + `aria-describedby` on fields with validation errors
- **Export DropdownMenu:** Handled by shadcn (keyboard + ARIA included)

---

## NOT in design scope (explicitly deferred)

1. **Backend CSV endpoint for full findings export** — Client-side CSV with visible limitation warning for now
2. **Tab-specific keyboard shortcuts** — shadcn Tabs arrow keys are sufficient; existing j/k/a/n/f/u work in Assessments tab
3. **Report format previews** — No thumbnail of what each format produces
4. **Scan comparison from tab view** — Separate compare page exists at `/products/[id]/compare`

## Existing components to reuse

| Component | Path | Use for |
|-----------|------|---------|
| FileUpload | `src/components/upload/file-upload.tsx` | SBOM drop zone (extend for single-file + text content callback) |
| TableSkeleton | `src/components/ui/data-skeleton.tsx` | Loading state for Components + Reports tabs |
| DetailSkeleton | `src/components/ui/data-skeleton.tsx` | Loading state for scan detail page |
| ErrorState | `src/components/ui/error-state.tsx` | Error state for all tab data fetches |
| EmptyState | `src/components/ui/empty-state.tsx` | Empty state for Components + Reports tabs |
| Status badges | `src/app/[locale]/(app)/findings/page.tsx` | Reuse `statusStyle` pattern for report status badges |
| Severity colors | `src/app/[locale]/(app)/findings/page.tsx` | Reuse `getCvssColor`/`getSeverityBar` (consider extracting to shared util) |

## Eng Review Decisions (2026-04-08)

The following decisions were made during /plan-eng-review and MUST be followed during implementation.

### E1. Prerequisite: Install shadcn Tabs + DropdownMenu

Before any implementation, run:
```bash
npx shadcn@latest add tabs dropdown-menu
```
These are required for Task 6 (tab switching) and Task 8 (export dropdown).

### E2. ScanCreateSchema — pass empty strings for defaults

All fields in `ScanCreateSchema` are required in TypeScript (Django sets defaults server-side as `""`). The `createScan()` call must explicitly pass:
```tsx
status: "draft",
sbom_format: sbomFormat || "",
kconfig_raw: kconfigContent || "",
dtb_raw: dtbContent || "",
depgraph_raw: "",
custom_filter_raw: filterContent || "",
yocto_machine: "",
yocto_distro: "",
kernel_version: "",
```
Verified against Django schema at `api/routers/scans_crud.py:37-50`. Empty strings ARE the server defaults.

### E3. Extend FileUpload component (not create new)

Add two new optional props to `src/components/upload/file-upload.tsx`:
- `multiple?: boolean` (default `true`, set `false` for SBOM upload)
- `onFileContent?: (content: string, filename: string) => void` (reads file as text and passes content)

Existing callers are unaffected (both props are optional with backwards-compatible defaults).

### E4. Extract downloadBlob() utility

Add to `src/lib/utils.ts`:
```tsx
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```
Used by: reports-tab.tsx (Task 5), scan detail export (Task 8), findings CSV (Task 7).

### E5. Extract severity/status styling to shared util

Move from `src/app/[locale]/(app)/findings/page.tsx` to `src/lib/severity.ts`:
- `statusStyle` record
- `getCvssColor(cvss: number): string`
- `getSeverityBar(cvss: number): string`

Update findings/page.tsx to import from the new location. New components (components-tab, reports-tab) import from there too.

### E6. Toast notifications for download/export failures

All download/export calls (downloadReport, exportEvidence, CSV export, SBOM/VEX export) must be wrapped in try-catch with user-visible error feedback. Use `window.alert()` or install shadcn Toast (`npx shadcn@latest add toast`) for a polished experience.

### E7. Report polling timeout (5 minutes)

In reports-tab.tsx, track polling start time. After 5 minutes of polling with no status change from "generating", stop polling and show: "Report is taking longer than expected. Check back later or retry."

### E8. German translations deferred

Task 9 adds keys to `messages/en.json` only. German translations (`messages/de.json`) are deferred to a follow-up with a human translator. next-intl falls back to English for missing keys.

### E9. Add Playwright E2E test

Add `tests/e2e/scan-lifecycle.spec.ts` covering:
- Create scan via SBOM upload dialog
- Trigger analysis and see progress
- Switch between tabs (assessments, components, reports)
- Generate and download a report
- Export VEX/SBOM from dropdown

Follow the pattern in `tests/e2e/incidents.spec.ts`.

### E10. Task dependency order note

Task 6 (tab shell) can be built early since it's just the Tabs container with empty panes. Tasks 4 and 5 (components/reports tabs) are standalone components that slot in. Either order works. The plan's dependency (6 after 4,5) is valid but not strictly necessary.

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 2 | issues_found | Outside voice from Claude subagent |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 2 | CLEAR (PLAN) | 8 issues, 1 critical gap |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR (FULL) | score: 5/10 → 9/10, 12 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **CROSS-MODEL:** Outside voice flagged 7 items. 4 resolved (empty strings verified against Django, file size limit exists, services verified by E2E). 2 accepted (polling timeout added, German deferred). 1 noted (client-side CSV is intentional short-term, in TODOS).
- **UNRESOLVED:** 0 decisions across all reviews
- **VERDICT:** ENG + DESIGN CLEARED — ready to implement
