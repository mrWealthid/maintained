"use client";

import { useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import ChatThread from "./ChatThread";
import { CONVERSATION_SENDER_KIND } from "@/features/conversations/models/conversation-types.model";

type Props = {
  repairRequestId: string;
  tradespersonId: string;
  tradeBusinessName?: string;
};

/**
 * Admin-side "Chat" entry that opens the same `ChatThread` view used by
 * the trade. Lazily resolves the conversation (create-on-first-open) via
 * `POST /api/conversations`, then mounts the thread. Pusher subscription
 * keeps both sides live.
 */
export default function AdminQuoteChatButton({
  repairRequestId,
  tradespersonId,
  tradeBusinessName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ensureConversation() {
    setResolving(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repairRequestId,
          tradespersonId,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body?.message ?? "Couldn't open chat");
        return;
      }
      setConversationId(String(body.data.conversation._id));
    } finally {
      setResolving(false);
    }
  }

  async function onClickOpen() {
    setOpen(true);
    if (!conversationId) await ensureConversation();
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={onClickOpen}>
        <MessageSquare className="mr-1 size-3.5" />
        Chat
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <AppDialogContent>
          <AppDialogHeader
            icon={MessageSquare}
            title={
              tradeBusinessName
                ? `Chat with ${tradeBusinessName}`
                : "Conversation"
            }
            description="Messages are saved to the repair request. Both sides receive realtime updates."
          />
          <AppDialogBody>
            {resolving ? (
              <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Opening…
              </div>
            ) : error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            ) : conversationId ? (
              <div className="h-[60dvh]">
                <ChatThread
                  conversationId={conversationId}
                  viewerKind={CONVERSATION_SENDER_KIND.MANAGER}
                />
              </div>
            ) : null}
          </AppDialogBody>
        </AppDialogContent>
      </Dialog>
    </>
  );
}
