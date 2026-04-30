# Maintain → eventSphere Architecture Migration Plan

Branch: `migrate-to-eventsphere-architecture`

This file is the working roadmap for aligning the Maintain (property
maintenance) codebase with the eventSphere architecture. It tracks what
has shipped, what is in progress, and what still needs to be done. Update
this file as phases land.

## Source of truth

- eventSphere reference: `/Users/wealthiduwe/Developer/eventSphere/ENGINEERING_PATTERNS.md`
- Maintain patterns: `./ENGINEERING_PATTERNS.md`
- Permission registry: `src/shared/auth/permission-registry.ts`
- Role taxonomy: `src/shared/auth/roles.ts`

## Domain mapping (eventSphere → Maintain)

| eventSphere concept    | Maintain concept                          |
| ---------------------- | ----------------------------------------- |
| `event`                | `property` + `unit` (the asset graph)     |
| `reservation`          | `ticket` (work order)                     |
| `volunteer`            | `technician_request` (work assignment)    |
| `business` (workspace) | `business` (workspace, already exists)    |
| `workspace_admin`      | `property_manager` workspace role         |
| `workspace_finance`    | `accountant` workspace role               |
| `workspace_member`     | `member` workspace role                   |
| event-scoped roles     | not applicable — replaced by USER_TYPE for tenants and technicians |

## Phase 1 — Foundations (DONE in this branch)

- [x] `ENGINEERING_PATTERNS.md` adapted for Maintain domain
- [x] `src/lib/errors/apiError.ts` — server-side `ApiError`,
      `errorToNextResponse`, `parseOrThrow`, Zod + Mongoose normalisers
- [x] `src/utils/apiError.ts` — client-side `ApiErrorHandler` upgraded with
      `extract` / `toUIError`, structured `UIError` shape, backward-compatible
      `parse` signature
- [x] `src/shared/auth/roles.ts` — `PLATFORM_ROLE`, `WORKSPACE_ROLE`,
      `USER_TYPE`, label and resolver helpers
- [x] `src/shared/auth/permission-registry.ts` — full permission key set
      for properties, units, tickets, technician requests, ticket
      taxonomy, tenants, technicians, team, chat, reports, settings;
      default workspace-role permission sets
- [x] `src/lib/auth/permission-guards.ts` — `hasPermission`,
      `assertPermission`, `assertAnyPermission`, effective-permission
      resolver

## Phase 2 — UI error surface + missing primitives

- [ ] Install `@radix-ui/react-collapsible` and add the shadcn
      `collapsible` primitive at `src/components/ui/collapsible.tsx`
- [ ] Add `src/lib/helpers/scroll-to-element.ts` (port from eventSphere)
- [ ] Add `src/components/ui/ErrorList.tsx` (port from eventSphere)
- [ ] Replace the loose `toast.error(ApiErrorHandler.parse(err))` pattern
      with `ErrorList error={mutation.error}` in the existing ticket,
      property, and user dialogs
- [ ] Add a shared `AppDialogShell` and `AppSheetShell` under
      `src/shared/components/` to standardise dialog/sheet structure

## Phase 3 — Auth session + dashboard guard

- [ ] Add `src/models/authSessionModel.ts` (DB-tracked sessions)
- [ ] Refactor `src/lib/auth/getVerifiedUser.ts` to return a
      discriminated union (`{ status: "authorized" | "unauthenticated"
      | "inactive_business", user? }`) and to populate
      `workspaceRole` and `platformRole` alongside the legacy `role`
      field
- [ ] Add `src/lib/auth/requireDashboardAccess.ts` and replace the
      duplicated `getVerifiedUser` + `redirect` logic in every
      `app/admin/dashboard/**`, `app/technician/dashboard/**`, and
      `app/(users)/dashboard/**` page
- [ ] Update `src/middleware.ts` to defer to `requireDashboardAccess` for
      role-based redirects rather than decoding role from the JWT inline

## Phase 4 — Configurable roles & permissions persistence

- [ ] Add `src/models/roleDefinitionModel.ts` — workspace-owned role
      definitions with a `permissionKeys: string[]` field
- [ ] Add `src/models/userPermissionOverrideModel.ts` — per-member direct
      `allow` / `deny` overrides
- [ ] Wire `resolveEffectivePermissions` (in `permission-guards.ts`) to
      read from the new models when available, falling back to the
      static defaults in the registry
- [ ] Seed default role definitions on workspace creation
- [ ] Add `GET /api/team/roles`, `POST /api/team/roles`,
      `PATCH /api/team/roles/[id]`, `DELETE /api/team/roles/[id]` and the
      matching team permission endpoints

## Phase 5 — Feature folder migration

Tickets first, then properties/units, then team, then settings. Each
feature gets the canonical
`components/ data/ forms/ helpers/ hooks/ list/ models/ services/`
structure. The existing `src/app/admin/dashboard/.../helper.ts` files
become feature `helpers/` and `data/`. The existing custom Table
component is preserved during the move; only callers are updated to the
typed query-key + filter-schema pattern.

For each feature:

- [ ] Extract status/priority constants into `*-status.model.ts` etc.
- [ ] Extract Zod schemas into `*-form.model.ts`
- [ ] Move axios calls into `services/`
- [ ] Add typed query-key map in `hooks/`
- [ ] Replace inline permission/role checks with `assertPermission` and
      `hasPermission`

Order of attack:

1. tickets
2. technician-requests
3. properties
4. units
5. tenants
6. technicians
7. team (staff management)
8. settings
9. dashboard
10. chat

## Phase 6 — API route hardening

For every route under `src/app/api/**`:

- [ ] Body parsing through `parseOrThrow(Schema, body)`
- [ ] Permission enforced with `assertPermission`
- [ ] Workspace ownership verified via `currentBusiness`
- [ ] All thrown errors returned via `errorToNextResponse`
- [ ] Remove any hand-built `{ error: ... }` payloads
- [ ] List routes adopt the
      `parseOrThrow → buildApiFeaturesQuery → applyFilters` pipeline
      with a feature `*ListQuerySchema`

## Phase 7 — Email feature boundary

- [ ] Move HTML composition out of routes into `src/lib/email/senders/`
- [ ] Split `src/lib/email/` into the canonical
      `clients/ defaults/ helpers/ models/ senders/` shape
- [ ] One template key per customer-facing action (ticket created,
      ticket assigned, technician request, status changed, etc.)

## Phase 8 — Dashboard / sidebar parity

- [ ] Adopt the eventSphere `(dashboard)` route group layout
- [ ] Replace `crumbLabelMap` with the eventSphere breadcrumb pattern
- [ ] Move dashboard skeletons into feature `components/*Skeleton.tsx`
      and wrap pages in `<Suspense>`
- [ ] Consolidate the three role-specific layouts (admin, technician,
      users) behind one layout that branches on workspace role +
      USER_TYPE

## Phase 9 — Lint enforcement

- [ ] Add `no-nested-ternary: error` to ESLint
- [ ] Add `npm run lint:no-nested-ternary` script
- [ ] Add a custom rule (or grep CI check) banning `currentBusiness:
      string` literals in API routes — must come from `getVerifiedUser`

## Phase 10 — Cleanup

- [ ] Delete legacy helper paths after callers move
- [ ] Remove dead role-string branches once permission-key checks are
      everywhere
- [ ] Final pass: typecheck, lint, build

## Notes

- The legacy `ROLES` enum in `src/shared/enums/enums.ts` is preserved on
  purpose — middleware, API guards, and the user `memberships[].role`
  field still consume it. The new `WORKSPACE_ROLE` / `USER_TYPE` enums
  layer on top via `resolveWorkspaceRole` and `toLegacySessionRole`.
- Tenants and technicians are NOT workspace roles in the new model.
  They are `USER_TYPE` actors who are members of a workspace but consume
  the app from the resident / service-provider side. Permissions for
  them are gated via `USER_TYPE` checks, not `WORKSPACE_ROLE` checks.
- Phase 1 introduces no breaking changes: the new files are additive,
  and the existing `ApiErrorHandler.parse(err)` callers continue to
  work because the upgraded handler keeps the same single-arg signature.
