import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";

import { requireTradeAccess } from "@/lib/auth/requireTradeAccess";
import { connect } from "@/dbConfig/dbConfig";
import Conversation from "@/models/conversationModel";
import Ticket from "@/models/ticketModel";
import ChatThread from "@/features/conversations/components/ChatThread";
import { CONVERSATION_SENDER_KIND } from "@/features/conversations/models/conversation-types.model";

export const dynamic = "force-dynamic";

export default async function TradeChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireTradeAccess({ nextPath: `/trades/chat/${id}` });

  if (!mongoose.isValidObjectId(id)) notFound();
  await connect();

  const conversation = await Conversation.findById(id)
    .lean<{
      _id: unknown;
      tradesperson: unknown;
      ticket: unknown;
    } | null>();
  if (!conversation) notFound();
  if (String(conversation.tradesperson) !== String(ctx.tradesperson._id)) {
    notFound();
  }

  const ticket = await Ticket.findById(conversation.ticket)
    .select("title slug")
    .lean<{ _id: unknown; title?: string; slug?: string } | null>();

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-sm font-semibold">
              {ticket?.title ?? "Repair conversation"}
            </p>
            <p className="text-xs text-muted-foreground">
              with {ctx.tradesperson.businessName} side
            </p>
          </div>
          <Link
            href="/trades/chat"
            className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            ← Inbox
          </Link>
        </div>
      </header>

      <main className="mx-auto h-[calc(100dvh-3.5rem)] max-w-3xl p-3">
        <ChatThread
          conversationId={String(conversation._id)}
          viewerKind={CONVERSATION_SENDER_KIND.TRADE}
        />
      </main>
    </div>
  );
}
