# Maintain

Maintain is a property maintenance operations platform for landlords, property managers, tenants, technicians, and trade partners. It brings ticket intake, property and unit management, team access control, realtime communication, repair quotes, and AI-assisted triage into one workflow-focused dashboard.

The product is built for the day-to-day rhythm of property maintenance: tenants report issues, admins understand urgency quickly, teams coordinate internally, and technicians get the context they need before showing up on site.

## Highlights

- Multi-workspace property operations for portfolios, units, tenants, team members, and tradespeople.
- Maintenance ticket lifecycle from intake through triage, assignment, scheduling, completion, and closure.
- AI triage agent integration that analyzes new maintenance requests and enriches tickets with structured operational guidance.
- Private conversation threads for tenant/admin/trade coordination, including read state, delivery acknowledgements, and typing indicators.
- Technician and trade workflows for invitations, requests, quotes, profile management, and response handling.
- Role and permission controls for workspace teams and platform administration.
- Configurable app, security, notification, category, ticket type, and email-template settings.
- Dashboard analytics and list tooling for filtering, exporting, bulk actions, and operational review.

## AI Triage Agent

Maintain includes an AI triage flow designed specifically for property maintenance requests. When a ticket is created or retriaged, the app can send the ticket context to a private AI workflow. The agent evaluates the request and sends structured results back to the application.

The triage result can update:

- Recommended ticket type
- Priority and priority rationale
- Safety risk and immediate action flags
- Missing information needed from the tenant
- Tenant-facing troubleshooting steps
- Technician-facing diagnosis notes
- Whether a technician is required
- Suggested routing or response window
- Human-review flags and admin notes

The app records the full triage lifecycle, including processing, completion, failure, retry metadata, timestamps, and version/source metadata. Completed triage can also trigger separate admin and tenant notifications so both sides get the right level of detail.

This keeps the AI agent in an assistive role: it speeds up classification, highlights risk, and prepares useful next steps, while the maintenance team still owns the final operational decision.

## Core Workflows

### Property Managers

- Manage properties, units, tenants, workspace members, and trades.
- Review maintenance tickets with category, property, unit, priority, assignment, and status context.
- Use AI triage output to decide whether a request needs immediate action, a technician, tenant follow-up, or human review.
- Assign technicians, broadcast repair requests, review quotes, and manage ticket progression.

### Tenants

- Submit maintenance tickets with descriptions, location context, and attachments.
- Receive guided follow-up from the triage flow when more information or immediate safety steps are needed.
- Chat with admins or assigned maintenance contacts about active requests.

### Trades and Technicians

- Accept invitations and manage trade profiles.
- View relevant repair requests and submit quotes.
- Communicate through request-specific conversation threads.
- Track request and quote status from a dedicated trade experience.

## Architecture

- **Framework:** Next.js App Router with React and TypeScript
- **Data layer:** MongoDB models through Mongoose
- **Validation:** Zod schemas shared across API and form boundaries
- **Forms:** React Hook Form
- **Server APIs:** Route handlers with permission checks and workspace-aware access
- **Realtime:** Private-channel messaging for chat, read receipts, delivery state, and typing updates
- **Email:** Templated transactional messages for auth, workspace, ticket, and triage events
- **UI:** Tailwind CSS, Radix primitives, reusable dashboard components, and responsive shells

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Open the local URL printed by the dev server.

Build for production:

```bash
npm run build
```

Run a TypeScript check:

```bash
npx tsc --noEmit
```

## Configuration

This repository intentionally does not document private configuration keys, environment variable names, tokens, webhook secret names, or credential values.

To run the full app locally, use your private project configuration supplied outside the repository. Keep local machine configuration, connector settings, API credentials, webhook credentials, database credentials, realtime credentials, media credentials, email credentials, and AI workflow credentials in ignored local files or your deployment platform's secret manager.

Do not commit local connector files or secret files. Rotate any credential that has ever appeared in git history.

## Project Structure

```text
src/app              App routes, layouts, pages, and API route handlers
src/features         Domain UI, hooks, forms, services, and models
src/lib              Server utilities, auth, email, tenancy, tickets, AI triage, realtime helpers
src/models           Mongoose models
src/shared           Shared UI, routes, auth permissions, types, helpers, and primitives
scripts              Operational scripts for local/admin maintenance
public              Static brand and illustration assets
```

## Quality Notes

- API handlers validate incoming payloads before mutation.
- Ticket and access-control logic is workspace-aware.
- AI triage callbacks are authenticated and schema-validated.
- Realtime server credentials are isolated from browser client code.
- Local secret files and local connector configuration should remain untracked.

