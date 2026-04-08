# Missing Pages — QA Fixes and Polish

> Follow-up to `docs/plans/2026-04-08-missing-pages.md`. Issues found during
> browser QA with real demo data (Django `seed_demo` + OAuth token).

---

## Critical Fixes

### 1. Invite page: error retry button mislabeled

**File:** `src/app/[locale]/(auth)/invite/page.tsx`

The error state (line ~167) shows "Accept Invitation" as the retry button text.
It should say "Try again" or use a common retry label. The button correctly calls
`window.location.reload()`, so only the label is wrong.

**Fix:** Change the error state button from `{t("accept")}` to a new i18n key
`{t("retry")}` or use `{tc("retry")}` from common translations. Add the key to
both `messages/en.json` and `messages/de.json` if needed (common.retry already exists).

---

### 2. Invite page: validate endpoint missing in Django

**Problem:** The invite page calls `GET /api/proxy/core/v1/team/invites/validate/?token=X`
but Django returns 405 (Method Not Allowed). The endpoint does not exist yet.

**Backend fix (sciath repo):** Create a new API endpoint in `api/routers/team.py`:

```
GET /core/v1/team/invites/validate/?token=X
```

Should:
- Look up `TeamInvite` by token
- Return `{ id, team_name, inviter_email, role }` if valid
- Return 404 if not found
- Return 410 (Gone) if expired

**No frontend change needed** — the invite page already handles 404/410 correctly.

---

### 3. Compare page: scan dropdowns not populated

**Problem:** The compare page uses `useScans({ project_id: id })` to populate the
From/To dropdowns, but the scans weren't showing in the `<select>` options during QA.

**Diagnosis needed:** Check if:
- The `useScans` hook returns `{ items: ScanSchema[] }` (the hook exists and works
  on the product detail page)
- The compare page maps `scansData?.items` to `<option>` elements correctly
- The scan `status` might be filtering out the demo scan (status=`triage`, not `complete`)

**File:** `src/app/[locale]/(app)/products/[id]/compare/page.tsx`

---

### 4. Trust center: backend API endpoint missing

**Problem:** `GET /trust-center/v1/{slug}/` returns 404 because the Django backend
does not have this endpoint yet.

**Backend fix (sciath repo):** Create a new API router at `api/routers/trust_center.py`:

```
GET /trust-center/v1/{slug}/
```

Should:
- Look up `Customer` by slug where `trust_center_enabled=True`
- For each project, compute CRA readiness grade (A-F) from latest scan
- Return `{ customer_name, customer_slug, products: [...] }`

```
GET /trust-center/v1/{slug}/{project_id}/download/?format=vex_cdx|sbom_cdx
```

Should:
- Find the latest Report for the project in the requested format
- Return the file for download
- Auth: `None` (public endpoints)

**No frontend change needed** — the trust center page already handles error/loading/data states.

---

## Polish (Lower Priority)

### 5. Audit log: show user email instead of UUID

**Problem:** The audit log table shows raw user UUID (`2a0ac599-f45f-...`) in the
User column because `ActivityLogSchema` returns `user_id` as UUID, not a display name.

**Options:**
- A) Expand the Django `ActivityLogSchema` to include `user_email` or `user_name`
  (preferred — keeps the fix in one place)
- B) Client-side: fetch team members and join by user_id
  (more complex, requires extra API call)

**File:** `src/app/[locale]/(app)/settings/audit/page.tsx` (display logic)
**Backend:** `api/schemas/core.py` → `ActivityLogSchema` (add user_email field)

---

### 6. Audit log: format action enum values

**Problem:** Actions display as raw enum strings like `REPORT_GENERATED` and
`ASSESSMENT_REVIEWED`. Should be human-readable: "Report Generated", "Assessment Reviewed".

**Fix:** Add a formatting function in the audit page that converts snake_case enum
values to Title Case, or add i18n keys for each action type.

**File:** `src/app/[locale]/(app)/settings/audit/page.tsx`

---

### 7. Invite page: should show "expired" for 410, not generic error

**Problem:** The invite page catches 404 and 410 as "expired" state, but other
HTTP errors (like the 405 we saw) fall through to a generic error with the raw
API error message ("API error: 405"). This is technically correct but not
user-friendly.

**Fix:** For non-404/410 errors, show a friendlier message like "Could not validate
invitation. Please try again or contact your administrator."

**File:** `src/app/[locale]/(auth)/invite/page.tsx`

---

## Summary

| # | Issue | Type | Repo | Effort |
|---|-------|------|------|--------|
| 1 | Invite retry button label | Frontend fix | sciath-ui | 5 min |
| 2 | Invite validate endpoint | Backend API | sciath | 30 min |
| 3 | Compare scan dropdown | Frontend debug | sciath-ui | 15 min |
| 4 | Trust center API | Backend API | sciath | 1 hour |
| 5 | Audit user display name | Backend + Frontend | both | 20 min |
| 6 | Audit action formatting | Frontend | sciath-ui | 10 min |
| 7 | Invite error messaging | Frontend | sciath-ui | 10 min |

Items 1, 3, 6, 7 can be fixed in sciath-ui immediately.
Items 2, 4, 5 require Django backend changes in the sciath repo.
