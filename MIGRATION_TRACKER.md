# Migration Tracker — What's Left

Branch: `migrate-to-eventsphere-architecture`

Companion to `MIGRATION_PLAN.md`. The plan is the full roadmap; this
file lists only the open work items, scoped and sized so any one of
them can be picked up as a standalone PR.

Legend
- **Effort:** S (≤1h) · M (1–4h) · L (≥4h or multi-session)
- **Risk:** low / med / high — likelihood of breaking existing flows
- **Trigger:** "anytime" (purely additive) vs "on-touch" (do it when
  you're already modifying the page or component for another reason)

---

## Phase 2 — UI error surface

- [x] **Replace `toast.error(ApiErrorHandler.parse(err))` with `<ErrorList error={mutation.error} />`**
      in ticket / property / unit / user dialogs.
      Effort: S per dialog · Risk: low · Trigger: on-touch.
      Reference: any new feature hook already passes a structured
      `UIError` through `onError`; the dialog just needs the import
      and the JSX swap.
      Verified 2026-05-01: no remaining
      `toast.error(ApiErrorHandler.parse(...))` callers.

---

## Phase 5 — Feature folder migration (UI layer)

The constants / schemas / services / hooks layers are done for every
feature. Remaining work is the **components / list / forms** layer per
feature, migrating callers off legacy `src/features/*-feat/` onto the
new `src/features/<name>/` tree.

Approach: refactor-on-touch. Don't sweep these all at once — each page
should be migrated when it's already being modified for product work.

Per-feature checklist:

| Feature | components/ | list/ | forms/ | Notes |
| --- | --- | --- | --- | --- |
| tickets | ☑ | ☑ | ☑ | Migrated shared ticket components, forms, hooks, services, models, helpers, and role-specific admin/technician lists into `src/features/tickets/`. No `ticket-feat` callers remain. |
| properties | ☑ | ☑ | ☑ | Migrated property dialog, view, actions, form, list, row components, hooks, models, and compatibility service into `src/features/properties/`. |
| units | ☑ | ☑ | ☑ | Migrated unit dialog, view, actions, form, list, row components, hooks, models, and compatibility service into `src/features/units/`. |
| tenants | ☑ | ☑ | ☑ | Canonical tenant services/hooks/models remain in `src/features/tenants/`; the shared users UI was moved from the route folder into `src/features/team/` because tenants are still managed through the combined user-management surface. |
| technicians | ☑ | ☑ | ☑ | Canonical technician services/hooks/models remain in `src/features/technicians/`; the shared users UI was moved from the route folder into `src/features/team/`, with technician-specific request forms under `src/features/technician-requests/`. |
| team | ☑ | ☑ | ☑ | Migrated the admin users page UI, list, forms, data, hooks, models, and compatibility service into `src/features/team/`. |
| chat | ☑ | ☑ | ☑ | Migrated `src/features/chat-feat/` into `src/features/chat/` and removed the legacy folder. |
| settings | ☑ | ☑ | ☑ | Migrated `src/features/settings-feat/` into `src/features/settings/` and removed the legacy folder. |
| dashboard | ☑ | ☑ | ☑ | Dashboard feature folder already owns skeletons, data, hooks, models, and services; no legacy route-local dashboard UI remains for this phase. |
| technician-requests | ☑ | ☑ | ☑ | Migrated technician apply/decline/send-request forms into `src/features/technician-requests/forms/`; canonical data/hooks/models/services were already present. |

Effort per feature: M-L · Risk: med (touches working pages) · Trigger: on-touch.

Phase-5-only sub-items:

- [x] **Create `src/features/settings/`** — entrypoints exist for
      components, data, hooks, models, and services. Caller migration
      off `settings-feat` is complete.
      Effort: L · Risk: low · Trigger: anytime, but only when settings
      page is being reworked.
- [x] **Create `src/features/dashboard/`** services + hooks
      alongside the dashboard skeleton/data/model entrypoints. Effort:
      M · Risk: low · Trigger: on-touch when dashboard cards are
      reworked.
- [x] **Promote `technician-requests` to its own feature folder** with
      a service + hook layer. Effort: M · Risk: low · Trigger:
      on-touch when the apply / decline flow is reworked.

---

## Phase 6 — API route hardening (incremental)

All routes now use `errorToNextResponse` and structured `ApiError`. The
remaining incremental work per route:

- [x] **Strict body parsing with `parseOrThrow(*Schema, body)`** —
      JSON mutation routes now parse through Zod schemas and
      `parseOrThrow`. AI streaming endpoints are documented
      exemptions, and multipart/form-data upload routes remain on
      `request.formData()`.
      Effort: S per route · Risk: low · Trigger: on-touch.
      Verified 2026-05-01: the remaining raw `request.json()` reads
      are wrapped by `parseOrThrow(...)` except documented streaming
      and optional-payload compatibility cases.
- [x] **Replace inline role checks with `assertPermission(ctx, PERMISSION.X)`**
      on every route that today does
      `if (!verify.isAdminRole) throw ApiError.unauthorized()`.
      Effort: S per route · Risk: low · Trigger: on-touch.
      Permission keys for every domain are already defined in
      `src/shared/auth/permission-registry.ts`.
      Verified 2026-05-01: no route-level `verify.isAdminRole`
      permission gates remain.
- [x] **List endpoints adopt `*ListQuerySchema` + feature filter helper**
      — i.e. parse `searchParams` with `ticketListQuerySchema` (and
      siblings) instead of `mapToObject(query as unknown as ...)`.
      Effort: M per route · Risk: med (filter behavior must be
      preserved) · Trigger: on-touch.
      2026-05-01: unsafe `mapToObject(... as unknown as Map<...>)`
      casts were removed from API routes; `/api/tickets`, ticket
      categories/types, technician requests, properties, units, users,
      and chat room messages now parse list queries before passing
      filters into legacy `APIFeatures` where applicable. Dedicated
      feature filter helpers remain optional on-touch extraction work.
- [x] **`/api/chat/route.ts` and `/api/completion/route.ts`** — AI
      streaming endpoints intentionally exempt from the JSON error
      shape; document this in the file header so a future passer-by
      doesn't try to "fix" them.
      Effort: S · Risk: low · Trigger: anytime.

---

## Phase 8 — Dashboard polish

- [x] **Breadcrumb pattern swap.** `BreadCrumbs.tsx` now derives labels
      from route segments directly, hides role root segments, and no
      longer depends on `crumbLabelMap` layout config.
      Effort: S · Risk: low · Trigger: on-touch.
- [x] **Reusable component parity.** Sidebar workspace/profile shell,
      table header actions/reload/export/visualize/row-actions styles,
      address field/autocomplete, calendar/date-filter, and native
      date/time inputs are aligned with eventSphere.
      Verified 2026-05-01.

---

## Phase 9 — Lint enforcement (residual)

- [x] **Custom rule / CI grep** banning hard-coded `currentBusiness:
      string` literals in API routes — every business id must come
      from `getVerifiedUser`. Today the rule is policy in
      ENGINEERING_PATTERNS.md but unenforced.
      Effort: S · Risk: low · Trigger: anytime.
      Implemented as `npm run lint:no-hardcoded-current-business`.

---

## Phase 10 — Cleanup (must run after Phase 5 is well underway)

- [x] **Delete legacy `src/features/*-feat/` folders** once their last
      caller migrates to the new feature. Per-folder gates:
      - `ticket-feat/` — deleted after tickets feature UI migration
      - `property-feat/` — deleted after properties/units UI migration
      - `chat-feat/` — deleted after chat UI migration
      - `onboarding-feat/` — deleted after migration to
        `src/features/onboarding/`
      - `settings-feat/` — deleted after settings UI migration
      Effort: S each (just delete) · Risk: low (typecheck catches
      missed callers) · Trigger: only after the corresponding feature
      row in Phase 5 is fully ☑.
- [x] **Delete dead role-string branches** (`if (verify.isAdminRole)`)
      once permission-key checks are everywhere. Effort: M · Trigger:
      after Phase 6 permission gating sweep.
- [x] **Final pass:** typecheck, full lint, build, smoke-test golden
      paths in the browser.
      Effort: M · Risk: low · Trigger: pre-merge to main.
      Verified 2026-05-01: built app served on port 3010; `/auth/login`
      returned 200, and protected dashboard golden paths redirected to
      `/auth/login`.

---

## Quick wins (anytime, additive, no callers to update)

These are small wins that can be picked off in idle moments:

1. [x] Document `/api/chat/route.ts` and `/api/completion/route.ts` as
   intentionally exempt from the JSON error shape (Phase 6).
2. [x] Add the `currentBusiness` lint rule (Phase 9).
3. [x] Header comment on each `loading.tsx` referencing the skeleton it
   delegates to (Phase 8 polish).

## Verification

- [x] `npx tsc --noEmit` (2026-05-01)
- [x] `npm run lint:no-hardcoded-current-business` (2026-05-01)
- [x] `npm run lint` (2026-05-01)
- [x] `npm run build` (2026-05-01)
- [x] Built-app smoke: `/auth/login`, `/dashboard`, `/admin/dashboard`,
      `/technician/dashboard` (2026-05-01)

## High-leverage next steps

If the goal is to unblock the most downstream cleanup, attack in this
order:

1. No open migration tracker tasks remain.
