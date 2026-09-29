# sciath-ui

Next.js web interface for the Sciath **embedded-Linux CRA compliance** project.
It includes product and scan views, findings, reports, incident reporting,
team/settings pages, a public trust center, and a Markdown blog. Interface
translations are in English and German.

This frontend targets the earlier Django compliance API. That backend is not
included here. The current private `sciath` repository has a different product
scope and is not a drop-in backend for this UI. This repository does not contain
the AI-agent debugging product.

## Requirements and local setup

Use Node.js 24 LTS and npm. API-backed screens require a compatible Django
compliance backend with seeded data. The marketing pages can be developed
without it.

```bash
git clone https://github.com/HintikkaKimmo/sciath-ui.git
cd sciath-ui
npm ci
cp .env.local.example .env.local
npm run dev
```

Open <http://localhost:3000/en>. Configure `.env.local` before testing login:

| Variable | Purpose |
| --- | --- |
| `DJANGO_API_URL` | Backend URL used by the server; defaults to `http://localhost:8000` |
| `NEXT_PUBLIC_DJANGO_URL` | Backend URL reachable by the browser for OAuth redirects |
| `SESSION_SECRET` | At least 32 characters; generate with `openssl rand -hex 32` |
| `OAUTH_CLIENT_ID` / `OAUTH_CLIENT_SECRET` | Credentials for a backend OAuth application |
| `NEXT_PUBLIC_AUTH_BYPASS` | Optional local-development bypass; set to `false` for production |

The app uses OAuth with PKCE and encrypted `iron-session` cookies. API requests
normally go through `/api/proxy/…`; the development-only `/api/django/…` rewrite
forwards directly to Django. The auth bypass does not provide a working API or
seed data. Keep credentials in local/deployment environment settings.

## Commands

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
npm start
```

Set the production environment variables before building and serving. Production
requires HTTPS for secure session cookies. `npm start` serves a completed build.

`npm run generate-types` fetches `/api/openapi.json` from `DJANGO_API_URL` and
regenerates `src/lib/api-types.ts`. If the API is unavailable, it uses an
`openapi.json` placed in the repository root.

## Browser tests

The Playwright suites under `tests/e2e/` require the compatible compliance
backend and seeded customers, products, scans, and incident data. They are
integration tests, not a standalone frontend demo.

```bash
npx playwright install chromium
npm run test:e2e
```

Outside CI, Playwright starts or reuses a development server on port 3000.
In CI, start the server yourself and optionally set `E2E_BASE_URL`.

## Structure

- `src/app/[locale]/` — translated app and authentication pages
- `src/app/(marketing)/` and `content/` — blog and marketing content
- `src/app/api/` — OAuth, session, and backend proxy routes
- `src/lib/` — API client, generated types, session and PKCE utilities
- `messages/` — translations
- `src/__tests__/` — Vitest unit tests
- `tests/e2e/` — Playwright integration tests

## License

[PolyForm Shield 1.0.0](LICENSE.md). Copyright 2026 Kimmo Hintikka;
see [NOTICE](NOTICE). This is source-available software, not OSI-approved open
source. The license permits noncompeting uses, including commercial uses, and
restricts competing uses as defined in its terms. Contact the licensor for
permission for uses outside those terms. Third-party dependencies retain their
own licenses.
