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

- [ ] **Replace `toast.error(ApiErrorHandler.parse(err))` with `<ErrorList error={mutation.error} />`**
      in ticket / property / unit / user dialogs.
      Effort: S per dialog · Risk: low · Trigger: on-touch.
      Reference: any new feature hook already passes a structured
      `UIError` through `onError`; the dialog just needs the import
      and the JSX swap.

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
| tickets | ☐ | ☐ | ☐ | Largest surface. Existing pages: admin, technician, users dashboards. Move `src/app/admin/dashboard/ticket-management/list/*` into `src/features/tickets/list/`; convert `TicketList.tsx` to consume `useTicketList(query)` instead of inline axios. |
| properties | ☐ | ☐ | ☐ | Existing dialogs at `src/app/admin/dashboard/properties/components/{PropertyDialog,UnitDialog}.tsx` should consume `useCreateProperty / useUpdateProperty` and `propertyFormSchema`. |
| units | ☐ | ☐ | ☐ | Same pattern as properties. UnitDialog into `src/features/units/forms/`. |
| tenants | ☐ | ☐ | ☐ | Currently lives inside `src/app/admin/dashboard/users/` because legacy code treats tenants as part of user management. New folder is `src/features/tenants/`. |
| technicians | ☐ | ☐ | ☐ | Same shape as tenants. |
| team | ☐ | ☐ | ☐ | Workspace staff. `src/app/admin/dashboard/users/UserForm.tsx` → `src/features/team/forms/TeamInviteForm.tsx`. |
| chat | ☐ | ☐ | ☐ | Migrate `src/features/chat-feat/` → `src/features/chat/`. The chat skeleton is already in place at `src/features/chat/components/ChatSkeleton.tsx`. |
| settings | ☐ | ☐ | ☐ | Constants + schemas + services + hooks not yet shipped (Phase 5 status table). Largest gap. Start here last because eventSphere settings is the most complex feature. |
| dashboard | ☐ | ☐ | ☐ | Constants + schemas + services + hooks not yet shipped. Mostly read-only widgets. |
| technician-requests | ☐ | ☐ | ☐ | Needs its own feature folder; constants currently live in `src/features/tickets/models/technician-response.model.ts`. |

Effort per feature: M-L · Risk: med (touches working pages) · Trigger: on-touch.

Phase-5-only sub-items:

- [ ] **Create `src/features/settings/`** — full canonical layout
      (constants, schemas, service, hooks, data) for workspace settings.
      Effort: L · Risk: low · Trigger: anytime, but only when settings
      page is being reworked.
- [ ] **Create `src/features/dashboard/`** services + hooks
      (just `DashboardSkeleton` lives there today). Effort: M · Risk:
      low · Trigger: on-touch when dashboard cards are reworked.
- [ ] **Promote `technician-requests` to its own feature folder** with
      a service + hook layer. Effort: M · Risk: low · Trigger:
      on-touch when the apply / decline flow is reworked.

---

## Phase 6 — API route hardening (incremental)

All routes now use `errorToNextResponse` and structured `ApiError`. The
remaining incremental work per route:

- [ ] **Strict body parsing with `parseOrThrow(*Schema, body)`** — most
      routes still inline-destructure the body. Replace with the
      already-shipped feature schema (e.g. `ticketFormSchema`,
      `propertyFormSchema`, `unitFormSchema`).
      Effort: S per route · Risk: low · Trigger: on-touch.
- [ ] **Replace inline role checks with `assertPermission(ctx, PERMISSION.X)`**
      on every route that today does
      `if (!verify.isAdminRole) throw ApiError.unauthorized()`.
      Effort: S per route · Risk: low · Trigger: on-touch.
      Permission keys for every domain are already defined in
      `src/shared/auth/permission-registry.ts`.
- [ ] **List endpoints adopt `*ListQuerySchema` + feature filter helper**
      — i.e. parse `searchParams` with `ticketListQuerySchema` (and
      siblings) instead of `mapToObject(query as unknown as ...)`.
      Effort: M per route · Risk: med (filter behavior must be
      preserved) · Trigger: on-touch.
- [ ] **`/api/chat/route.ts` and `/api/completion/route.ts`** — AI
      streaming endpoints intentionally exempt from the JSON error
      shape; document this in the file header so a future passer-by
      doesn't try to "fix" them.
      Effort: S · Risk: low · Trigger: anytime.

---

## Phase 8 — Dashboard polish

- [ ] **Breadcrumb pattern swap.** Current `BreadCrumbs.tsx` works
      correctly off `crumbLabelMap`. EventSphere uses a slightly
      different segment-driven pattern. Defer until the breadcrumb
      component itself is being modified for product reasons.
      Effort: S · Risk: low · Trigger: on-touch (no leverage today).

---

## Phase 9 — Lint enforcement (residual)

- [ ] **Custom rule / CI grep** banning hard-coded `currentBusiness:
      string` literals in API routes — every business id must come
      from `getVerifiedUser`. Today the rule is policy in
      ENGINEERING_PATTERNS.md but unenforced.
      Effort: S · Risk: low · Trigger: anytime.

---

## Phase 10 — Cleanup (must run after Phase 5 is well underway)

- [ ] **Delete legacy `src/features/*-feat/` folders** once their last
      caller migrates to the new feature. Per-folder gates:
      - `ticket-feat/` — blocked on tickets feature UI migration
      - `property-feat/` — blocked on properties UI migration
      - `chat-feat/` — blocked on chat UI migration
      - `onboarding-feat/` — needs its own feature folder first
        (`src/features/onboarding/`) plus migration
      - `settings-feat/` — blocked on settings feature shipping
      Effort: S each (just delete) · Risk: low (typecheck catches
      missed callers) · Trigger: only after the corresponding feature
      row in Phase 5 is fully ☑.
- [ ] **Delete dead role-string branches** (`if (verify.isAdminRole)`)
      once permission-key checks are everywhere. Effort: M · Trigger:
      after Phase 6 permission gating sweep.
- [ ] **Final pass:** typecheck, full lint, build, smoke-test golden
      paths in the browser.
      Effort: M · Risk: low · Trigger: pre-merge to main.

---

## Quick wins (anytime, additive, no callers to update)

These are small wins that can be picked off in idle moments:

1. Document `/api/chat/route.ts` and `/api/completion/route.ts` as
   intentionally exempt from the JSON error shape (Phase 6).
2. Add the `currentBusiness` lint rule (Phase 9).
3. Header comment on each `loading.tsx` referencing the skeleton it
   delegates to (Phase 8 polish).

## High-leverage next steps

If the goal is to unblock the most downstream cleanup, attack in this
order:

1. **Tickets feature UI migration** — unblocks deletion of the
   largest legacy folder (`ticket-feat/`).
2. **Settings feature folder creation** — fills the biggest Phase 5
   gap and unblocks `settings-feat/` deletion.
3. **API permission-key sweep** — replaces every
   `verify.isAdminRole` with `assertPermission(...)`. Mechanical and
   low-risk; biggest payoff for code review consistency.
4. **Onboarding feature folder + UI migration** — unblocks
   `onboarding-feat/` deletion.
