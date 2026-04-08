# Missing Next.js Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the remaining Next.js pages that replace Django template views, using existing templates as functional reference but following sciath-ui's design system and component patterns.

**Architecture:** Each page is a client component under `src/app/[locale]/(app)/`, using React Query hooks for data fetching, `useTranslations()` for i18n, and existing UI components (Button, Badge, Skeleton, ErrorState, EmptyState). New API calls go through the service/hook pattern.

**Tech Stack:** Next.js 16 (App Router), React Query v5, next-intl, Tailwind v4, Lucide icons, shadcn/ui components.

---

## Overview of Pages to Build

| Page | Django Template Reference | Django View Reference | API Endpoint |
|------|--------------------------|----------------------|--------------|
| Audit Log | `templates/ui/settings/audit.html` | `sciath_ui/views/settings/audit.py` | `GET /core/v1/activity/` (exists) + `GET /core/v1/activity/export/csv/` (new) |
| Compare Builds | `templates/ui/products/compare.html` | `sciath_ui/views/compare.py` | `GET /scans/v1/{project_id}/compare/` (new) |
| Trust Center | `templates/ui/trust_center.html` | `sciath_ui/views/trust_center.py` | `GET /trust-center/v1/{slug}/` (new, public) |
| Invite Accept | `templates/ui/invite_accept.html` | `sciath_ui/views/settings/team.py::invite_accept` | `POST /core/v1/team/invites/{id}/accept/` (needs API) |
| Assessment Audit Trail | `templates/ui/scans/_assessment_audit.html` | `sciath_ui/views/builds/detail.py::assessment_audit` | `GET /assessments/v1/audit-entries/` (exists) |

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/app/[locale]/(app)/settings/audit/page.tsx` | Audit log page |
| Create | `src/app/[locale]/(app)/products/[id]/compare/page.tsx` | Build comparison page |
| Create | `src/app/[locale]/(app)/trust-center/[slug]/page.tsx` | Trust center public page |
| Create | `src/app/[locale]/(auth)/invite/page.tsx` | Invite acceptance page |
| Create | `src/components/assessment-audit-modal.tsx` | Assessment audit trail modal |
| Modify | `src/services/activity.ts` | Add CSV export + filter params |
| Create | `src/services/compare.ts` | Build comparison API calls |
| Create | `src/services/trust-center.ts` | Trust center API calls |
| Create | `src/hooks/use-compare.ts` | React Query hook for compare |
| Create | `src/hooks/use-trust-center.ts` | React Query hook for trust center |
| Modify | `src/hooks/use-activity.ts` | Add filter params support |
| Modify | `src/lib/api.ts` | Add query keys for compare, trust-center |
| Modify | `messages/en.json` | Add translation keys for new pages |
| Modify | `messages/de.json` | Add translation keys for new pages |

---

### Task 1: Audit Log Page

**Django reference:**
- Template: `templates/ui/settings/audit.html` — table with timestamp, user, action, resource_type, resource_id, details columns. Filter dropdowns for user, action, resource_type. CSV export button.
- View: `sciath_ui/views/settings/audit.py::team_audit()` — paginates ActivityLog, provides filter dropdowns for users, actions, resource_types.
- View: `sciath_ui/views/settings/audit.py::team_audit_export()` — streams CSV with same filters.

**API endpoints (both exist):**
- `GET /api/core/v1/activity/?resource_type=X&action=X&user_id=X&limit=50&offset=0` — paginated list
- `GET /api/core/v1/activity/export/csv/?resource_type=X&action=X&user_id=X` — CSV download

**Files:**
- Modify: `src/services/activity.ts`
- Modify: `src/hooks/use-activity.ts`
- Create: `src/app/[locale]/(app)/settings/audit/page.tsx`
- Modify: `src/lib/api.ts` (add query keys)
- Modify: `messages/en.json`, `messages/de.json`

- [ ] **Step 1: Update activity service with filter params**

In `src/services/activity.ts`, add filter params and CSV export URL builder:

```typescript
export type ActivityFilterParams = PaginationParams & {
  resource_type?: string;
  action?: string;
  user_id?: string;
};

export function listActivity(params?: ActivityFilterParams) {
  return apiFetch<PaginatedActivityLogs>(
    `/core/v1/activity/${buildQuery(params)}`
  );
}

export function activityExportCsvUrl(params?: Omit<ActivityFilterParams, "limit" | "offset">) {
  return `/api/proxy/core/v1/activity/export/csv/${buildQuery(params)}`;
}
```

- [ ] **Step 2: Update activity hook with filter support**

In `src/hooks/use-activity.ts`, update to accept filters:

```typescript
export function useActivity(params?: ActivityFilterParams) {
  return useQuery({
    queryKey: queryKeys.activity.list(params as Record<string, string>),
    queryFn: () => listActivity(params),
  });
}
```

- [ ] **Step 3: Add translations**

In `messages/en.json`, add under a new `"settings.audit"` namespace:

```json
"settings.audit": {
  "title": "Audit Log",
  "description": "Activity history for your account",
  "filterUser": "Filter by user",
  "filterAction": "Filter by action",
  "filterResource": "Filter by resource",
  "exportCsv": "Export CSV",
  "timestamp": "Timestamp",
  "user": "User",
  "action": "Action",
  "resourceType": "Resource",
  "resourceId": "ID",
  "resourceLabel": "Label",
  "details": "Details",
  "noActivity": "No activity recorded yet",
  "allUsers": "All users",
  "allActions": "All actions",
  "allResources": "All resources"
}
```

Add equivalent German translations in `messages/de.json`.

- [ ] **Step 4: Create audit log page**

Create `src/app/[locale]/(app)/settings/audit/page.tsx`:

The page should have:
- Back link to `/settings` (like team page pattern)
- Title "Audit Log"
- Three filter dropdowns in a row: user, action, resource_type
- CSV export button (opens download URL in new tab)
- Paginated table: timestamp, user email, action, resource type, resource label, details (collapsed JSON)
- Pagination controls (Previous/Next buttons with offset-based navigation)
- Loading: `<TableSkeleton />`, Error: `<ErrorState />`, Empty: `<EmptyState />`
- Follow the pattern from `settings/team/page.tsx` for layout structure

**Key implementation details from Django view:**
- The Django view shows distinct action values and resource_types as dropdown options. In Next.js, either hardcode common values or extract distinct values from the first page load.
- Timestamp format: relative time ("2 minutes ago") with full ISO on hover
- Details column: show truncated JSON, expand on click

- [ ] **Step 5: Add audit to settings hub**

In `src/app/[locale]/(app)/settings/page.tsx`, add a link to the audit page alongside Team, API Keys, and Filters.

- [ ] **Step 6: Update middleware**

In `src/middleware.ts`, ensure `/settings/audit` is in the protected paths (it should be covered by `/settings` already).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: add audit log page with filters and CSV export"
```

---

### Task 2: Build Comparison Page

**Django reference:**
- Template: `templates/ui/products/compare.html` — scan selector form (two dropdowns), then delta tables for CVEs (new, resolved, status-changed) and components (added, removed, upgraded). Format mismatch warning. Carry-forward count.
- View: `sciath_ui/views/compare.py::compare_builds()` — accepts `?from=<scan_id>&to=<scan_id>`, computes set diffs in Python, renders template.

**API endpoint (new):**
- `GET /api/scans/v1/{project_id}/compare/?from_scan_id=X&to_scan_id=X`

Returns: `{ new_cves, resolved_cves, status_changed, unchanged_count, added_components, removed_components, upgraded_components, carried_count, format_mismatch }`

**Files:**
- Create: `src/services/compare.ts`
- Create: `src/hooks/use-compare.ts`
- Create: `src/app/[locale]/(app)/products/[id]/compare/page.tsx`
- Modify: `src/lib/api.ts` (add query keys)
- Modify: `messages/en.json`, `messages/de.json`

- [ ] **Step 1: Create compare service**

```typescript
// src/services/compare.ts
import { apiFetch, buildQuery } from "@/lib/api";

export type CompareAssessmentItem = {
  cve_id: string;
  status: string;
  cvss_score: number | null;
  component_name: string;
};

export type CompareStatusChange = {
  cve_id: string;
  from_status: string;
  to_status: string;
  cvss_score: number | null;
  component_name: string;
};

export type CompareComponentItem = {
  name: string;
  version: string;
};

export type CompareComponentUpgrade = {
  name: string;
  from_version: string;
  to_version: string;
};

export type CompareResponse = {
  from_scan_id: string;
  to_scan_id: string;
  new_cves: CompareAssessmentItem[];
  resolved_cves: CompareAssessmentItem[];
  status_changed: CompareStatusChange[];
  unchanged_count: number;
  added_components: CompareComponentItem[];
  removed_components: CompareComponentItem[];
  upgraded_components: CompareComponentUpgrade[];
  carried_count: number;
  format_mismatch: boolean;
};

export function compareBuilds(projectId: string, fromScanId: string, toScanId: string) {
  return apiFetch<CompareResponse>(
    `/scans/v1/${projectId}/compare/${buildQuery({ from_scan_id: fromScanId, to_scan_id: toScanId })}`
  );
}
```

- [ ] **Step 2: Create compare hook**

```typescript
// src/hooks/use-compare.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { compareBuilds } from "@/services/compare";
import { queryKeys } from "@/lib/api";

export function useCompareBuilds(projectId: string, fromScanId?: string, toScanId?: string) {
  return useQuery({
    queryKey: queryKeys.compare.detail(projectId, fromScanId!, toScanId!),
    queryFn: () => compareBuilds(projectId, fromScanId!, toScanId!),
    enabled: !!fromScanId && !!toScanId,
  });
}
```

- [ ] **Step 3: Add query keys**

In `src/lib/api.ts`, add to the `queryKeys` object:

```typescript
compare: {
  all: ["compare"] as const,
  detail: (projectId: string, fromId: string, toId: string) =>
    [...queryKeys.compare.all, projectId, fromId, toId] as const,
},
```

- [ ] **Step 4: Add translations**

```json
"compare": {
  "title": "Compare Builds",
  "selectScans": "Select two builds to compare",
  "fromBuild": "From",
  "toBuild": "To",
  "compare": "Compare",
  "newCves": "New CVEs",
  "resolvedCves": "Resolved CVEs",
  "statusChanged": "Status Changed",
  "unchanged": "Unchanged",
  "addedComponents": "Added Components",
  "removedComponents": "Removed Components",
  "upgradedComponents": "Upgraded Components",
  "carriedForward": "Carried forward from previous build",
  "formatMismatch": "Warning: SBOM formats differ between these builds. Results may be incomplete.",
  "noDifferences": "No differences found between these builds",
  "cveId": "CVE ID",
  "status": "Status",
  "cvss": "CVSS",
  "component": "Component",
  "fromStatus": "From",
  "toStatus": "To",
  "name": "Name",
  "version": "Version",
  "fromVersion": "From",
  "toVersion": "To"
}
```

- [ ] **Step 5: Create compare page**

Create `src/app/[locale]/(app)/products/[id]/compare/page.tsx`:

The page should have:
- Breadcrumb: Products > {product name} > Compare
- Two `<select>` dropdowns for scan selection (populated from `useScans(projectId)`)
- "Compare" button (disabled until both selected)
- Format mismatch warning banner (yellow, if `format_mismatch` is true)
- Carry-forward badge showing count
- Summary stats row: new CVEs count, resolved count, status changed count, unchanged count
- Three collapsible sections:
  - **CVE Changes** — tabs or sections for New / Resolved / Status Changed, each a table with CVE ID (monospace), CVSS, component, status badge
  - **Component Changes** — tabs for Added / Removed / Upgraded, each a table
- Loading: `<TableSkeleton />`, Empty: `<EmptyState />`

**Key details from Django template:**
- The Django template shows scan version_label + created_at in the dropdown options
- Status badges use the same color coding as the triage table (affected=red, not_affected=green, etc.)
- Status changes show "from → to" with colored badges

- [ ] **Step 6: Add compare link to product detail page**

In `src/app/[locale]/(app)/products/[id]/page.tsx`, add a "Compare Builds" button/link near the scan history section that navigates to `/products/{id}/compare`.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: add build comparison page with CVE and component diff"
```

---

### Task 3: Trust Center (Public Page)

**Django reference:**
- Template: `templates/ui/trust_center.html` — public page (no login required) showing customer name, product cards with CRA readiness grade (A-F), total CVEs, suppressed count, and download buttons for VEX/SBOM.
- View: `sciath_ui/views/trust_center.py::trust_center()` — looks up customer by slug, computes grade per product, renders.
- View: `sciath_ui/views/trust_center.py::trust_center_download()` — generates VEX/SBOM download for a product.

**API endpoints (new, public):**
- `GET /api/trust-center/v1/{slug}/` — returns products with grades
- `GET /api/trust-center/v1/{slug}/{project_id}/download/?format=vex_cdx|sbom_cdx` — file download

**Files:**
- Create: `src/services/trust-center.ts`
- Create: `src/hooks/use-trust-center.ts`
- Create: `src/app/[locale]/trust-center/[slug]/page.tsx` (NOT under `(app)` — public, no sidebar)
- Modify: `src/lib/api.ts` (add query keys)
- Modify: `messages/en.json`, `messages/de.json`

- [ ] **Step 1: Create trust center service**

```typescript
// src/services/trust-center.ts
import { apiFetch } from "@/lib/api";

export type TrustCenterProduct = {
  project_id: string;
  project_name: string;
  latest_scan_version: string;
  total_cves: number;
  suppressed: number;
  grade: string;
  score: number;
};

export type TrustCenterResponse = {
  customer_name: string;
  customer_slug: string;
  products: TrustCenterProduct[];
};

export function getTrustCenter(slug: string) {
  return apiFetch<TrustCenterResponse>(`/trust-center/v1/${slug}/`);
}

export function trustCenterDownloadUrl(slug: string, projectId: string, format: "vex_cdx" | "sbom_cdx") {
  return `/api/proxy/trust-center/v1/${slug}/${projectId}/download/?format=${format}`;
}
```

**Note:** The trust center endpoints are public (no auth). The `apiFetch` sends credentials but the backend accepts `auth=None`. This works because the proxy still forwards the request even without a session — the backend doesn't require auth for these endpoints.

- [ ] **Step 2: Create trust center hook**

```typescript
// src/hooks/use-trust-center.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { getTrustCenter } from "@/services/trust-center";
import { queryKeys } from "@/lib/api";

export function useTrustCenter(slug: string) {
  return useQuery({
    queryKey: queryKeys.trustCenter.detail(slug),
    queryFn: () => getTrustCenter(slug),
    enabled: !!slug,
  });
}
```

- [ ] **Step 3: Add query keys and translations**

Query keys:
```typescript
trustCenter: {
  all: ["trustCenter"] as const,
  detail: (slug: string) => [...queryKeys.trustCenter.all, slug] as const,
},
```

Translations:
```json
"trustCenter": {
  "title": "Security Trust Center",
  "subtitle": "Vulnerability transparency for {customer}",
  "grade": "CRA Readiness",
  "totalCves": "Total CVEs",
  "suppressed": "Suppressed",
  "remaining": "Remaining",
  "latestBuild": "Latest Build",
  "downloadVex": "Download VEX",
  "downloadSbom": "Download SBOM",
  "noProducts": "No products published yet",
  "poweredBy": "Powered by Sciath"
}
```

- [ ] **Step 4: Create trust center page**

Create `src/app/[locale]/trust-center/[slug]/page.tsx` — **outside the `(app)` group** so it has no sidebar/auth requirement.

The page should have:
- Clean public layout: customer name as title, subtitle
- Grid of product cards, each showing:
  - Product name
  - CRA readiness grade badge (A=green, B=blue, C=yellow, D=orange, F=red)
  - Score percentage
  - Total CVEs / Suppressed counts
  - Latest build version
  - Two download buttons: VEX (CycloneDX) and SBOM (CycloneDX)
- Footer: "Powered by Sciath" branding
- No login required — this is a public page shared with customers/stakeholders

**Key details from Django template:**
- Grade colors: A → emerald/green, B → blue, C → amber/yellow, D → orange, F → red
- Download buttons open the file directly (browser download)
- The page is branded but minimal — no sidebar, no navigation

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add public trust center page with product grades and VEX download"
```

---

### Task 4: Assessment Audit Trail Modal

**Django reference:**
- Template: `templates/ui/scans/_assessment_audit.html` — modal showing immutable audit trail for a single assessment. Table with: timestamp, actor, action, old_status → new_status, old_confidence → new_confidence, notes.
- View: `sciath_ui/views/builds/detail.py::assessment_audit()` — queries `AssessmentAuditEntry` for a given assessment_id, renders in a modal.

**API endpoint (exists):**
- `GET /api/assessments/v1/audit-entries/?assessment_id=X` — paginated list of audit entries

**Files:**
- Create: `src/components/assessment-audit-modal.tsx`
- Modify: `src/app/[locale]/(app)/products/[id]/scans/[scanId]/page.tsx` (add audit button to triage table rows)

- [ ] **Step 1: Create audit trail modal component**

Create `src/components/assessment-audit-modal.tsx`:

Props: `{ assessmentId: string; cveId: string; isOpen: boolean; onClose: () => void }`

The component should:
- Use `useQuery` to fetch `GET /assessments/v1/audit-entries/?assessment_id={id}`
- Show a modal/sheet with title "Audit Trail — {cveId}"
- Table with columns: Timestamp, Actor, Action, Status Change, Confidence Change, Notes
- Status change shown as "old → new" with colored badges
- Loading skeleton inside the modal
- Empty state if no audit entries

The `useAuditEntries` hook already exists via `src/hooks/use-assessments.ts` — check if it supports filtering by `assessment_id`. If not, add the parameter.

- [ ] **Step 2: Add audit button to triage table**

In the scan detail page's triage table (or `src/components/triage/triage-table.tsx`), add a small history/clock icon button on each assessment row that opens the audit modal for that assessment.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add assessment audit trail modal to scan triage view"
```

---

### Task 5: Invite Accept Page

**Django reference:**
- Template: `templates/ui/invite_accept.html` — public page (no login required) that validates an invite token from an email link, shows the team name, and lets the user accept the invite (redirects to login/signup).
- View: `sciath_ui/views/settings/team.py::invite_accept()` — validates token, marks invite accepted, creates user if needed.

**API endpoint (may need creation):**
- Check if `POST /core/v1/team/invites/{id}/accept/` exists. If not, this task includes creating it in the Django backend.

**Files:**
- Create: `src/app/[locale]/(auth)/invite/page.tsx`
- Modify: `messages/en.json`, `messages/de.json`

- [ ] **Step 1: Check/create accept invite API**

Verify the Django API has an invite acceptance endpoint. Check `api/routers/team.py` for an accept route. If missing, create one that:
- Accepts a token query parameter
- Validates the invite is pending and not expired
- Returns invite details (team name, inviter email) for display
- On POST, marks the invite as accepted

- [ ] **Step 2: Add translations**

```json
"invite": {
  "title": "You've been invited",
  "subtitle": "Join {team} on Sciath",
  "invitedBy": "Invited by {email}",
  "role": "Role: {role}",
  "accept": "Accept Invitation",
  "expired": "This invitation has expired",
  "invalid": "Invalid invitation link",
  "accepted": "Invitation accepted! Redirecting to login..."
}
```

- [ ] **Step 3: Create invite accept page**

Create `src/app/[locale]/(auth)/invite/page.tsx` — under the `(auth)` group (minimal layout, no sidebar).

The page should:
- Read `?token=X` from URL search params
- Call API to validate the token and get invite details
- Show: team/company name, inviter email, assigned role
- "Accept Invitation" button
- On accept: call API, show success message, redirect to `/login` after 2 seconds
- Handle errors: expired invite, invalid token
- No login required — this is accessed from an email link

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add invite acceptance page for email-based team onboarding"
```

---

## Summary

| Task | Page | Complexity | Dependencies |
|------|------|-----------|--------------|
| 1 | Audit Log | Medium | Activity API (exists) |
| 2 | Compare Builds | Medium-High | Compare API (new, deployed) |
| 3 | Trust Center | Medium | Trust Center API (new, deployed) |
| 4 | Assessment Audit Modal | Low | Audit Entries API (exists) |
| 5 | Invite Accept | Low-Medium | May need new API endpoint |

After these 5 tasks, all Django template functionality will have a Next.js equivalent, and the Django `sciath_ui` and `landing` apps can be safely removed.
