# Changelog

All notable changes to the Sciath UI will be documented in this file.

## [Unreleased]

### Added

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
- **Pre-commit hooks** — trailing whitespace, gitleaks, eslint, tsc, next build
