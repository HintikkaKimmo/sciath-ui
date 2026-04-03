# Sciath UI — Claude Context

## What is this?

Next.js frontend for [Sciath](https://sciath.io) — CRA compliance automation for
embedded Linux. This repo is the web application UI that consumes the Django REST API.

**This repo does NOT contain the Sciath engine, CLI, or API.** It is a frontend-only
application that talks to the Django backend via a BFF (Backend-for-Frontend) proxy.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 + shadcn/ui (Radix primitives) |
| Server State | TanStack Query v5 |
| Charts | Recharts + D3 (custom viz) |
| Tables | @tanstack/react-table (planned) |
| Auth | Custom BFF with iron-session (NOT NextAuth.js) |
| Types | openapi-typescript (from Django OpenAPI schema) |
| Testing | Playwright (planned) |
| Fonts | Instrument Sans (body), Instrument Serif (h1), Geist Mono (code) |

---

## Architecture

```
Browser --> Next.js (SSR/CSR) --> Django API (/api/) --> PostgreSQL
CLI     --> Django API (/api/) --> PostgreSQL (unchanged)

Next.js handles:
  - Landing page + marketing (ported from v0 prototype)
  - Authentication flow (OAuth2 via BFF proxy)
  - All application UI (dashboard, products, scans, triage, etc.)
  - Rich data visualizations (VEX waterfall, severity charts)

Django handles:
  - REST API (Django Ninja, unchanged)
  - DBOS workflow worker (unchanged)
  - API auth (DualAuth, unchanged)
  - CLI device flow auth (unchanged)
```

---

## Project structure

```
sciath-ui/
  src/
    app/                      # Next.js App Router
      (marketing)/            # Landing page (public, from v0 prototype)
      (auth)/                 # Login, MFA, OAuth callback
        login/page.tsx
      (app)/                  # Authenticated app shell
        layout.tsx            # Sidebar + nav (shadcn SidebarProvider)
        dashboard/page.tsx
        products/
          page.tsx            # List
          [id]/page.tsx       # Detail + CRA readiness
          [id]/scans/[scanId]/page.tsx  # Scan detail + triage
        findings/page.tsx
        intelligence/page.tsx
        reports/page.tsx
        settings/
          page.tsx            # Profile
          team/page.tsx
          api-keys/page.tsx
          filters/page.tsx
      api/
        auth/[...auth]/route.ts   # BFF auth (iron-session)
        proxy/[...path]/route.ts  # API proxy with token refresh
    components/
      ui/                     # shadcn/ui components
      landing/                # Landing page sections (from v0 prototype)
      charts/                 # VEX waterfall, severity charts
      triage/                 # Keyboard-driven assessment interface
      upload/                 # File upload with drag-and-drop
    lib/
      api.ts                  # TanStack Query + fetch wrapper + query key factory
      session.ts              # iron-session config
      query-provider.tsx      # QueryClientProvider
      utils.ts                # cn() utility
    hooks/
      use-auth.ts             # Auth state hook
      use-keyboard-triage.ts  # j/k nav, a/n/f/u status keys
```

---

## Authentication: Custom BFF

**NextAuth.js is NOT used.** Django-allauth is an OAuth2 consumer, not provider.
Custom BFF is simpler (~200 lines).

- OAuth flow: Browser → Next.js API route → Django allauth → OAuth provider → callback
- Tokens stored in encrypted httpOnly cookie (iron-session, SameSite=Strict)
- API proxy (`/api/proxy/*`) attaches Bearer token server-to-server
- Token refresh: 401 intercept → refresh → replay (with mutex for concurrent requests)
- Dev mode: mock user returned when Django is unreachable

---

## Design system

**Brand:** Warm cream + terracotta/rust palette. Breaking away from generic dark
cybersecurity aesthetics.

- **Primary:** oklch(0.55 0.15 35) — terracotta/rust accent
- **Background:** oklch(0.97 0.01 85) — warm cream
- **Dark mode:** Available via `.dark` class but light is default

**Typography:**
- **Body:** Instrument Sans
- **Headings (h1 only):** Instrument Serif
- **Code/CVE-IDs:** Geist Mono
- **Rule:** Serif for h1 only. Never below h1.

**Density:**
- **Marketing pages:** Generous spacing (py-24, py-32)
- **App pages:** Compact spacing (p-3, p-4), small text (text-xs, text-sm)

**Component rules:**
- CVE-IDs always monospace
- CVSS scores always tabular-nums
- CVSS severity left-border coding on table rows (red/orange/amber/blue)
- Status badges: color-coded (red=affected, emerald=not affected, blue=fixed, amber=investigating)
- All data tables must have `overflow-x-auto` wrapper for mobile

---

## Relationship to other repos

| Repo | What it is | When to look there |
|---|---|---|
| [HintikkaKimmo/sciath](https://github.com/HintikkaKimmo/sciath) | Backend API + engine | API endpoint contracts, models, filter logic |
| [HintikkaKimmo/sciath-cli](https://github.com/HintikkaKimmo/sciath-cli) | CLI tool | `sciath scan run` flags, output format |
| [HintikkaKimmo/sciath-meta](https://github.com/HintikkaKimmo/sciath-meta) | Build system plugins | Artifact discovery, Yocto integration |
| **This repo** | Web frontend | UI, BFF auth, data visualization |

---

## Development

```bash
# Install dependencies
npm install

# Start dev server (with mock auth, no Django needed)
npm run dev

# Build for production
npm run build

# Generate TypeScript types from Django OpenAPI schema
npm run generate-types

# Lint
npm run lint
```

**Environment variables:** Copy `.env.local.example` to `.env.local` and fill in values.

---

## Key principles

- **Non-blocking by default.** API errors show graceful degradation, not crashes.
  Demo/placeholder data shown when API is unreachable in development.

- **Zero false negatives carries through.** The UI must never hide CVE data or
  make it easy to accidentally skip assessments. Default sort: CVSS desc,
  unassessed first.

- **Keyboard-first triage.** j/k navigation, a/n/f/u quick keys for status.
  Mouse is supported but keyboard is the primary interaction model for analysts
  who triage 100+ CVEs per session.

- **Build system native styling.** Use shadcn/ui components and Tailwind CSS
  semantic classes. No custom CSS unless absolutely necessary.

---

## CHANGELOG and VERSION — update on every commit

**Every commit that changes functionality must update `CHANGELOG.md`.**

- Add a bullet under `## [Unreleased]` in the appropriate section (`Added`, `Changed`, `Fixed`).
- Use the same voice as existing entries: bold lead phrase, then one-sentence description.
- `VERSION` is only bumped when cutting a release, not on every commit.

**Exceptions:** Pure docs changes, CI config tweaks, and dependency-only updates
do not need a CHANGELOG entry.

---

## Commit discipline — MANDATORY

**Commit each logical change as it lands. Never accumulate uncommitted work.**

- One feature = one commit (or a small bisected series).
- Before starting any new task: verify `git status` is clean.
- Commit message format: `feat(<scope>): short description` (or `fix`, `chore`, `docs`, `refactor`)
- After implementing each phase of a plan, immediately commit before moving to the next.

---

## Development Workflow — Pre-commit Gates

### What the pre-commit hooks do

Hooks run automatically on `git commit` via `.pre-commit-config.yaml`:

| Hook | What it checks |
|------|---------------|
| `trailing-whitespace` | Removes trailing whitespace |
| `end-of-file-fixer` | Ensures files end with a newline |
| `check-yaml` | Validates YAML syntax |
| `check-added-large-files` | Blocks large binary blobs |
| `detect-private-key` | Blocks committed private keys |
| **gitleaks** | Scans the commit diff for leaked secrets/credentials |
| **eslint** | TypeScript/React linter |
| **tsc** | TypeScript type checker (no emit) |
| **next build** | Full production build must succeed |

### The rule

A commit is not done until all pre-commit hooks pass.

**Never bypass hooks.** This means:
- **Never use `--no-verify`.**
- **Never use `SKIP=<hook>`** to skip individual hooks.
- If a hook fails, fix the underlying issue.

---

## Plan review before implementation — MANDATORY

**Never start implementing a new feature without a reviewed plan.**

New features (anything that adds pages, API routes, components, or major changes)
must go through the gstack review chain before any code is written:

1. Run `/autoplan` — or individually: `/plan-ceo-review`, `/plan-design-review`, `/plan-eng-review`
2. The Eng Review must show **CLEARED** before implementation begins.

**Exceptions:** Bug fixes, typo corrections, dependency updates, and config changes.

---

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
