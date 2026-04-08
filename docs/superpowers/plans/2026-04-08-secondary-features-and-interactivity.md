# Secondary Features & Interactivity Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close remaining feature gaps (global search, advanced findings filters, assessment disputes, filter policy CRUD, dashboard stats, intelligence sync trigger) and add interactivity improvements that leverage React capabilities beyond what HTMX templates could do.

**Architecture:** Each feature is a self-contained UI component or page enhancement. All API endpoints exist. Several features benefit from React patterns that weren't possible in Django templates: optimistic updates, inline editing, real-time search, animated transitions, drag-and-drop.

**Tech Stack:** Next.js 15 (App Router), React Query v5, next-intl, Tailwind v4, shadcn/ui (Command palette, Sheet, Dialog, Popover), Lucide icons, cmdk (command palette).

**Interactivity philosophy:** The Django templates were minimum-functional HTMX partials. Now in React we can add: command palette search (Cmd+K), inline status editing, optimistic updates on mutations, animated state transitions, toast notifications for async operations, and real-time polling. These aren't gold-plating — they're the standard users expect from a modern SaaS.

---

## Overview of Changes

| Task | What | Files |
|------|------|-------|
| 1 | Global search (Cmd+K command palette) | Create: `src/components/command-palette.tsx` |
| 2 | Findings: advanced filters | Modify: findings page |
| 3 | Assessment dispute flow | Create: `src/components/assessment-dispute-dialog.tsx` |
| 4 | Filter policy CRUD | Modify: filters settings page |
| 5 | Dashboard stats (CVE counts, triage, noise%) | Modify: dashboard page |
| 6 | Intelligence sync trigger | Modify: intelligence page |
| 7 | Inline justification editing on triage | Modify: triage table |
| 8 | Toast notifications for async ops | Create: `src/components/ui/toast.tsx` + provider |

---

### Task 1: Global Search — Command Palette (Cmd+K)

**Goal:** Replace Django's full-text search page with a command palette overlay (like GitHub's Cmd+K, Linear's Cmd+K). This is a major interactivity improvement — instant search without page navigation.

**API:** `GET /api/proxy/search/v1/search/?q=X` returns `{ products, cves, components, licenses, assessments, has_results }`.

**Files:**
- Create: `src/components/command-palette.tsx`
- Create: `src/services/search.ts`
- Create: `src/hooks/use-search.ts`
- Modify: `src/app/[locale]/(app)/layout.tsx` (mount palette globally)

- [ ] **Step 1: Create search service**

```tsx
// src/services/search.ts
import { apiFetch, buildQuery } from "@/lib/api";

export type SearchResponse = {
  products: { id: string; name: string; description: string }[];
  cves: { vuln_id: string; description: string; component_name: string; scan_id: string }[];
  components: { id: string; name: string; version: string; cpe: string; project_name: string }[];
  licenses: string[];
  assessments: { id: string; vulnerability_vuln_id: string; justification_text: string; status: string; project_name: string }[];
  has_results: boolean;
};

export function search(query: string) {
  return apiFetch<SearchResponse>(`/search/v1/search/${buildQuery({ q: query })}`);
}
```

- [ ] **Step 2: Create search hook with debounce**

```tsx
// src/hooks/use-search.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { search } from "@/services/search";

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => search(query),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}
```

- [ ] **Step 3: Create command palette component**

Install cmdk: `npm install cmdk`

Create `src/components/command-palette.tsx`:
- Listens for Cmd+K (Mac) / Ctrl+K (Windows) globally
- Shows a centered overlay with search input
- Debounced search (300ms) using the `useSearch` hook
- Results grouped by category (Products, CVEs, Components) with icons
- Arrow key navigation, Enter to select
- Navigates to the relevant page on selection:
  - Product → `/products/{id}`
  - CVE → link to scan detail with that CVE
  - Component → link to scan detail components tab
- Shows "No results" or "Type to search..." states
- Keyboard shortcut hint in the app sidebar: small `⌘K` badge

- [ ] **Step 4: Mount in app layout**

In `src/app/[locale]/(app)/layout.tsx`, add `<CommandPalette />` alongside the sidebar provider.

- [ ] **Step 5: Commit**

```bash
git add src/services/search.ts src/hooks/use-search.ts src/components/command-palette.tsx "src/app/[locale]/(app)/layout.tsx" messages/en.json messages/de.json
git commit -m "feat: add Cmd+K command palette for global search"
```

---

### Task 2: Findings — Advanced Filters

**Goal:** Add the filters that exist in Django but are missing in Next.js: severity range, KEV only, EPSS threshold, filter layer, product filter.

**Files:**
- Modify: `src/app/[locale]/(app)/findings/page.tsx`

- [ ] **Step 1: Add filter state and UI**

Current findings page has: text search + status filter. Add:

- **Severity dropdown:** All / Critical (>=9) / High (7-8.9) / Medium (4-6.9) / Low (<4)
- **KEV toggle:** checkbox "Known Exploited only"
- **Layer dropdown:** All / Kconfig / Device Tree / Patch / BusyBox / PACKAGECONFIG / Deployment / Custom
- **Product dropdown:** populated from `useProjects()` hook
- **EPSS threshold:** input for minimum EPSS score (0-1)

These filters are passed to the assessments API via `useAssessments(params)`. The API already supports these filter params.

Update the filter bar to have a "More filters" expandable section for the less common filters (KEV, EPSS, layer) to keep the default view clean.

- [ ] **Step 2: Add server-side pagination**

Replace the current `limit: 500` client-side approach with proper server-side pagination (50 per page) with Previous/Next buttons, matching the audit log pattern.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(app)/findings/page.tsx" messages/en.json messages/de.json
git commit -m "feat: add advanced filters and server-side pagination to findings"
```

---

### Task 3: Assessment Dispute Flow

**Goal:** Add a dispute dialog to the triage table. When an analyst disagrees with an automated assessment, they can file a dispute with a reason and category.

**API:** `POST /assessments/v1/assessments/{id}/dispute/` (needs creation — check if exists first)

**Files:**
- Create: `src/components/assessment-dispute-dialog.tsx`
- Modify: `src/components/triage/triage-table.tsx` (add dispute button per row)

- [ ] **Step 1: Create dispute dialog**

Create `src/components/assessment-dispute-dialog.tsx`:

Props: `{ assessmentId: string; cveId: string; open: boolean; onOpenChange: (open: boolean) => void }`

Layout:
- Dialog with title "Dispute Assessment — {cveId}"
- Category dropdown: False Positive, Code Not Present, Code Not Reachable, Inline Mitigation, Other
- Reason textarea (min 20 chars, with character count)
- Submit button
- On success: close dialog, invalidate assessment queries, show toast

- [ ] **Step 2: Add dispute button to triage table**

In the triage table, add a small flag/alert icon button next to the audit trail (History) button. Only show for auto-assessed rows (where `review_status === "auto_pending"` or similar).

- [ ] **Step 3: Commit**

```bash
git add src/components/assessment-dispute-dialog.tsx src/components/triage/triage-table.tsx messages/en.json messages/de.json
git commit -m "feat: add assessment dispute dialog to triage table"
```

---

### Task 4: Filter Policy CRUD

**Goal:** Wire up the create, edit, and delete actions on the filter policies settings page. Add VEX import dialog.

**Services already exist:** `createPolicy()`, `updatePolicy()`, `deletePolicy()`, `importVexPolicy()` in `src/services/policies.ts`.

**Files:**
- Modify: `src/app/[locale]/(app)/settings/filters/page.tsx`
- Create: `src/components/filter-policy-dialog.tsx` (create/edit)
- Create: `src/components/vex-import-dialog.tsx`

- [ ] **Step 1: Create filter policy dialog (create + edit)**

Create `src/components/filter-policy-dialog.tsx`:

Props: `{ mode: "create" | "edit"; policy?: FilterPolicy; open: boolean; onOpenChange: (open: boolean) => void }`

Form fields:
- Name (required, text input)
- Description (optional, textarea)
- Filter rules file (JSON upload, required for create, optional for edit)
- On file upload: validate JSON client-side, show preview of rule count

On submit:
- Create mode: call `createPolicy({ name, description, content_raw: parsedJson })`
- Edit mode: call `updatePolicy(policy.id, { name, description, content_raw: parsedJson })`

- [ ] **Step 2: Create VEX import dialog**

Create `src/components/vex-import-dialog.tsx`:

Props: `{ open: boolean; onOpenChange: (open: boolean) => void }`

Form fields:
- Policy name (required)
- Description (optional)
- VEX file upload (CycloneDX JSON)
- Trust vendor checkbox (admin only — higher confidence if checked)

On submit: call `importVexPolicy({ name, description, vex_content, trust_vendor })`

- [ ] **Step 3: Wire to filters page**

In the filters settings page:
- "New Policy" button → opens create dialog
- "Import VEX" button → opens VEX import dialog
- Each policy row: edit icon → opens edit dialog, delete icon → confirmation then `deletePolicy()`
- After each mutation: invalidate `queryKeys.policies.all`

- [ ] **Step 4: Commit**

```bash
git add src/components/filter-policy-dialog.tsx src/components/vex-import-dialog.tsx "src/app/[locale]/(app)/settings/filters/page.tsx" messages/en.json messages/de.json
git commit -m "feat: add filter policy CRUD and VEX import dialogs"
```

---

### Task 5: Dashboard Stats Enhancement

**Goal:** Add CVE-focused stats (total CVEs, KEV count, needs-triage, noise %) alongside the existing product list. Add compliance posture to product rows.

**API:** The dashboard stats can be derived from existing endpoints:
- `GET /scans/v1/{scanId}/status/` for per-scan stats
- Or add a dedicated `GET /core/v1/dashboard/stats/` endpoint

**Files:**
- Modify: `src/app/[locale]/(app)/dashboard/page.tsx`

- [ ] **Step 1: Add stat cards**

Add a top row of 4 stat cards above the products table:
- Total CVEs (sum of total_vulnerabilities across latest scans)
- Needs Triage (assessments with review_status=auto_pending)
- Suppressed % (noise reduction percentage)
- KEV Alerts (known exploited vulnerabilities)

These stats can be computed client-side from the projects + their latest scans data, or from a dedicated stats endpoint if one exists.

- [ ] **Step 2: Enhance product table**

Replace the basic product table columns (name, build system, arch, created) with:
- Product name
- Latest scan date
- Total CVEs / Remaining
- Critical + High count
- CRA readiness % (progress bar)
- Compliance posture badge (critical/pending/compliant)

Sort by urgency: critical > pending > compliant.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(app)/dashboard/page.tsx" messages/en.json messages/de.json
git commit -m "feat: add CVE stats and compliance posture to dashboard"
```

---

### Task 6: Intelligence Sync Trigger

**Goal:** Add "Trigger Sync" button on the intelligence page to manually refresh vulnerability data from NVD/EUVD/KEV.

**API:** `POST /sync/v1/trigger/{source}/` where source is `nvd`, `euvd`, or `kev`.

**Files:**
- Modify: `src/app/[locale]/(app)/intelligence/page.tsx`
- Add: `src/services/intelligence.ts` (add triggerSync function)

- [ ] **Step 1: Add trigger sync service**

```tsx
export function triggerSync(source: string) {
  return apiFetch<{ status: string }>(`/sync/v1/trigger/${source}/`, { method: "POST" });
}
```

- [ ] **Step 2: Add sync buttons to intelligence page**

On each data source card, add a "Sync" button. On click, call `triggerSync(source)` and show a toast/inline success message. Disable button while mutation is pending.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(app)/intelligence/page.tsx" src/services/intelligence.ts messages/en.json messages/de.json
git commit -m "feat: add manual sync trigger to intelligence page"
```

---

### Task 7: Inline Justification Editing on Triage

**Goal:** When an analyst changes a CVE status in the triage table (via keyboard shortcut or click), show an inline justification popover where they can optionally add a justification category and text. This is a major UX improvement over Django where justification was a separate page.

**Files:**
- Create: `src/components/triage/justification-popover.tsx`
- Modify: `src/components/triage/triage-table.tsx`

- [ ] **Step 1: Create justification popover**

Create `src/components/triage/justification-popover.tsx`:

When a status change happens (via keyboard or click), show a small popover anchored to the row with:
- Status badge (already set)
- Justification category dropdown (Code Not Present, Code Not Reachable, Inline Mitigation, Requires Environment, Protected by Compiler, Protected by Runtime, Other)
- Justification text (optional textarea, 1-2 lines)
- "Save" button (sends the full update with status + justification)
- Auto-dismiss after 5 seconds if no interaction (status change already saved, justification is optional)

This makes the j/k/a/n/f/u keyboard flow even faster: change status → popover appears → optionally type justification → moves to next row.

- [ ] **Step 2: Commit**

```bash
git add src/components/triage/justification-popover.tsx src/components/triage/triage-table.tsx messages/en.json messages/de.json
git commit -m "feat: add inline justification popover to triage table"
```

---

### Task 8: Toast Notifications

**Goal:** Add a toast notification system for async operation feedback (scan created, report generated, export complete, etc.). Currently there's no user feedback for async mutations.

**Files:**
- Install shadcn toast: `npx shadcn@latest add toast` or create manually
- Create: `src/components/ui/toaster.tsx`
- Modify: `src/app/[locale]/(app)/layout.tsx` (mount toaster)

- [ ] **Step 1: Add toast component**

Use shadcn's Sonner integration or a simple custom toast. Mount `<Toaster />` in the app layout.

- [ ] **Step 2: Add toast calls to existing mutations**

Wire toast calls into the mutation `onSuccess` callbacks across the app:
- Scan created → "Scan created. Analysis starting..."
- Report generated → "Report ready for download"
- Assessment updated → Brief confirmation
- Policy created/updated/deleted → Confirmation
- Export complete → "Download started"

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/toaster.tsx "src/app/[locale]/(app)/layout.tsx"
git commit -m "feat: add toast notification system for async operation feedback"
```

---

## Summary

| Task | Feature | Depends On | Parallelizable |
|------|---------|------------|----------------|
| 1 | Cmd+K command palette | — | Yes |
| 2 | Findings advanced filters | — | Yes |
| 3 | Assessment dispute | — | Yes |
| 4 | Filter policy CRUD | — | Yes |
| 5 | Dashboard stats | — | Yes |
| 6 | Intelligence sync trigger | — | Yes |
| 7 | Inline justification popover | — | Yes |
| 8 | Toast notifications | — | Yes (do first, others use it) |

All tasks are independent. Recommended order: Task 8 (toasts) first since other tasks reference toast calls, then parallelize the rest.
