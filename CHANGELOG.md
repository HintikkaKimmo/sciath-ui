# Changelog

All notable changes to the Sciath UI will be documented in this file.

## [Unreleased]

### Security

- **Production session secret** — enforce the existing required-secret check in the cookie configuration, preventing use of the development fallback in production.

### Added

- **SBOM upload dialog** on product detail page — drag-and-drop file upload, SBOM format override, optional kconfig/DTB/custom filter under Advanced Options, analysis settings callout with carry-forward checkbox
- **Analysis trigger + phased progress** — Run Analysis button for draft/failed scans, phased progress indicator (Parsing SBOM → Matching CVEs → Scoring → Complete) with live counters during analysis
- **Scan detail tabs** — Assessments, Components, and Reports tabs using shadcn Tabs with URL-based state (`?tab=reports`) for bookmarkable tab selection
- **Components tab** — table of scan components with type filter, identity review badges, CPE/version in monospace
- **Reports tab** — report generation with format dropdown, polling with 5-minute timeout, download with toast error handling, retry for failed reports
- **Export dropdown** on scan detail — VEX (CycloneDX), SBOM (CycloneDX/SPDX), SBOM+VEX, SARIF, and Evidence Pack (ZIP) downloads via shadcn DropdownMenu
- **Findings CSV export** — client-side CSV generation with visible limitation warning ("Export CSV (500 of 3,241)") and confirmation when total exceeds loaded count
- **Shared severity utilities** — extracted `statusStyle`, `getCvssColor`, `getSeverityBar` to `src/lib/severity.ts` for cross-component reuse
- **Download blob utility** — extracted `downloadBlob()` to `src/lib/utils.ts` for DRY file download pattern
- **Playwright E2E tests** for scan lifecycle — new scan dialog, tab switching, export dropdown, CSV export, status banner, API health checks
- **TODOS.md** — tracking deferred items: backend OpenAPI schema fix, Vitest component tests, backend CSV endpoint

### Changed

- **Responsive sidebar state** — subscribe to media-query changes with React's external-store API, preserving the desktop server-rendered default without synchronous state updates in an effect.

- **Scan detail page rewrite** — fixed i18n Link import (`next/link` → `@/i18n/navigation`), added status-aware rendering (draft/failed → banner, analysing → progress, triage/complete → tabs)
- **FileUpload component extended** — new `multiple` and `onFileContent` props for single-file text content mode, backwards compatible
- **Findings page** — imports severity utilities from shared module instead of local definitions

### Added (prior)

- **Landing page** ported from v0 prototype — hero, CRA deadline banner, noise problem, how-it-works, filter pipeline, triage mockup, output formats, accuracy, contact form, footer
- **Custom BFF auth** with iron-session — OAuth proxy, token refresh middleware, session management
- **App shell** with shadcn sidebar — collapsible nav, user profile, sign out
- **Dashboard** with KPI cards, severity distribution bar, products table, activity feed
- **Products list** with compact table — components, CVEs, critical/high counts, assessed progress bars
- **Product detail** with CRA readiness gauges and scan history table
- **Keyboard-driven triage interface** — j/k navigation, a/n/f/u status keys, search and filter
- **VEX waterfall chart** showing 6-layer filter pipeline (247 → 74 CVEs)
- **Cross-product findings page** with severity bars, product badges, status filters
- **Intelligence page** with NVD/EUVD/CISA KEV feed status and recent CVE alerts
- **Reports page** with download/generating states
- **Settings pages** — profile, team members, API keys, filter policies
- **File upload component** with drag-and-drop, format auto-detection, progress bar, size validation
- **Responsive pass** — mobile grids, overflow-x-auto tables, scaled headings
- **Design system** — Instrument Sans/Serif, Geist Mono, oklch warm cream + terracotta palette
- **API client** with query key factory for TanStack Query cache invalidation
- **OpenAPI type generation script** (`npm run generate-types`)
- **Typed service layer** — service modules for projects, scans, assessments, reports, activity, policies wrapping `apiFetch()` with OpenAPI-generated types
- **TanStack Query hooks** — `useProjects`, `useScans`, `useScanStatus` (with polling), `useAssessments`, `useBulkUpdateAssessments`, `useReports`, `useActivity`, `usePolicies` and mutation hooks with cache invalidation
- **Shared UI states** — `ErrorState`, `EmptyState`, `TableSkeleton`, `CardGridSkeleton`, `DetailSkeleton` components for loading/error/empty data patterns
- **OpenAPI snapshot** — exported `openapi.json` from backend for offline type generation
- **DESIGN.md** — comprehensive design system reference updated for current stack (OKLCH tokens, Instrument Sans/Serif, shadcn Base Nova, terracotta palette)
- **OAuth callback page** — server-side callback for DOT authorization code + PKCE flow, exchanges code for tokens server-to-server
- **PKCE helper** — `generateCodeVerifier()` and `generateCodeChallenge()` for OAuth2 PKCE S256
- **Vitest test suite** — session secret validation, PKCE generation, test infrastructure
- **PKCE API route** — `POST /api/auth/pkce` generates code_verifier (stored in iron-session) and returns code_challenge for frontend-initiated PKCE
- **Audit log page** — settings sub-page with user/action/resource filters, paginated table with relative timestamps, and CSV export
- **Build comparison page** — side-by-side scan diff showing new/resolved CVEs, status changes, and component additions/removals/upgrades with format mismatch warnings
- **Public trust center page** — unauthenticated page showing CRA readiness grades per product with VEX and SBOM download buttons
- **Assessment audit trail modal** — sheet panel on triage table rows showing immutable history of status/confidence changes per assessment
- **Invite acceptance page** — email-linked page for team invite onboarding with token validation and accept flow

### Changed

- **All 11 pages wired to real API** — all app pages now use TanStack Query hooks with real API data via the BFF proxy. Intelligence page shows sync feed status and CVE database stats. Team page supports invite, revoke, role change, and member deactivation. API keys page supports generate, revoke, and scope selection with escalation prevention.
- **OpenAPI spec expanded** — regenerated from Django with 71 endpoints (sync status/stats, 24 intelligence LIST/GET, 6 team management, 3 API key management endpoints newly public)
- **Session secret hardening** — `getSessionSecret()` throws in production if `SESSION_SECRET` not set
- **Proxy token refresh** — saves rotated refresh token (fixes forced-logout bug), proactive refresh 30s before expiry, single refresh gate with failure broadcast, try/catch for network errors
- **Auth route cleanup** — removed dead `handleCallback()`, logout now revokes tokens on backend via DOT
- **Login page** — PKCE generated client-side before redirect, login buttons now async (fetch code_challenge, then redirect to allauth)
- **Middleware auth bypass** — explicit `NEXT_PUBLIC_AUTH_BYPASS` env var instead of implicit `NODE_ENV` check
- **Pre-commit hooks** — trailing whitespace, gitleaks, eslint, tsc, next build
