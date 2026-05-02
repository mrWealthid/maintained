# Maintain Engineering Patterns

This document is the project-level implementation guide for how new code
should be written in the Maintain (property maintenance) codebase. It is
adapted from the EventSphere engineering patterns and tailored to the
property / unit / ticket / technician domain of this app.

## Purpose

Use this guide when adding or refactoring:

- API routes
- feature hooks
- services
- Mongoose models
- form models
- Zod schemas
- React Query integrations
- status handling
- conditional UI logic
- role and permission checks

The goal is consistency, fewer regressions, and code that is easy to review.

## Core Rule Set

These are hard rules for new code:

- Do not use nested ternary expressions.
- Do not build deeply nested or hard-to-scan `if` / `else if` trees.
- Do not use magic strings for statuses, roles, actions, or lifecycle values.
- Prefer shared constants, enums, or object maps.
- Validate inputs with Zod before using them. Use `parseOrThrow` from
  `src/lib/errors/apiError.ts` so validation errors produce a structured
  422 response automatically.
- Keep transport logic in services, not components.
- Keep cache invalidation in hooks, not services.
- Keep business persistence in Mongoose models and API routes, not UI code.
- Use typed query keys for React Query where the feature has multiple
  related queries.
- Put static UI config maps in feature `data/` files, not inside pages or
  components.
- Put feature and shared types/interfaces in `models/` or `model/` files,
  not inside list pages, helper files, or components.
- For role-based dashboard pages, gate access through the dashboard guard
  helper and pass the allowed roles or permission keys explicitly.
- Break multistep pages, dialogs, and sheets into dedicated step components.
- Flatten conditional logic with guard clauses before adding more branches.
- For list endpoints, do not cast `searchParams` through `unknown` and
  mutate ad hoc query objects inline. Parse them with a strict feature
  `*ListQuerySchema`, build a typed query object, and apply the filter
  mapping in a feature helper.
- Client components must not make inline feature API calls with raw
  `fetch` or ad hoc Axios usage. Route feature network requests through
  the feature `service/` or `services/` layer using the shared `http`
  client, then expose them through a feature hook for the component to
  consume.

## Project Structure

The project follows a feature-first structure with shared infrastructure:

- `src/app/`              App Router pages and API routes
- `src/features/`         Feature components, hooks, services, models, helpers, forms
- `src/models/`           Mongoose schemas and persistence models
- `src/lib/`              Shared business logic, validators, error handling, auth helpers
- `src/shared/`           Reusable shells, routes, table helpers, shared components
- `src/components/ui/`    Low-level UI primitives (shadcn)

## Feature Folder Pattern

Most feature areas follow this shape:

- `components/`  UI components specific to the feature
- `data/`        Static feature config, confirm-dialog maps, option lists, labels
- `hooks/`       React Query hooks and client orchestration
- `services/` or `service/`  HTTP request functions, transport-layer typing
- `models/` or `model/`      DTOs, status constants, schemas, feature types
- `forms/`       Form containers and step components
- `helpers/`     Pure transformations and formatting
- `list/`        Table/list views and row renderers

Examples:

- `src/features/tickets/`
- `src/features/properties/`
- `src/features/units/`
- `src/features/tenants/`
- `src/features/technicians/`
- `src/features/team/`
- `src/features/settings/`

## Models vs Form Models

Keep these separate.

### Domain Models

Use feature `model` or `models` files for:

- DTOs returned by APIs
- feature types
- status constants
- shared feature-level schemas

Examples:

- `src/features/tickets/models/ticket.model.ts`
- `src/features/tickets/models/ticket-status.model.ts`
- `src/features/tickets/models/ticket-priority.model.ts`
- `src/features/properties/models/property.model.ts`

### Form Models

Use `*-form.model.ts` files for Zod form schemas, form-only input coercion,
step-level validation, and `z.infer<>` output/input types for `react-hook-form`.

Examples:

- `src/features/tickets/models/ticket-form.model.ts`
- `src/features/properties/models/property-form.model.ts`
- `src/features/settings/models/settings-form.model.ts`

Domain models describe the business shape. Form models describe UI/form
input shape. Do not merge both concerns into one file unless the feature
is genuinely tiny.

## Status, Role, and Action Constants

Do not write raw literals like `"pending"`, `"admin"`, `"assigned"`,
`"checked_in"`. Use shared constants instead.

Patterns already in the repo:

- `TICKET_STATUS`, `TICKET_PRIORITY`, `TECHNICIAN_RESPONSE`, `INVITE_STATUS`,
  `ROLES` from `src/shared/enums/enums.ts`
- `WORKSPACE_ROLE`, `PLATFORM_ROLE`, `USER_TYPE` from `src/shared/auth/roles.ts`
- `PERMISSION` keys from `src/shared/auth/permission-registry.ts`

Preferred pattern:

```ts
export const TICKET_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export const TICKET_PRIORITY_VALUES = Object.values(TICKET_PRIORITY);
export type TicketPriority = (typeof TICKET_PRIORITY_VALUES)[number];

export function isTicketPriority(value: string): value is TicketPriority {
  return TICKET_PRIORITY_VALUES.includes(value as TicketPriority);
}
```

If a string controls behaviour, lookup, filtering, or persistence, extract
it into a shared constant/object map first. Inline user-facing copy is
fine; inline control values are not.

## No Nested Ternaries

Banned. Use one of these patterns instead:

### Pattern 1: Config Object

```ts
const TICKET_STATUS_META = {
  PENDING:    { label: "Pending",    className: "text-amber-600" },
  ASSIGNED:   { label: "Assigned",   className: "text-sky-600"   },
  COMPLETED:  { label: "Completed",  className: "text-emerald-600" },
} as const;

const meta = TICKET_STATUS_META[status] ?? TICKET_STATUS_META.PENDING;
```

### Pattern 2: Helper Function

```ts
function getAssignLabel(isPending: boolean, isAssigned: boolean) {
  if (isPending) return "Assigning...";
  if (isAssigned) return "Reassign";
  return "Assign";
}
```

### Pattern 3: Explicit Branches Before JSX

```tsx
let content: ReactNode;
if (isPending) content = <Spinner />;
else if (isAssigned) content = <AssignedBadge />;
else content = <DefaultBadge />;
```

If UI state needs both style and label, resolve both from the same map.

## Zod-First Validation

All external input should be validated with Zod before use.

### In API Routes

```ts
import { parseOrThrow } from "@/lib/errors/apiError";

const BodySchema = z.object({
  title: z.string().min(1),
  unitId: z.string().min(1),
});

const body = await request.json();
const parsed = parseOrThrow(BodySchema, body);
```

### In Forms

```ts
const form = useForm<TicketFormValues>({
  resolver: zodResolver(TicketFormSchema),
  defaultValues,
});
```

### Zod Location Rules

- API body schemas can live close to the route if route-specific
- reusable feature schemas belong in the feature `models/` folder
- shared validators belong in `src/lib/validation/`

## React Query Pattern

Use React Query in hooks, not directly in page components unless the page
is the feature root and the case is small.

### Query Hook Responsibilities

Hooks should own:

- `useQuery` / `useMutation`
- query keys
- cache invalidation
- toasts for mutation success/error where appropriate

### Service Responsibilities

Services should own:

- actual HTTP request calls
- request/response typing
- route construction
- query string building
- transport error translation via `ApiErrorHandler.toUIError`

Services should NOT show toasts, invalidate caches, or hold UI state.

### Query Key Pattern

```ts
export const TICKET_KEYS = {
  all: ["tickets"] as const,
  list: (filter: TicketListFilter) => ["tickets", "list", filter] as const,
  byId: (id: string) => ["tickets", id] as const,
};
```

## Service Layer Pattern

Use:

- the shared `http` axios client
- `API_ROUTES` from `src/shared/routes/apiRoutes.ts`
- `ApiErrorHandler.toUIError` for transport failures

```ts
export async function fetchTicket(id: string) {
  try {
    const { data } = await http.get(API_ROUTES.tickets.byId(id));
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
```

## API Route Pattern

API routes should follow this order:

1. `await connectDb()`
2. parse and validate input (Zod via `parseOrThrow`)
3. authenticate and verify workspace ownership
4. enforce permission with `assertPermission` from
   `src/lib/auth/permission-guards.ts`
5. run persistence logic
6. return typed JSON
7. convert all thrown errors with `errorToNextResponse`

```ts
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { assertPermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const body = parseOrThrow(BodySchema, await request.json());

    const user = await getVerifiedUser();
    if (!user) throw ApiError.unauthorized();

    assertPermission(
      { workspaceRole: user.workspaceRole, platformRole: user.platformRole },
      PERMISSION.TICKETS_CREATE,
    );

    const ticket = await Ticket.create({ ...body, business: user.currentBusiness });
    return NextResponse.json({ ok: true, data: ticket }, { status: 201 });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
```

## Error Handling Pattern

Standardised across three layers:

1. **API routes** throw `ApiError` from `src/lib/errors/apiError.ts` and
   return via `errorToNextResponse`.
2. **Services** normalise transport errors with `ApiErrorHandler.toUIError`
   from `src/utils/apiError.ts`.
3. **UI** surfaces failures with `ErrorList` (added in Phase 2 of the
   migration); until then components fall back to `ApiErrorHandler.parse`
   for a string message.

Use the built-in helpers where possible:

- `ApiError.badRequest(...)`
- `ApiError.unauthorized(...)`
- `ApiError.forbidden(...)`
- `ApiError.notFound(...)`
- `ApiError.conflict(...)`
- `ApiError.tooMany(...)`
- `ApiError.internal(...)`
- `ApiError.unavailable(...)`

API routes should throw, not hand-build `{ error: ... }` responses. Route
catch blocks should use `errorToNextResponse(...)`. Trust Zod and Mongoose
normalisation already handled inside `apiError.ts`.

## Mongoose Model Pattern

Use `src/models/` for persistence concerns only:

- schema definitions
- enum/value arrays sourced from feature constants
- pre-validate / pre-save hooks
- derived field normalisation

Models should NOT contain UI DTOs, React-specific state, or form-only
coercion logic. Source enum value arrays from the corresponding feature
constants file (e.g. `TICKET_STATUS_VALUES`) rather than hardcoding string
arrays in the schema.

## Roles and Permissions

The Maintain app uses a two-tier role taxonomy plus a permission registry:

- **PLATFORM_ROLE** — system-wide roles (super admin)
- **WORKSPACE_ROLE** — scoped to a property-management business:
  - `owner`
  - `property_manager`
  - `maintenance_coordinator`
  - `accountant`
  - `member`
- **USER_TYPE** — non-staff actors preserved from the legacy `ROLES` enum:
  - `tenant` (resident)
  - `technician` (service provider)

All behaviour-controlling checks reference a permission key from
`src/shared/auth/permission-registry.ts`, never a raw role string.

```ts
import { PERMISSION } from "@/shared/auth/permission-registry";
import { assertPermission, hasPermission } from "@/lib/auth/permission-guards";

assertPermission(ctx, PERMISSION.TICKETS_ASSIGN);
if (hasPermission(ctx, PERMISSION.TICKETS_EXPORT)) { /* show button */ }
```

The permission registry is the source of truth. Adding a new behaviour:

1. Add a `PERMISSION.*` key in `permission-registry.ts`.
2. Add it to the appropriate role's default permission list.
3. Reference the key in routes and UI; never hardcode role checks.

## Routing Pattern

Use `API_ROUTES` for API paths. All API endpoints must be defined in
`src/shared/routes/apiRoutes.ts`. Do not inline API route strings across
services, hooks, client components, shared utilities, or route-to-route
server calls.

Use `APP_ROUTES` for app/page navigation paths.

## Naming Conventions

- `useFeatureThing` for hooks
- `fetchThing`, `createThing`, `updateThing`, `deleteThing` for services
- `ThingSchema` for Zod schemas
- `ThingFormSchema` for form schemas
- `THING_STATUS` for status constants, `THING_STATUS_VALUES` for value arrays
- `isThingStatus` for type guards
- `ThingListFilter`, `ThingListResponse`, `ThingListItem` for list contracts

## Authoring Checklist For New Features

Before writing:

- define statuses/roles/actions/permissions as constants
- decide DTO model vs form model
- decide if schema belongs in feature model or route-local file
- identify which `PERMISSION` keys gate the behaviour

While writing:

- no nested ternaries
- no raw status strings
- no raw permission/role strings
- no route string duplication
- no HTTP calls directly in components
- no cache invalidation inside services

Before closing:

- run ESLint on touched files
- run TypeScript check
- verify query invalidation paths
- verify API validation path
- verify UI labels/styles come from config or helpers

## Final Standard

New code should read like this:

- typed
- validated
- feature-local
- constant-driven
- query-safe
- service-separated
- map-based instead of ternary-based
- permission-checked rather than role-string-checked

If a new feature violates these rules, treat it as incomplete.
