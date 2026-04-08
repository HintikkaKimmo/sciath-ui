# TODOs

## Backend: Make ScanCreate optional fields truly optional

**What:** Update Django `ScanCreateSchema` to mark fields with server defaults as `Optional` so openapi-typescript generates optional TypeScript types.

**Why:** Currently all fields in `ScanCreateSchema` are required in the generated types even though they have server-side defaults (`""`). The frontend passes empty strings for unset fields, which works but is fragile.

**Context:** `api/routers/scans_crud.py:37-50` defines the schema. Fields like `kconfig_raw`, `dtb_raw`, `depgraph_raw`, `yocto_machine`, `yocto_distro`, `kernel_version` all default to `""`. Making them `Optional[str] = ""` in Pydantic would generate correct TypeScript types.

**Depends on:** Backend repo change, then re-run `npm run generate-types`.

---

## Frontend: Install Vitest + component tests

**What:** Install Vitest + React Testing Library and add component-level tests for scan lifecycle features.

**Why:** 24 component-level code paths are untested. The Playwright E2E spec covers 6 critical user flows, but unit/component tests would catch regressions faster and run in CI without a Django backend.

**Context:** No unit test framework is currently installed. The project uses Playwright for E2E only (`tests/e2e/`). Key components to test: `NewScanDialog`, `ScanStatusBanner`, `ComponentsTab`, `ReportsTab`, CSV export logic.

**Depends on:** Nothing. Can be done independently.

---

## Backend: CSV endpoint for full findings export

**What:** Add a server-side CSV export endpoint for cross-product findings that returns all results, not limited to the client-side pagination limit.

**Why:** The current client-side CSV export is capped at the loaded data (500 rows). Users with >500 findings see a warning ("Export CSV (500 of 3,241)") and get a partial export. A backend endpoint would return the complete dataset.

**Context:** The findings page (`src/app/[locale]/(app)/findings/page.tsx`) uses client-side generation with `downloadBlob()`. The scan-level export already exists server-side at `/reports/v1/scans/{scanId}/export/`, but there's no cross-product findings endpoint.

**Depends on:** Backend repo change.
