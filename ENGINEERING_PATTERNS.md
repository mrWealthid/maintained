# EventSphere Engineering Patterns

This document is the project-level implementation guide for how new code should be written in this repository.

It is based on the patterns already present in the codebase and the standards now being enforced.

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

The goal is consistency, fewer regressions, and code that is easy to review.

## Core Rule Set

These are hard rules for new code:

- Do not use nested ternary expressions.
- Do not build deeply nested or hard-to-scan `if` / `else if` trees.
- Do not use magic strings for statuses, roles, actions, or lifecycle values.
- Prefer shared constants, enums, or object maps.
- Validate inputs with Zod before using them.
- Keep transport logic in services, not components.
- Keep cache invalidation in hooks, not services.
- Keep business persistence in Mongoose models and API routes, not UI code.
- Every customer-facing email action must have its own dedicated template key. Do not piggyback a new action onto an existing template because the copy looks similar.
- Use typed query keys for React Query where the feature has multiple related queries.
- Put static UI config maps in feature `data/` files, not inside pages or components.
- Put feature and shared types/interfaces in `models/` or `model/` files, not inside list pages, helper files, or components.
- For role-based dashboard pages, use the shared route guard helper and pass the allowed roles explicitly.
- Break multistep pages, dialogs, and sheets into dedicated step components.
- Keep multistep parent components focused on orchestration only: step state, validation flow, submit flow, and derived summaries.
- Do not leave large step sections inline inside a dialog/page component when the flow has multiple stages.
- When list-route query logic grows beyond a couple of filters, extract query/filter mapping into a feature helper file instead of leaving long inline route condition blocks.
- For enum-like or table-driven branching, prefer object maps first, then `switch` if control flow needs branching behavior.
- For enum-like list filters in routes, prefer switch-based helper functions over repeated inline `if` chains.
- Flatten conditional logic with guard clauses before adding more branches.
- For list endpoints, do not cast `searchParams` through `unknown` and mutate ad hoc query objects inline. Parse them with a strict feature `*ListQuerySchema`, build a typed `*ApiFeaturesQuery`, and apply the filter mapping in a feature helper.
- Reservation and volunteer signup routes must centralize pre-create eligibility checks in shared helpers. Do not rewrite event active-state, closeout, registration window, cutoff, duplicate-email, or slot-validity guards inline in each route.
- Client components must not make inline feature API calls with raw `fetch` or ad hoc Axios usage. Route feature network requests through the feature `service/` or `services/` layer using the shared `http` client, then expose them through a feature hook for the component to consume.
- For binary downloads such as tickets, PDFs, or exports, the request still belongs in the feature service and hook. The component may only handle browser-only behavior like `Blob` save/download UI after the hook resolves.

## Email Template Ownership

Email actions are first-class product behavior and must be modeled explicitly.

Rules:

- Every distinct business email action must have a dedicated business template key.
- Every distinct app-owned email action must have a dedicated app template key.
- Do not reuse confirmation templates for waitlist, restore, cancellation, check-in, payment receipt, or schedule-update flows.
- Do not send a new customer-facing action through `sendBusinessTransactionalEmail` when that action should be configurable in business settings.
- When adding a new email action, update all of the following in the same change:
  - the template enum or key registry
  - default template definitions
  - settings schema defaults
  - settings UI template list
  - template editor defaults and preview variables when needed
  - the runtime send path so the action actually uses the new dedicated template
- If an existing flow currently piggybacks on another template, treat splitting it into its own template as a maintainability fix, not an optional enhancement.

## Email Feature Boundary

Email composition and delivery must be discoverable from `src/lib/email/`.

Rules:

- All business-email and app-email send paths must live under `src/lib/email/`.
- API routes, closeout jobs, webhook handlers, and feature services may orchestrate when an email should be sent, but they must not build email HTML inline.
- Do not append flow-specific `extraHtml`, CTA blocks, QR sections, attachment descriptions, or summary markup directly inside routes, jobs, or unrelated business modules.
- If a flow needs custom email content, create or extend a dedicated sender in `src/lib/email/senders/`.
- If multiple senders share composition logic, move that logic into `src/lib/email/helpers/`.
- If an email flow needs flow-specific argument types, move them into `src/lib/email/models/`.
- Use `src/lib/email/clients/` only as low-level delivery clients. Do not treat client calls in routes as the final architecture for customer-facing flows.
- A route may call `sendAppTemplateEmail`, `sendBusinessTemplateEmail`, or `sendBusinessTransactionalEmail` directly only when it is dispatching an existing standard template with no flow-specific HTML composition and no reusable business logic is being introduced.
- If a route needs attachments, QR codes, delivery-mode branching, content sections, or more than basic variable mapping, that flow must be moved into a dedicated sender file.
- Email-only HTML builders must not live in `src/lib/reporting/`, `src/lib/reservations/`, `src/lib/events/`, or route files. Put them in `src/lib/email/helpers/`.
- Treat any new inline email markup outside `src/lib/email/` as an architecture violation to fix before merge.

Recommended structure:

- `src/lib/email/clients/`
  low-level providers and transport helpers
- `src/lib/email/defaults/`
  default template definitions and seed content
- `src/lib/email/helpers/`
  reusable email HTML builders, variable builders, link helpers, and formatting helpers
- `src/lib/email/models/`
  sender args, template variable contracts, and shared email flow types
- `src/lib/email/senders/`
  flow-specific senders grouped by domain such as reservations, volunteers, reports, surveys, events, and audience

Review checklist:

- If this change introduces a new email action, is there a dedicated template key?
- Can another engineer find the full send path by starting in `src/lib/email/senders/`?
- Does any non-email module now contain email HTML, `extraHtml`, or attachment composition?
- Is the route/job/webhook only orchestrating, while the sender owns composition and delivery?
- Are shared email fragments/helpers extracted instead of duplicated across flows?

## Reservation Cancellation And Restore Exception

Cancelled reservations have one intentional lifecycle exception that must not be "normalized away" in future refactors.

Rules:

- A cancelled paid reservation may keep `paymentStatus = paid` when the cancellation is completed without a refund.
- Do not automatically flip a cancelled paid reservation to `unpaid` just because the reservation is cancelled.
- Refund remains an explicit follow-up action. If the user or admin opts in to refund, update the reservation payment state to `refunded` and clear paid amounts accordingly.
- Restore logic must respect the stored payment state:
  - cancelled + `paymentStatus = paid` restores without requiring another payment
  - cancelled + unpaid/failed payment state may restore back into `pending` and continue through the normal payment flow
- Cancel and refund are related but separate operations. Do not couple restore to refund, and do not force a new payment requirement on a previously paid cancelled reservation unless a refund already happened.
- When a reservation is cancelled, invalidate active payment-continuation state such as checkout sessions or hold expiries so a cancelled reservation cannot continue payment through a stale link.
- If a cancelled paid reservation still needs money returned, expose refund as a dedicated action instead of overloading restore.

Why this exception exists:

- Cancellation answers whether the booking is active.
- Refund answers whether money was returned.
- Payment status should reflect money state, not just booking state.
- Keeping those concerns separate preserves correct audit history and makes restore behavior predictable.

## Project Structure

The project follows a feature-first structure with shared infrastructure:

- `src/app/`
  App Router pages and API routes
- `src/features/`
  Feature-level components, hooks, services, models, helpers, forms
- `src/models/`
  Mongoose schemas and persistence models
- `src/lib/`
  shared business logic, validators, error handling, ticket logic, reservation helpers
- `src/shared/`
  reusable shells, routes, table helpers, shared components
- `src/components/ui/`
  low-level UI primitives

## Feature Folder Pattern

Most feature areas follow this shape:

- `components/`
  UI components specific to the feature
- `data/`
  static feature config, confirm-dialog maps, option lists, labels, and metadata
- `hooks/`
  React Query hooks and client orchestration
- `services/` or `service/`
  HTTP request functions and transport-layer typing
- `models/` or `model/`
  DTOs, schemas, status constants, feature types
- `forms/`
  form containers and step components
- `helpers/`
  pure transformations and formatting logic
- `list/`
  table/list views and row renderers
- `components/<feature-flow>/steps/`
  dedicated step components for large admin/public multistep flows when the UI is not part of `forms/`

For non-UI feature modules under `src/lib/`, use the same explicit structure when the area grows beyond a single file:

- name the parent module after the actual capability, not a vague container
- prefer discoverable roots like `src/lib/pdf/`, `src/lib/reporting/`, `src/lib/email/`
- do not create a separate root module when the code is only supporting one existing feature module; keep single-consumer helpers and models inside that feature instead
- avoid generic parents like `document/` when the real feature is specifically PDF generation
- use subfolders named by responsibility
- `data/`
  static feature content, config maps, seed structures, and document source content
- `generators/`
  top-level entrypoints such as `generate...` functions
- `helpers/`
  shared rendering, formatting, orchestration, and composition helpers
- `models/`
  extracted input types, DTOs, section types, and helper argument contracts
- `styles/`
  extracted style builders or style maps for output-specific rendering

Rules:

- do not leave large feature-specific types inline inside generator or helper files once the module has multiple documents/flows
- if a document or artifact is driven by a large static content payload, keep that payload in `data/` inside the owning feature instead of creating a separate single-purpose root module
- do not keep large inline style templates inside generator files when the module already has a dedicated `styles/` area
- shared feature logic belongs in `helpers/`; generator files should stay focused on assembling the final output
- if a module has multiple generated artifacts, each artifact should have a clearly named generator file and matching style/model files where needed
- keep folder names role-based and pluralized when they contain multiple files: `data/`, `helpers/`, `models/`, `styles/`, `generators/`

Examples:

- `src/features/events/`
- `src/features/reservations/`
- `src/features/volunteers/`
- `src/features/team/`
- `src/features/settings/`
- `src/lib/pdf/`
- `src/lib/email/`

## Data Files

Use feature `data/` files for static configuration only.

Good candidates:

- confirm dialog config maps
- badge metadata maps
- select/radio option definitions
- static labels and descriptions
- feature-level empty-state copy

Examples:

- `src/features/events/data/list-data.ts`
- `src/features/reservations/data/list-data.ts`
- `src/features/volunteers/data/list-data.ts`

Rule:

- if the object is static configuration, it belongs in `data/`
- if the object needs a type, define that type in a `models/` or `model/` file and import it into the `data/` file
- do not leave large `*_CONFIG` objects inside page, list, or row components

Multistep flow rule:

- step labels, option cards, review badge metadata, and other static step config belong in feature `data/`
- schemas and shared step types belong in `models/` or `model/`
- the parent dialog/page imports those files and composes step components

## Models vs Form Models

Keep these separate.

### Domain Models

Use feature `model` or `models` files for:

- DTOs returned by APIs
- feature types
- status constants
- shared feature-level schemas

Examples:

- `src/features/reservations/models/reservation.model.ts`
- `src/features/reservations/models/reservation-status.model.ts`
- `src/features/reservations/models/payment-status.model.ts`
- `src/features/reservations/models/reservation-list.model.ts`
- `src/features/events/models/event-status.model.ts`
- `src/features/events/models/event-list.model.ts`
- `src/features/team/models/team.model.ts`
- `src/features/volunteers/model/volunteer-list.model.ts`
- `src/shared/model/action-confirm.model.ts`

### Form Models

Use `*-form.model.ts` files for:

- Zod form schemas
- form-only input coercion
- step-level validation rules
- `z.infer<>` output/input types for `react-hook-form`

Examples:

- `src/features/events/models/event-form.model.ts`
- `src/features/reservations/models/reservation-form.model.ts`
- `src/features/settings/models/settings-form.model.ts`
- `src/features/settings/models/app-settings-form.model.ts`
- `src/features/survey/models/survey-form-model.ts`

Rule:

- domain models describe the business shape
- form models describe UI/form input shape
- feature UI types, config interfaces, and list/view-specific type aliases still belong in `models/` or `model/`
- generator input contracts, render section types, and helper argument types for non-UI modules should also be extracted into `src/lib/<feature>/models/` once reused or once a file becomes large

Do not merge both concerns into one file unless the feature is genuinely tiny.

Admin multistep dialogs should follow the same pattern:

- `*-form.model.ts` for admin dialog schema and form value types
- feature `data/` for static step labels/options
- dedicated step components for contact/details, selection, guest/slot assignment, and review
- parent dialog owns only open state, step transitions, mutation calls, and summary derivation

## Status, Role, and Action Constants

Do not write raw literals like:

- `"paid"`
- `"pending"`
- `"admin"`
- `"deactivate"`
- `"checked_in"`

Use shared constants instead.

Enforcement:

- Treat new raw control literals as a review blocker, not a cleanup item for later.
- This rule applies to statuses, roles, actions, event types, recurrence types, lifecycle values, route/action mode flags, and other branching keys.
- If a string changes behavior, lookup, filtering, or persistence, extract it into a shared constant/object map first.
- Inline user-facing copy is fine; inline control values are not.
- Do not introduce "one-off" literals just because they are only used in one file today. If the value controls behavior, give it a named constant from day one.
- Prefer feature-owned constants in `models/`, `model/`, or shared enums over ad hoc local literals inside routes, hooks, services, or components.
- For route bodies, query params, mutation modes, dialog actions, and sheet flows, use named constants or typed value maps instead of raw string branches.
- If a raw control value appears in more than one file, extracting it is mandatory, not optional.

Patterns already in the repo:

- `ROLES` from `src/shared/enums/enums`
- `INVITE_STATUS` from `src/shared/enums/enums`
- `RESERVATION_STATUS` from `src/features/reservations/models/reservation-status.model.ts`
- `VOLUNTEER_STATUS` from `src/features/volunteers/model/volunteer-status.model.ts`
- `EVENT_OPERATIONAL_STATUS` from `src/features/events/models/event-status.model.ts`
- `PAYMENT_STATUS` from `src/features/reservations/models/payment-status.model.ts`

Preferred pattern:

```ts
export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

export type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number];
```

Review checklist:

- Are all control values routed through constants, enums, or typed value maps?
- Did this change add any new raw strings inside `if`, `switch`, lookup maps, filters, or persistence logic?
- If a new action or mode was introduced, does it have a named constant and exported value type?
- Are only user-facing labels/copy left inline?

Also prefer a type guard when values may come from the database or external input:

```ts
export function isPaymentStatus(value: string): value is PaymentStatus {
  return PAYMENT_STATUS_VALUES.includes(value as PaymentStatus);
}
```

## No Magic Values

Avoid unstructured literals for:

- statuses
- roles
- action names
- query key roots
- badge labels
- UI style variants

Instead use:

- constant maps
- typed unions derived from constants
- helper functions
- config objects

Bad:

```ts
if (paymentStatus === "paid") { ... }
```

Good:

```ts
if (paymentStatus === PAYMENT_STATUS.PAID) { ... }
```

## No Nested Ternaries

Nested ternaries are banned.

The repo now enforces:

- `no-nested-ternary` in `eslint.config.mjs`
- `npm run lint:no-nested-ternary`

Do not write code like:

```tsx
const label = pending ? "Saving" : active ? "Active" : "Inactive";
```

Use one of these patterns instead.

### Pattern 1: Config Object

Best when you need multiple values like label, className, icon, tone.

```ts
const STATUS_META = {
  active: { label: "Active", className: "text-emerald-600" },
  inactive: { label: "Inactive", className: "text-slate-500" },
} as const;

const meta = STATUS_META[status] ?? STATUS_META.inactive;
```

### Pattern 2: Helper Function

Best when logic is more conditional than tabular.

```ts
function getCheckinLabel(isPending: boolean, isCheckedIn: boolean) {
  if (isPending) return "Checking in...";
  if (isCheckedIn) return "Checked In";
  return "Check In";
}
```

### Pattern 3: Explicit Branches Before JSX

Best when JSX content changes shape.

```tsx
let content: ReactNode;

if (isPending) {
  content = <SpinnerLabel />;
} else if (isCheckedIn) {
  content = <CheckedInLabel />;
} else {
  content = <DefaultLabel />;
}
```

Rule:

- if UI state needs style and label, resolve both from the same map
- do not branch once for label and again for class name

## Conditional Flow

Keep conditional logic flat and predictable.

Preferred order:

- use an object map when the branch is table-driven and each case resolves metadata
- use `switch` when the branch is enum-like and each case performs different behavior
- use guard clauses to exit early before the main branch logic
- extract a helper when the conditional mixes multiple concerns

Avoid:

- nested `if` blocks that keep increasing indentation
- long `if` / `else if` chains for statuses, actions, filters, or modes
- splitting label, icon, className, and behavior decisions across multiple separate branches

Bad:

```ts
if (status === RESERVATION_STATUS.CONFIRMED) {
  if (requiresPayment) {
    if (paymentStatus === PAYMENT_STATUS.PAID) {
      ...
    } else if (paymentStatus === PAYMENT_STATUS.FAILED) {
      ...
    }
  }
}
```

Better with a map:

```ts
const PAYMENT_META = {
  [PAYMENT_STATUS.PAID]: { label: "Paid", tone: "success" },
  [PAYMENT_STATUS.FAILED]: { label: "Failed", tone: "danger" },
  [PAYMENT_STATUS.UNPAID]: { label: "Unpaid", tone: "muted" },
} as const;

const paymentMeta = PAYMENT_META[paymentStatus] ?? PAYMENT_META.unpaid;
```

Better with `switch`:

```ts
switch (status) {
  case RESERVATION_STATUS.CONFIRMED:
    ...
    return;
  case RESERVATION_STATUS.CHECKED_IN:
    ...
    return;
  default:
    return;
}
```

## Zod-First Validation

All external input should be validated with Zod before use.

### In API Routes

Pattern:

```ts
const BodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const body = await request.json();
const parsed = BodySchema.parse(body);
```

Examples:

- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/events/[id]/reservations/route.ts`
- `src/app/api/volunteers/manage/route.ts`

### In Forms

Pattern:

```ts
const form = useForm<FormValues>({
  resolver: zodResolver(FormSchema),
  defaultValues,
});
```

Examples:

- `src/features/events/forms/MultistepEventForm.tsx`
- `src/features/reservations/forms/EditReservationForm.tsx`
- `src/features/team/components/TeamManagementPageClient.tsx`
- `src/app/auth/onboard-user/[inviteToken]/onboarding-form.tsx`

### Zod Location Rules

- API body schemas can live close to the route if they are route-specific
- reusable feature schemas belong in the feature `models/` or `model/` folder
- shared validators belong in `src/lib/validation/`

## React Hook Form Pattern

Use `react-hook-form` with `zodResolver`.

Preferred pattern:

- form schema in a form-model file
- `useForm` in the main form container
- `FormProvider` for multi-step or nested field trees
- shadcn form primitives for labels, controls, and messages

Examples:

- `src/features/events/forms/MultistepEventForm.tsx`
- `src/features/settings/components/SettingsShell.tsx`
- `src/features/settings/components/AppSettingsShell.tsx`
- `src/features/survey/components/ConfigureSurveySheetForm.tsx`

For large forms:

- keep coercion in Zod
- keep transport payload conversion in helpers
- keep form steps dumb where possible

### Native Date/Time Input Pattern

Do not introduce raw `type="date"` or `type="time"` inputs directly in app forms, sheets, dialogs, or filter UIs when the shared wrappers fit the case.

Use:

- `src/shared/components/input/NativeDateField.tsx`
- `src/shared/components/input/NativeTimeField.tsx`

Why:

- they preserve the native device picker behavior
- they avoid mobile Safari overflow/clipping issues
- they provide one consistent app-styled display across forms
- they keep validation wiring predictable with controlled form state

Preferred usage:

- use them with controlled values
- update form state via `setValue(..., { shouldDirty, shouldTouch, shouldValidate })` or `Controller`
- keep existing error rendering beside the field

Only use raw native date/time inputs directly if the shared wrappers are clearly not suitable for that interaction.

## React Query Pattern

Use React Query in hooks, not directly in page components unless the page is the feature root and the case is small.

### Query Hook Responsibilities

Hooks should own:

- `useQuery` / `useMutation`
- query keys
- cache invalidation
- toasts for mutation success/error where appropriate
- optimistic or refetch behavior

Examples:

- `src/features/events/hooks/use-events.ts`
- `src/features/reservations/hooks/use-reservation.ts`
- `src/features/volunteers/hooks/use-volunteer.ts`
- `src/features/team/hooks/use-team.ts`
- `src/features/settings/hooks/use-settings.tsx`

### Service Responsibilities

Services should own:

- actual HTTP request calls
- request/response typing
- route construction
- query string building
- transport error translation

Examples:

- `src/features/events/services/events-service.ts`
- `src/features/reservations/service/reservation-service.ts`
- `src/features/volunteers/service/volunteer-service.ts`
- `src/features/team/services/team-service.ts`

Services should not:

- show toasts
- invalidate caches
- hold UI state

### Query Key Pattern

For simple features:

- inline keys are acceptable

For larger features:

- centralize keys in a `*_KEYS` object

Example:

- `RESERVATION_KEYS` in `src/features/reservations/hooks/use-reservation.ts`

Preferred pattern:

```ts
export const FEATURE_KEYS = {
  all: ["feature-root"] as const,
  byId: (id: string) => ["feature-root", id] as const,
};
```

## Service Layer Pattern

Use:

- `http` from `src/services/http.ts`
- `API_ROUTES` from `src/shared/routes/apiRoutes`
- `buildQueryString` from `src/utils/helpers`
- `fetchListForTable` from `src/shared/helper/helper`
- `ApiErrorHandler.toUIError` for transport failures

Pattern:

```ts
export async function fetchThing(id: string) {
  try {
    const { data } = await http.get(API_ROUTES.things.byId(id));
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
```

For table-compatible list endpoints:

```ts
return fetchListForTable<RowType, FilterType>({
  route: API_ROUTES.feature.list,
  page,
  limit,
  search,
});
```

## API Route Pattern

API routes should follow this order:

1. `await connectDb()`
2. parse and validate input
3. authenticate and verify business ownership
4. run persistence logic
5. return typed JSON
6. convert all thrown errors with `errorToNextResponse`

Example:

- `src/app/api/auth/login/route.ts`

Patterns to preserve:

- use `ApiError`
- use `errorToNextResponse`
- lower-case/trim emails before querying
- verify `currentBusiness` ownership for tenant-scoped resources
- keep list query parsing strict with a feature query schema
- keep list query-to-Mongo mapping in feature helpers when the route has multiple filter branches
- prefer switch-based helper functions for enum-driven filters such as `status`, `feature`, `pricing`, or `dateField`
- for list endpoints, use this flow consistently:
  - `const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries())`
  - `const parsedQuery = parseOrThrow(FeatureListQuerySchema, rawQuery)`
  - `const transformedQuery = buildFeatureListApiFeaturesQuery(parsedQuery)`
  - `await applyFeatureListFilters({ filter, parsedQuery, transformedQuery, ...context })`
- do not use patterns like `mapToObject(query as unknown as Map<string, string>) as Record<string, unknown>` in list routes

## Error Handling Pattern

Error handling in this project is standardized across three layers:

1. API routes throw project-defined `ApiError`
2. services normalize transport errors with `ApiErrorHandler`
3. UI surfaces render failures with `ErrorList`

### API Route Errors

Always use the project-defined error class from:

- `src/lib/errors/apiError.ts`

Do not return ad-hoc error payloads from API routes when the route is already using the standardized error flow.

Preferred pattern:

```ts
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";

export async function POST(request: NextRequest) {
  try {
    // ...
    if (!allowed) {
      throw ApiError.forbidden("You do not have access to this resource.");
    }

    if (!record) {
      throw ApiError.notFound("Record not found");
    }
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
```

Use the built-in helpers where possible:

- `ApiError.badRequest(...)`
- `ApiError.unauthorized(...)`
- `ApiError.forbidden(...)`
- `ApiError.notFound(...)`
- `ApiError.conflict(...)`
- `ApiError.tooMany(...)`
- `ApiError.internal(...)`
- `ApiError.unavailable(...)`

Rules:

- API routes should throw, not hand-build `{ error: ... }` responses
- route catch blocks should use `errorToNextResponse(...)`
- preserve request IDs where available
- trust Zod and Mongoose normalization already handled by `apiError.ts`

Representative file:

- `src/app/api/auth/login/route.ts`

### Service Error Handling

Services should convert raw Axios or transport failures into the existing UI-friendly error shape using:

- `ApiErrorHandler.toUIError`

File:

- `src/utils/apiError.ts`

Preferred service pattern:

```ts
try {
  const { data } = await http.get(url);
  return data;
} catch (err: unknown) {
  throw ApiErrorHandler.toUIError(err);
}
```

Rules:

- services should not swallow backend issue details
- services should not stringify errors manually
- services should preserve `issues`, `requestId`, `status`, and `code`
- components and hooks should receive structured UI-friendly errors

Representative files:

- `src/features/events/services/events-service.ts`
- `src/features/reservations/service/reservation-service.ts`
- `src/shared/helper/helper.ts`

### UI Error Rendering

When rendering page, form, or action errors, use:

- `ErrorList` from `src/components/ui/ErrorList.tsx`

`ErrorList` already supports:

- full `ApiErrorBody`
- `ApiErrorHandler.extract()` / `toUIError()` output
- plain `{ message, issues? }`
- plain string errors

Rules:

- use `ErrorList` for screen-level or form-level failures
- do not invent one-off error boxes unless there is a strong UX reason
- let `ErrorList` render validation issues, request IDs, and structured details

Preferred UI pattern:

```tsx
{mutation.isError ? (
  <ErrorList error={mutation.error} title="Save Error" />
) : null}
```

Representative files:

- `src/app/admin/checkin/volunteer/page.tsx`
- `src/features/volunteers/components/VolunteerCancelPage.tsx`
- `src/features/reservations/components/ReservationWaitlistClaimPage.tsx`
- `src/features/events/components/EventImageUploadDialog.tsx`

## Mongoose Model Pattern

Use `src/models/` for persistence concerns only.

Mongoose models should contain:

- schema definitions
- enum/value arrays sourced from feature constants
- pre-validate / pre-save hooks
- derived field normalization

They should not contain:

- UI DTOs
- React-specific state
- form-only coercion logic

Example:

- `src/models/eventReservationModel.tsx` now consumes `PAYMENT_STATUS_VALUES` from the feature payment-status model instead of hardcoded string arrays

## Shared Table Pattern

When building list UIs:

- use the shared table system
- use `fetchListForTable`
- keep the API in paginated list shape
- keep filter state and refetch behavior aligned with the shared table hooks

Key files:

- `src/shared/components/table/Table.tsx`
- `src/shared/components/table/hooks/useTable.ts`
- `src/shared/helper/helper.ts`

## Routing Pattern

Use `API_ROUTES` for API paths.

All API endpoints must be defined in:

- `src/shared/routes/apiRoutes.ts`

Do not inline API route strings across:

- services
- hooks
- client components
- shared utilities
- route-to-route server calls

If a request needs an `/api` prefix, derive it from the shared route using:

- `withApiPrefix(route)`

Bad:

```ts
await http.post(`/auth/resetPassword`, payload);
await fetch(`/api/tickets/validate`, { method: "POST" });
```

Good:

```ts
await http.post(API_ROUTES.auth.resetPassword, payload);
await fetch(withApiPrefix(API_ROUTES.tickets.validate), { method: "POST" });
```

Allowed exception:

- server-rendered pages or server utilities that must compute an absolute URL from the current host/origin may build `new URL(...)`, but the pathname must still come from `API_ROUTES` and not be handwritten

Example:

```ts
const url = new URL(withApiPrefix(API_ROUTES.events.byId(id)), origin);
```

Related rule:

- use `APP_ROUTES` for app/page navigation paths
- use `API_ROUTES` only for API endpoints

## Dashboard Route Guard Pattern

For dashboard pages that need role-based access:

- use `requireDashboardAccess(...)`
- pass the allowed roles explicitly with `roles: [...]`
- do not repeat `getVerifiedUser()` + `redirect("/auth/login")` + manual role checks inline in each page

File:

- `src/lib/auth/requireDashboardAccess.ts`

Preferred examples:

```ts
await requireDashboardAccess();
await requireDashboardAccess({ roles: [ROLES.admin] });
await requireDashboardAccess({ roles: [ROLES.admin, ROLES.super_admin] });
await requireDashboardAccess({ roles: [ROLES.super_admin] });
```

Bad:

```ts
const verify = await getVerifiedUser();
if (!verify) redirect("/auth/login");
if (verify.role !== ROLES.admin) redirect("/dashboard");
```

Good:

```ts
await requireDashboardAccess({ roles: [ROLES.admin] });
```

Use the helper even when the dashboard layout already handles base authentication. The page-level helper is still the preferred place to declare route-specific role restrictions.

Examples:

- `src/shared/routes/apiRoutes.ts`
- all feature service files

## Error Handling Pattern

On the server:

- throw `ApiError`
- return via `errorToNextResponse`

On the client:

- convert transport failures with `ApiErrorHandler.toUIError`
- render `ErrorList` for screen/form-level failures
- use toast notifications from hooks for action feedback

## UI Composition Pattern

Prefer:

- small, focused components
- shared shells for repeated layouts
- shared dialogs/sheets where structure should be consistent
- helper/config functions for status badges and action labels

Examples:

- `src/shared/components/AppDialogShell.tsx`
- `src/shared/components/ActionConfirmDialog.tsx`
- `src/shared/components/public/PublicActionPageShell.tsx`

## Recommended Status Config Pattern

When a status controls:

- label
- badge class
- icon
- CTA text
- disabled state

use a single resolver.

Example structure:

```ts
const STATUS_META = {
  pending: {
    label: "Pending",
    badgeClassName: "border-amber-500/50 ...",
  },
  active: {
    label: "Active",
    badgeClassName: "border-emerald-500/50 ...",
  },
} as const;
```

## Naming Conventions

Prefer these names:

- `useFeatureThing` for hooks
- `fetchThing`, `createThing`, `updateThing`, `deleteThing` for services
- `ThingSchema` for Zod schemas
- `ThingFormSchema` or `thingFormSchema` for form schemas
- `THING_STATUS` for status constants
- `THING_STATUS_VALUES` for value arrays
- `isThingStatus` for type guards
- `ThingListFilter`, `ThingListResponse`, `ThingListItem` for list contracts

## Enforcement

The repo now contains two direct safeguards:

- `eslint.config.mjs` enforces `no-nested-ternary`
- `package.json` includes `npm run lint:no-nested-ternary`

Recommended workflow for every feature:

1. implement using constants/maps/helpers
2. lint touched files
3. run typecheck
4. if new statuses/actions were introduced, create constants for them first

## Authoring Checklist For New Features

Before writing:

- define statuses/roles/actions as constants if needed
- decide DTO model vs form model
- decide if schema belongs in feature model or route-local file

While writing:

- no nested ternaries
- no raw status strings
- no route string duplication
- no HTTP calls directly in components
- no cache invalidation inside services
- no large inline feature types in generator files when the module already has a `models/` folder
- no large inline CSS/template style blocks in generator files when the module already has a `styles/` folder

Before closing:

- run ESLint on touched files
- run TypeScript check
- verify query invalidation paths
- verify API validation path
- verify UI labels/styles come from config or helpers
- verify feature folder names are capability-based and easy to discover
- verify shared logic, models, and styles are extracted into their dedicated folders when the feature has multiple files

## Representative Files

Use these as reference implementations:

- Hooks
  `src/features/events/hooks/use-events.ts`
  `src/features/reservations/hooks/use-reservation.ts`
  `src/features/team/hooks/use-team.ts`
- Services
  `src/features/events/services/events-service.ts`
  `src/features/reservations/service/reservation-service.ts`
  `src/features/team/services/team-service.ts`
- Form models
  `src/features/events/models/event-form.model.ts`
  `src/features/reservations/models/reservation-form.model.ts`
- Status/constants
  `src/features/reservations/models/reservation-status.model.ts`
  `src/features/reservations/models/payment-status.model.ts`
  `src/features/volunteers/model/volunteer-status.model.ts`
  `src/features/events/models/event-status.model.ts`
- API route
  `src/app/api/auth/login/route.ts`

## Final Standard

New code in this project should read like this:

- typed
- validated
- feature-local
- constant-driven
- query-safe
- service-separated
- map-based instead of ternary-based

If a new feature violates those rules, it should be treated as incomplete.

- Phone inputs must use the shared [International-phonefield.tsx](/Users/wealthiduwe/Developer/eventSphere/src/shared/components/phone-number/International-phonefield.tsx) component rather than raw text or `type="tel"` inputs on product forms and settings surfaces, so country selection, digit handling, and validation stay consistent.
