# Design System — Sciath UI

## Product Context

- **What this is:** B2B compliance SaaS for embedded Linux/IoT firmware CVE assessment and CRA compliance reporting
- **Who it's for:** Security analysts, firmware engineers, compliance officers at European hardware companies
- **Space/industry:** Application security (AppSec) tooling — peers: Snyk, Semgrep, Grype
- **Project type:** Operator dashboard — data-dense, triage workflow, used for long sessions

## Aesthetic Direction

- **Direction:** Refined Industrial — warm, distinctive, confident
- **Decoration level:** Minimal — typography and color carry all meaning
- **Mood:** Precise, trustworthy, calm under pressure. The product makes high-stakes compliance decisions — it should feel like a precision instrument, not a marketing tool.
- **Anti-patterns:** No generic card/icon grids, no bubbly uniform radius, no stock photos, no generic dark cybersecurity aesthetic

## Brand Palette

**Warm cream + terracotta/rust + deep charcoal.** Breaking away from generic dark cybersecurity aesthetics. The palette is intentionally warm and distinctive.

All colors use **OKLCH** for perceptual uniformity. Defined as CSS custom properties in `src/app/globals.css`.

### Light Mode (default)

| Token | OKLCH | Usage |
|-------|-------|-------|
| `--background` | oklch(0.97 0.01 85) | Warm cream page background |
| `--foreground` | oklch(0.18 0.02 50) | Deep charcoal body text |
| `--primary` | oklch(0.55 0.15 35) | **Terracotta/rust** — main brand accent, actions, links |
| `--primary-foreground` | oklch(0.98 0.01 85) | Text on primary |
| `--secondary` | oklch(0.92 0.02 85) | Light gray surfaces |
| `--muted` | oklch(0.92 0.02 85) | Subdued backgrounds |
| `--muted-foreground` | oklch(0.45 0.02 50) | Secondary text |
| `--destructive` | oklch(0.55 0.2 25) | Error/danger actions |
| `--border` | oklch(0.88 0.02 85) | Subtle borders |
| `--card` | oklch(1 0 0) | White card surfaces |
| `--ring` | oklch(0.55 0.15 35) | Focus ring (matches primary) |

### Dark Mode

| Token | OKLCH | Usage |
|-------|-------|-------|
| `--background` | oklch(0.14 0.02 50) | Very dark background |
| `--foreground` | oklch(0.97 0.01 85) | Off-white text |
| `--primary` | oklch(0.65 0.15 35) | Lighter terracotta for contrast |
| `--border` | oklch(0.28 0.02 50) | Subtle dark borders |
| `--card` | oklch(0.18 0.02 50) | Dark card surfaces |

Dark mode is toggled via `next-themes` using the `.dark` class. Default theme is **light**.

### Severity Palette (hex — semantic, not themed)

| Severity | Color | Hex |
|----------|-------|-----|
| Critical (9.0–10.0) | Red | #ef4444 |
| High (7.0–8.9) | Orange | #f97316 |
| Medium (4.0–6.9) | Amber | #f59e0b |
| Low (0.0–3.9) | Blue | #3b82f6 |
| None/Unknown | Gray | #6b7280 |

### VEX Status Palette

| Status | Color | Hex |
|--------|-------|-----|
| Affected | Red | #ef4444 |
| Under investigation | Amber | #f59e0b |
| Not affected | Emerald | #10b981 |
| Fixed | Emerald | #10b981 |

### Chart Colors

5-color palette for data visualizations, defined as `--chart-1` through `--chart-5` in both light and dark modes.

## Typography

Three fonts, each with a strict role:

| Role | Font | Source | Usage |
|------|------|--------|-------|
| **Body/sans** | Instrument Sans | Google Fonts (`next/font/google`) | All text except h1 and code |
| **Headings** | Instrument Serif | Google Fonts (`next/font/google`, weight 400) | **h1 page titles only. Never below h1.** |
| **Code/mono** | Geist Mono | Google Fonts (`next/font/google`) | CVE-IDs, CPE strings, Kconfig symbols, version strings |

CSS variables: `--font-sans`, `--font-serif`, `--font-mono` — set in `src/app/layout.tsx`.

### Type Scale

| Element | Size | Weight | Font |
|---------|------|--------|------|
| h1 (app) | 2rem | 600 | Instrument Serif |
| h1 (marketing) | 3.5–5rem | 400 | Instrument Serif |
| h2 | 1.5rem | 600 | Instrument Sans |
| h3 | 1.125rem | 500 | Instrument Sans |
| Body | 0.875rem | 400 | Instrument Sans |
| Small/meta | 0.75rem | 400 | Instrument Sans |
| Code/mono | 0.8125rem | 400 | Geist Mono |
| Table cells | 0.8125rem | 400 | Instrument Sans, `tabular-nums` |

### Typography Rules

- **Serif for h1 only.** One serif element per page. Never below h1.
- **CVE-IDs always monospace** — use `.cve-id` class or `font-mono text-sm`
- **CVSS scores always `tabular-nums`** — columns must align when scanning
- **Form controls use `text-xs`**, NOT `font-mono` (mono makes forms look like code)

## Spacing & Density

**Two densities, one brand:**

| Context | Vertical padding | Text sizes | Gaps | Max width |
|---------|-----------------|------------|------|-----------|
| **Marketing pages** | `py-24` to `py-32` | `text-lg`, `text-xl` | `gap-12` to `gap-16` | `max-w-6xl` |
| **App pages** | `p-3`, `p-4` | `text-xs`, `text-sm` | `gap-3`, `gap-4` | Full width in sidebar layout |

**Base unit:** 4px (Tailwind default)

## Layout

- **Navigation:** Collapsible sidebar (expanded by default on desktop, collapsed on mobile). Items: Dashboard, Products, Findings, Intelligence, Reports, Settings.
- **Border radius:** Hierarchical — `--radius: 0.5rem` (8px base)
  - Badges: 4px (`--radius-sm`)
  - Inputs/buttons: 6px (`--radius-md`)
  - Cards: 8px (`--radius-lg`)
  - Modals: 12px (`--radius-xl`)
  - Avatars: full
- **User profile:** Avatar with email initial (uppercase) in sidebar footer. Click → dropdown: email, Sign out. No photo — initials only.
- **Avatar sizes:** `size-6` (sm), `size-8` (default), `size-10` (lg)

## Component Architecture

- **UI library:** shadcn/ui — **Base Nova** variant (Base UI React primitives, NOT Radix)
- **Variant management:** Class Variance Authority (CVA)
- **Class merging:** `cn()` utility (clsx + tailwind-merge) in `src/lib/utils.ts`
- **Icons:** Lucide React
- **Styling:** Tailwind CSS 4 utilities exclusively — no custom CSS unless absolutely necessary
- **Semantic attributes:** `data-slot` on all primitives, `data-size` for responsive modifiers

### Component Variants

**Button:** `default | outline | secondary | ghost | destructive | link` — sizes: `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`

**Badge:** `default | secondary | destructive | outline | ghost | link`

**Input/Select:** `default | sm`

## Motion

- **Approach:** Minimal-functional — transitions aid comprehension only
- Default transition: 150ms ease-out
- Hover: 100ms ease-out
- Page transition: 200ms ease-in
- Spinner: 800ms linear infinite
- **No entrance animations, no scroll effects, no parallax**

## Key UX Rules

1. **CVE-IDs always monospace** with NVD link
2. **CVSS scores always `tabular-nums`** for column alignment
3. **CVSS severity left-border** on all assessment table rows (`border-l-4` color-coded)
4. **Status badges always have an icon prefix** — for color-blind accessibility
5. **Filter state in URL** (query params via `useSearchParams`) — triage views must be bookmarkable
6. **Keyboard shortcuts** — j/k navigate rows, a/n/f/u set status, / focus filter
7. **All data tables** must have `overflow-x-auto` wrapper for mobile
8. **Non-blocking by default** — API errors show graceful degradation, not crashes
9. **Zero false negatives** — UI never hides CVE data. Default sort: CVSS descending, unassessed first.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 (`@tailwindcss/postcss`) |
| Components | shadcn/ui Base Nova (Base UI React primitives) |
| State | TanStack Query v5 (server), React state (client) |
| Theming | next-themes (class-based, light default) |
| Charts | Recharts + D3 (custom visualizations) |
| Icons | Lucide React |

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-18 | Profile avatar = email initial, dropdown | No photo upload needed for B2B |
| 2026-03-18 | CVSS left-border severity coding | Primary scannability signal for triage |
| 2026-03-18 | Restrained palette (1 accent + semantic) | Color = meaning in compliance tooling |
| 2026-03-18 | Keyboard shortcuts for triage | Primary workflow; critical for productivity at scale |
| 2026-04-03 | Migrate to Next.js from Django templates | Rich visualizations impossible with HTMX |
| 2026-04-03 | One brand, two densities | Instrument Serif h1 + terracotta in both marketing and app |
| 2026-04-03 | Instrument Serif for h1 only | Carries brand from landing page into app; never below h1 |
| 2026-04-03 | shadcn/ui Base Nova replaces DaisyUI | Radix→Base UI primitives + Tailwind CSS 4; more customizable |
| 2026-04-03 | Warm cream + terracotta palette | Distinctive brand breaking from generic dark cybersec aesthetic |
| 2026-04-03 | Instrument Sans replaces Geist for body | Better pairing with Instrument Serif for unified brand feel |
| 2026-04-03 | OKLCH color system | Perceptually uniform, future-proof wide-gamut color space |
| 2026-04-06 | Light mode as default | Warm cream brand identity strongest in light; dark available via toggle |
