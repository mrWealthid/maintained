# Tradespeople rework — plan & tracker

External tradespeople replace the internal `ROLES.technician` workspace role,
modelled on eventSphere's `ServiceProvider` pattern. Existing in-workspace
technicians are migrated to external `Tradesperson` accounts linked back to
their original workspace via `WorkspaceTrade`.

## Locked design decisions

| Decision | Choice |
|---|---|
| Internal technicians | Migrate all → external `Tradesperson` |
| Account creation | Self-signup at `/trades/signup` AND workspace email invite |
| Payments | Stripe Connect out of scope (acceptance creates assignment + chat only) |
| Broadcast routing | Per-request choice: broadcast-to-specialty OR invited shortlist |

## Target data model

```
Tradesperson                       ≈ eventSphere ServiceProvider
  ├─ userId           (User with accountKind: TRADE)
  ├─ businessName, slug (unique, immutable)
  ├─ contactEmail, contactPhone
  ├─ specialties[]    (carry over TECHNICIAN_SPECIALTY enum)
  ├─ serviceAreaKm
  ├─ address / addressStructured
  ├─ verificationStatus: unverified | pending | verified | suspended
  ├─ isActive
  └─ onboarding.completedAt   (gates /trades dashboard)

WorkspaceTrade                     "external trade linked to workspace"
  ├─ workspace, tradesperson, addedBy
  ├─ status: invited | active | suspended
  ├─ trustedRate?    (optional saved hourly/visit rate)
  └─ invite token + expiresAt (for email-invite acceptance)

RepairRequest                      ≈ eventSphere ServiceRequest
  ├─ ticket, workspace, createdBy
  ├─ specialty, scopeNotes
  ├─ technicianDiagnosis            (snapshot of ticket.aiTriage.technicianDiagnosis at broadcast time)
  ├─ invitedTradespeople[]          (empty = broadcast to specialty)
  ├─ status: open | closed | cancelled
  └─ closedAt, cancelledAt

RepairQuote                        ≈ eventSphere Quote
  ├─ repairRequest, tradesperson
  ├─ amountCents, currency
  ├─ lineItems[{label, amountCents, qty}]
  ├─ scheduleProposal: { earliestStart, durationHours }
  ├─ terms, warrantyDays, expiresAt
  ├─ status: submitted | revised | accepted | declined | withdrawn | expired
  └─ parentQuote? (revision chain)

Conversation                       ≈ eventSphere Conversation
ConversationMessage                  per (RepairRequest × Tradesperson)
                                     system msgs: QUOTE_SUBMITTED|REVISED|ACCEPTED|DECLINED|WITHDRAWN
                                     3-state read receipts + Pusher
```

The existing per-ticket `ChatRoom` keeps its current job: the post-acceptance
execution chat between tenant + admin + the **selected** tradesperson. The new
`Conversation` model handles the pre-acceptance per-quote thread.

## Phased delivery

Each phase ends in a runnable, reviewable state. Don't start a phase until the
prior one has been smoke-checked.

- [x] **Phase 0** — Plan + branch (`feat/tradespeople-rework`)
- [ ] **Phase 1** — Identity & workspace linking
  - [ ] `Tradesperson` + `WorkspaceTrade` models
  - [ ] `ACCOUNT_KIND.TRADE` added to user model
  - [ ] `POST /api/trades/register` (self-signup, creates User + Tradesperson)
  - [ ] `POST /api/workspaces/[id]/trades/invite` (admin invites by email)
  - [ ] `POST /api/trades/invite/accept` (accept invite, link to workspace)
  - [ ] `/trades` dashboard scaffold (layout, auth gate, onboarding gate, empty pages)
  - [ ] Migration script: `ROLES.technician` workspace members → `Tradesperson` + `WorkspaceTrade`
- [x] **Phase 2** — Broadcast `RepairRequest`
  - [x] `RepairRequest` model + status machine (model registered)
  - [x] `POST /api/tickets/[slug]/broadcast` — snapshots `aiTriage.technicianDiagnosis`, fans out by specialty or shortlist
  - [x] `GET /api/trades/me/repair-requests` + `/trades/requests` page (all / broadcast / invited tabs)
  - [x] Admin UI: "Broadcast to tradespeople" entry in `TicketActions` + `BroadcastToTradesSheet`
  - [ ] Email fan-out (deferred — minor follow-up)
  - [ ] WorkspaceTrade enforcement on discovery (deferred — needs invite flow)
- [x] **Phase 3** — Advanced `RepairQuote` flow
  - [x] `RepairQuote` model — line items (with pre-save recompute of total), schedule proposal, warranty, expiry, revision chain via `parentQuote`. Partial-unique index on (repairRequest, tradesperson) limited to live statuses.
  - [x] `POST /api/trades/me/quotes` — submit + revise (prior live quote flips to `revised`)
  - [x] `GET  /api/trades/me/quotes` — list mine
  - [x] `POST /api/trades/me/quotes/[id]/withdraw` — only `submitted` → `withdrawn`
  - [x] `POST /api/repair-quotes/[id]/accept` — atomic transaction (quote accepted, request closed, sibling submitted quotes auto-declined, ticket assignedTo set + status → ASSIGNED, activity logged)
  - [x] `POST /api/repair-quotes/[id]/decline` — single-quote decline
  - [x] `GET  /api/tickets/[slug]/repair-quotes` — admin comparison data
  - [x] Trade UI: "Submit quote" / "Revise quote" sheet on each request card + `/trades/quotes` list with withdraw button
  - [x] Admin UI: `AdminRepairQuotesPanel` on ticket detail with grouped-by-request comparison + accept/decline
- [x] **Phase 4** — Pre-acceptance `Conversation` + system messages + Pusher
  - [x] `Conversation` + `ConversationMessage` models, scoped per (repairRequest × tradesperson)
  - [x] `findOrCreateRepairConversation` + `postRepairConversationMessage` service (Pusher trigger inline)
  - [x] `POST/GET /api/conversations`, `GET/POST /api/conversations/[id]/messages`, `POST /api/conversations/[id]/read`
  - [x] System messages on submit / revise / accept / decline / withdraw (post-commit, best-effort)
  - [x] Trade UI: `/trades/chat` inbox + `/trades/chat/[id]` thread, live via existing Pusher private channel
  - [x] Admin UI: `Chat` button on each quote in `AdminRepairQuotesPanel`, opens the same `ChatThread`
  - [x] Read receipts in the UI — subscribes to `read.update`, renders "· Seen" on the most recent outgoing message the other side has read
  - [x] Typing indicators — `POST /api/conversations/[id]/typing` relays via Pusher `typing.update`; ChatThread debounces input (3s idle) and renders an animated pill while the other side is typing (5s watchdog clears it if `active:false` is lost)
  - [x] Thread pagination — `?before=<ISO>&limit=N` cursor on `GET /api/conversations/[id]/messages`. Response includes `hasMore`. UI surfaces a "Load earlier" button that prepends without scroll-jumping.
  - [x] Email notification on incoming chat message — `notifyOfflineRecipients` runs inside `postRepairConversationMessage`. Email the OTHER side iff none of them have a `lastReadAt` within the last 90 seconds. Trade-side email lands on `Tradesperson.contactEmail`; manager-side fans out to the ticket's `actionedBy` + `user` users and the business primary email. Fire-and-forget; never blocks the write.

## Follow-ups completed

- [x] **Workspace invite flow** — `POST/GET /api/workspaces/me/trades`, `POST /api/trades/invite/accept`, public accept page at `/trades/invite/[token]` with `AcceptInviteButton` client island, invite email
- [x] **Migration script** — `npm run migrate:trades` (idempotent, `--dry-run`, `--limit N`). Converts each `ROLES.technician` workspace member into a Tradesperson + sets `accountKind=trade` + creates `WorkspaceTrade(status=active)` rows for every workspace they were a technician in.
- [x] **Email fan-out on broadcast** — recipient set mirrors the trade-inbox discovery rule exactly. Best-effort; never blocks the broadcast.
- [x] **`WorkspaceTrade` enforcement on discovery** — open broadcasts only fan out / show up for workspaces the trade is `active`-linked to. Direct invites still bypass (the invite IS the link signal). Admin can't shortlist a trade their workspace hasn't linked.
- [x] **Quote expiry sweep** — `POST /api/internal/jobs/expire-repair-quotes` authed by `Authorization: Bearer $N8N_WEBHOOK_SECRET` (same pattern as the AI-triage webhook). Returns `{expiredCount, scannedAt}`. Wire to a cron that runs every 5–15 min.

## Notes

- The route folder rename `ticket-management → tickets` is already in place; the
  new `/trades` segment is its peer.
- Old `TechnicianRequest` model stays in place during Phases 1–2 to keep the
  current app working; it's superseded by `RepairRequest` in Phase 2 and
  retired (with a final migration) at the end of Phase 3.
- AI triage stays as-is; Phase 2 just snapshots
  `ticket.aiTriage.technicianDiagnosis` onto each `RepairRequest` so trades see
  the diagnosis in their inbox.
