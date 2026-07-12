import Link from "next/link";

import { requireTradeAccess } from "@/lib/auth/requireTradeAccess";
import { connect } from "@/dbConfig/dbConfig";
import Conversation from "@/models/conversationModel";
import ConversationMessage from "@/models/conversationMessageModel";
import Ticket from "@/models/ticketModel";
import { Card, CardContent } from "@/components/ui/card";
import { CONVERSATION_SENDER_KIND } from "@/features/conversations/models/conversation-types.model";

export const dynamic = "force-dynamic";

/**
 * Trade-side inbox of conversations. Each row deep-links to the thread.
 * Unread count = messages from the OTHER side (or system) newer than the
 * trade's own read cursor.
 */
export default async function TradeChatInboxPage() {
  const ctx = await requireTradeAccess({ nextPath: "/trades/chat" });
  await connect();

  const tradeUserId = ctx.userId;
  const conversations = await Conversation.find({
    tradesperson: ctx.tradesperson._id,
  })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(100)
    .lean<
      Array<{
        _id: unknown;
        ticket: unknown;
        lastMessagePreview?: string;
        lastMessageAt?: Date;
        participantReads?: Array<{
          user: unknown;
          role: string;
          lastReadAt: Date;
        }>;
      }>
    >();

  const ticketIds = Array.from(
    new Set(conversations.map((c) => String(c.ticket))),
  );
  const tickets = ticketIds.length
    ? await Ticket.find({ _id: { $in: ticketIds } })
        .select("title slug")
        .lean<Array<{ _id: unknown; title?: string; slug?: string }>>()
    : [];
  const ticketById = new Map(tickets.map((t) => [String(t._id), t]));

  const cursorByConv = new Map<string, Date>();
  for (const c of conversations) {
    const mine = c.participantReads?.find(
      (p) => String(p.user) === tradeUserId,
    );
    cursorByConv.set(String(c._id), mine?.lastReadAt ?? new Date(0));
  }
  const oppositeMessages = conversations.length
    ? await ConversationMessage.aggregate([
        {
          $match: {
            conversation: { $in: conversations.map((c) => c._id) },
            senderKind: {
              $in: [
                CONVERSATION_SENDER_KIND.MANAGER,
                CONVERSATION_SENDER_KIND.SYSTEM,
              ],
            },
          },
        },
        {
          $group: {
            _id: "$conversation",
            messages: { $push: { createdAt: "$createdAt" } },
          },
        },
      ])
    : [];
  const unreadById = new Map<string, number>();
  for (const row of oppositeMessages as Array<{
    _id: unknown;
    messages: Array<{ createdAt: Date }>;
  }>) {
    const cursor = cursorByConv.get(String(row._id)) ?? new Date(0);
    unreadById.set(
      String(row._id),
      row.messages.filter(
        (m) => m.createdAt.getTime() > cursor.getTime(),
      ).length,
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col">
            <p className="text-sm font-semibold">
              {ctx.tradesperson.businessName}
            </p>
            <p className="text-xs text-muted-foreground">Chats</p>
          </div>
          <Link
            href="/trades"
            className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-3 px-4 py-6">
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No chats yet. Submit a quote on{" "}
              <Link
                href="/trades/requests"
                className="underline underline-offset-2 hover:text-foreground"
              >
                an open request
              </Link>{" "}
              and the workspace can message you here.
            </CardContent>
          </Card>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border bg-card">
            {conversations.map((c) => {
              const ticket = ticketById.get(String(c.ticket));
              const unread = unreadById.get(String(c._id)) ?? 0;
              return (
                <li key={String(c._id)}>
                  <Link
                    href={`/trades/chat/${String(c._id)}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {ticket?.title ?? "Repair conversation"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.lastMessagePreview ?? "No messages yet"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {c.lastMessageAt
                        ? new Date(c.lastMessageAt).toLocaleDateString()
                        : ""}
                      {unread > 0 ? (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          {unread}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
