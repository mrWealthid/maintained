"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPusherClient } from "@/lib/pusher/client";
import {
  CONVERSATION_MESSAGE_TYPE,
  CONVERSATION_SENDER_KIND,
  type ConversationMessageType,
  type ConversationSenderKind,
} from "@/features/conversations/models/conversation-types.model";

type ServerMessage = {
  _id: string;
  conversation: string;
  senderUser?: string | null;
  senderKind: ConversationSenderKind;
  type: ConversationMessageType;
  body: string;
  quote?: string | null;
  meta?: Record<string, unknown> | null;
  createdAt: string;
};

type Props = {
  conversationId: string;
  /** "trade" or "manager" — used to align messages left vs right. */
  viewerKind: Exclude<ConversationSenderKind, "system">;
};

/**
 * Single-thread chat view. Hits `/api/conversations/[id]/messages` on mount,
 * subscribes to the matching Pusher channel for incremental updates, and
 * marks the thread read on focus / new-message arrival.
 *
 * System messages render as centred neutral pills; user messages align
 * left/right based on the viewer's own role on this thread.
 */
export default function ChatThread({ conversationId, viewerKind }: Props) {
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  /**
   * Timestamp of the OTHER side's last read cursor. Outgoing messages
   * whose `createdAt` ≤ this value are rendered as "Seen". Initially
   * hydrated from the conversation payload on mount, then bumped live by
   * the Pusher `read.update` event.
   */
  const [oppositeLastReadAt, setOppositeLastReadAt] = useState<Date | null>(
    null,
  );
  /**
   * `true` when the opposite side is actively typing. Set by Pusher
   * `typing.update` events and cleared either by an explicit `active:
   * false` event or a watchdog timer (no event for 5s → assume stopped).
   */
  const [oppositeTyping, setOppositeTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const oppositeTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  /** Our own outgoing-typing state — sent at most once until it stops. */
  const ownActiveRef = useRef(false);
  const ownIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const oppositeKind =
    viewerKind === CONVERSATION_SENDER_KIND.TRADE
      ? CONVERSATION_SENDER_KIND.MANAGER
      : CONVERSATION_SENDER_KIND.TRADE;

  /** True when there are older messages the server hasn't sent yet. */
  const [hasMore, setHasMore] = useState(false);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  /**
   * Flag set when the most recent state update was a prepend (loading
   * earlier history). Suppresses the bottom-scroll effect so the scroll
   * position stays where the user was looking.
   */
  const skipScrollRef = useRef(false);

  /**
   * Debounced beacon: call on every keystroke. Sends `active: true` once
   * when the user starts typing, then schedules a single `active: false`
   * 3 seconds after the last keystroke. The Pusher relay endpoint
   * persists nothing — the watchdog on the receiver side is the safety
   * net for missed "stopped" events.
   */
  const beaconTyping = useCallback(() => {
    if (!ownActiveRef.current) {
      ownActiveRef.current = true;
      fetch(`/api/conversations/${conversationId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      }).catch(() => undefined);
    }
    if (ownIdleTimerRef.current) clearTimeout(ownIdleTimerRef.current);
    ownIdleTimerRef.current = setTimeout(() => {
      ownActiveRef.current = false;
      fetch(`/api/conversations/${conversationId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false }),
      }).catch(() => undefined);
    }, 3000);
  }, [conversationId]);

  const markRead = useCallback(async () => {
    try {
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: "POST",
      });
    } catch {
      // best-effort
    }
  }, [conversationId]);

  // Initial load + Pusher subscription.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`);
        const body = await res.json();
        if (cancelled || !res.ok) return;
        setMessages(body.data.messages ?? []);
        setHasMore(Boolean(body.data.hasMore));

        // Seed the opposite-side read cursor from the conversation payload.
        const reads: Array<{
          role: string;
          lastReadAt?: string;
        }> = body.data.conversation?.participantReads ?? [];
        const opposite = reads
          .filter((r) => r.role === oppositeKind && r.lastReadAt)
          .sort(
            (a, b) =>
              new Date(b.lastReadAt!).getTime() -
              new Date(a.lastReadAt!).getTime(),
          )[0];
        if (opposite?.lastReadAt) {
          setOppositeLastReadAt(new Date(opposite.lastReadAt));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const pusher = getPusherClient();
    const channelName = `private-repair-conversation-${conversationId}`;
    const channel = pusher?.subscribe(channelName);

    const handleNew = (incoming: ServerMessage) => {
      setMessages((prev) =>
        prev.some((m) => m._id === incoming._id) ? prev : [...prev, incoming],
      );
    };
    const handleRead = (evt: { role: string; lastReadAt: string }) => {
      if (evt.role !== oppositeKind) return;
      const at = new Date(evt.lastReadAt);
      setOppositeLastReadAt((prev) =>
        !prev || at.getTime() > prev.getTime() ? at : prev,
      );
    };
    const handleTyping = (evt: { role: string; active: boolean }) => {
      if (evt.role !== oppositeKind) return;
      if (oppositeTypingTimerRef.current) {
        clearTimeout(oppositeTypingTimerRef.current);
      }
      if (evt.active) {
        setOppositeTyping(true);
        // Watchdog: if the typer's "stopped" event never arrives (lost
        // packet, tab closed), auto-clear after 5s.
        oppositeTypingTimerRef.current = setTimeout(() => {
          setOppositeTyping(false);
        }, 5000);
      } else {
        setOppositeTyping(false);
      }
    };
    channel?.bind("message.new", handleNew);
    channel?.bind("read.update", handleRead);
    channel?.bind("typing.update", handleTyping);

    void markRead();

    return () => {
      cancelled = true;
      channel?.unbind("message.new", handleNew);
      channel?.unbind("read.update", handleRead);
      channel?.unbind("typing.update", handleTyping);
      pusher?.unsubscribe(channelName);
      if (oppositeTypingTimerRef.current) {
        clearTimeout(oppositeTypingTimerRef.current);
      }
      if (ownIdleTimerRef.current) clearTimeout(ownIdleTimerRef.current);
    };
  }, [conversationId, markRead, oppositeKind]);

  // Auto-scroll on new messages, but skip when the update was a prepend
  // (we just loaded earlier history — the user wants to stay put).
  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const loadEarlier = useCallback(async () => {
    if (loadingEarlier || messages.length === 0) return;
    const oldest = messages[0];
    if (!oldest) return;
    setLoadingEarlier(true);
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages?before=${encodeURIComponent(
          oldest.createdAt,
        )}`,
      );
      const body = await res.json();
      if (!res.ok) return;
      const earlier: ServerMessage[] = body.data.messages ?? [];
      if (earlier.length === 0) {
        setHasMore(false);
        return;
      }
      skipScrollRef.current = true;
      setMessages((prev) => [...earlier, ...prev]);
      setHasMore(Boolean(body.data.hasMore));
    } finally {
      setLoadingEarlier(false);
    }
  }, [conversationId, loadingEarlier, messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      const body = await res.json();
      if (res.ok && body?.data?.message) {
        // Optimistically append in case Pusher hasn't fanned out yet.
        setMessages((prev) =>
          prev.some((m) => m._id === body.data.message._id)
            ? prev
            : [...prev, body.data.message],
        );
        setDraft("");
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading messages…
      </div>
    );
  }

  // Index of the most recent outgoing message that the other side has read.
  // We only render "Seen" on THAT message to avoid noisy duplicates.
  let lastSeenIndex = -1;
  if (oppositeLastReadAt) {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.senderKind === viewerKind &&
          new Date(m.createdAt).getTime() <= oppositeLastReadAt.getTime()) {
        lastSeenIndex = i;
        break;
      }
    }
  }

  return (
    <div className="flex h-full min-h-[400px] flex-col rounded-md border border-border bg-background">
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {hasMore ? (
          <div className="flex justify-center pb-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={loadEarlier}
              disabled={loadingEarlier}
            >
              {loadingEarlier ? (
                <Loader2 className="mr-1 size-3.5 animate-spin" />
              ) : null}
              Load earlier
            </Button>
          </div>
        ) : null}
        {messages.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No messages yet. Start the conversation.
          </p>
        ) : null}
        {messages.map((m, idx) => {
          if (m.senderKind === CONVERSATION_SENDER_KIND.SYSTEM) {
            return (
              <div key={m._id} className="my-2 flex justify-center">
                <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                  {m.body}
                </span>
              </div>
            );
          }
          const isMine = m.senderKind === viewerKind;
          const showSeen = isMine && idx === lastSeenIndex;
          return (
            <div
              key={m._id}
              className={isMine ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  "max-w-[80%] rounded-2xl px-3 py-1.5 text-sm " +
                  (isMine
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground")
                }
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p
                  className={
                    "mt-0.5 text-[10px] " +
                    (isMine
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground")
                  }
                >
                  {new Date(m.createdAt).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {showSeen ? " · Seen" : null}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {oppositeTyping ? (
        <div className="flex items-center gap-2 border-t border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <span className="inline-flex gap-0.5">
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground" />
            <span
              className="size-1.5 animate-pulse rounded-full bg-muted-foreground"
              style={{ animationDelay: "120ms" }}
            />
            <span
              className="size-1.5 animate-pulse rounded-full bg-muted-foreground"
              style={{ animationDelay: "240ms" }}
            />
          </span>
          {oppositeKind === CONVERSATION_SENDER_KIND.MANAGER
            ? "Workspace is typing…"
            : "Tradesperson is typing…"}
        </div>
      ) : null}
      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-border bg-card p-2"
      >
        <Input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (e.target.value.length > 0) beaconTyping();
          }}
          placeholder="Type a message"
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={!draft.trim() || sending}>
          {sending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

void CONVERSATION_MESSAGE_TYPE;
