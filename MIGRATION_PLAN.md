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

- [x] Install `@radix-ui/react-collapsible` and add the shadcn
      `collapsible` primitive at `src/components/ui/collapsible.tsx`
- [x] Add `src/lib/helpers/scroll-to-element.ts` (port from eventSphere)
- [x] Add `src/components/ui/ErrorList.tsx` (port from eventSphere)
- [ ] Replace the loose `toast.error(ApiErrorHandler.parse(err))` pattern
      with `ErrorList error={mutation.error}` in the existing ticket,
      property, and user dialogs
- [x] Add a shared `AppDialogShell` and `AppSheetShell` under
      `src/shared/components/` to standardise dialog/sheet structure

## Phase 3 — Auth session + dashboard guard

- [x] Add `src/models/authSessionModel.ts` (DB-tracked sessions)
- [x] Add session helpers in `src/lib/auth/session.ts` and issue
      session-backed JWTs for login/register/password flows. No backfill
      script is needed because the database will be dropped before this
      branch is promoted.
- [x] Refactor `src/lib/auth/getVerifiedUser.ts` to return a
      discriminated union (`{ status: "authorized" | "unauthenticated"
      | "inactive_business", user? }`) and to populate
      `workspaceRole` and `platformRole` alongside the legacy `role`
      field
- [x] Add `src/lib/auth/requireDashboardAccess.ts` and replace the
      duplicated `getVerifiedUser` + `redirect` logic in every
      `app/admin/dashboard/**`, `app/technician/dashboard/**`, and
      `app/(users)/dashboard/**` page
- [x] Update `src/middleware.ts` to align with the session-backed JWT
      contract. Middleware remains an Edge-safe coarse redirect layer;
      `requireDashboardAccess` is the authoritative DB-backed guard in
      server layouts.

## Phase 4 — Configurable roles & permissions persistence

- [x] Add `src/models/roleDefinitionModel.ts` — workspace-owned role
      definitions with eventSphere-style `permissions: string[]`
- [x] Add `src/models/userPermissionOverrideModel.ts` — per-member direct
      `allow` / `deny` overrides
- [x] Wire `resolveEffectivePermissions` (in `permission-guards.ts`) to
      read from the new models when available, falling back to the
      static defaults in the registry
- [x] Seed default role definitions on workspace creation
- [x] Add `GET /api/team/roles`, `POST /api/team/roles`,
      `PATCH /api/team/roles/[id]`, `DELETE /api/team/roles/[id]` and the
      matching team permission endpoints

## Phase 5 — Feature folder migration

Each feature gets the canonical structure:
`components/ data/ forms/ helpers/ hooks/ list/ models/ services/`.
The existing custom Table component is preserved during the move; only
callers are updated to the typed query-key + filter-schema pattern.

For each feature:

- [ ] Extract status/priority constants into `*-status.model.ts` etc.
- [ ] Extract Zod schemas into `*-form.model.ts`
- [ ] Move axios calls into `services/` using `ApiErrorHandler.toUIError`
- [ ] Add typed `*_KEYS` query-key map in `hooks/`
- [ ] Replace inline permission/role checks with `assertPermission` and
      `hasPermission`

Status:

| Feature              | Constants | Schemas | Service | Hooks | Components | List | Forms |
| -------------------- | --------- | ------- | ------- | ----- | ---------- | ---- | ----- |
| tickets              | done      | done    | done    | done  |            |      |       |
| properties           | done      | done    | done    | done  |            |      |       |
| units                |           | done    | done    | done  |            |      |       |
| tenants              | done      | done    | done    | done  |            |      |       |
| technicians          | done      | done    | done    | done  |            |      |       |
| team                 |           | done    | done    | done  |            |      |       |
| chat                 | done      |         | done    | done  |            |      |       |
| settings             |           |         |         |       |            |      |       |
| dashboard            |           |         |         |       |            |      |       |
| technician-requests  | done\*    |         |         |       |            |      |       |

\* technician-response constants are in `src/features/tickets/models/`
because the request entity is currently part of the ticket model graph.
A dedicated `src/features/technician-requests/` folder is needed before
that layer can take services + hooks.

Remaining for each feature: components/list/forms (the UI layer). These
are migrated only when the underlying page or dialog is touched —
existing legacy code under `src/features/*-feat/` keeps working
unchanged during the rollout.

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

Status:

- [x] `POST /api/tickets` (canonical example)
- [x] `GET /api/tickets` (catch block converted)
- [x] core auth routes (`login`, `logout`, `register`, `forgotPassword`,
      `resetPassword`, `updatePassword`) now use Zod request schemas,
      `parseOrThrow`, `ApiError`, and `errorToNextResponse`
- [x] property/unit routes (`/api/properties`, `/api/units`,
      `/api/units/bulk`, `/api/units/my`) now use verified session context,
      permission keys, Zod parsing, workspace ownership checks, and
      `errorToNextResponse`
- [x] user/users routes (`/api/users`, `/api/users/[userId]`,
      `/api/users/me`, `/api/users/switch-business`,
      `/api/users/invite-user`, `/api/user/change-password`,
      `/api/user/notification-preferences`) now use verified session
      context, permission keys where applicable, Zod parsing, workspace
      ownership checks, and `errorToNextResponse`
- [ ] all other ticket routes
- [x] all property/unit routes
- [ ] all auth routes
- [x] all user/users routes
- [ ] all chat routes
- [ ] all onboarding routes

## Phase 7 — Email feature boundary

- [ ] Move HTML composition out of routes into `src/lib/email/senders/`
- [ ] Split `src/lib/email/` into the canonical
      `clients/ defaults/ helpers/ models/ senders/` shape
- [ ] One template key per customer-facing action (ticket created,
      ticket assigned, technician request, status changed, etc.)

## Phase 8 — Dashboard / sidebar parity

- [x] Consolidate the three role-specific layouts (admin, technician,
      users) behind a shared `DashboardChrome` shell. Layouts now
      declare only role gating + which `layoutConfig` entry to render.
- [ ] Move dashboard skeletons into feature `components/*Skeleton.tsx`
      and wrap pages in `<Suspense>`
- [ ] Replace `crumbLabelMap` with the eventSphere breadcrumb pattern
      once the breadcrumb component itself is touched

## Phase 9 — Lint enforcement

- [x] Add `no-nested-ternary: error` to ESLint
- [x] Add `npm run lint:no-nested-ternary` script and clear existing
      violations
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
