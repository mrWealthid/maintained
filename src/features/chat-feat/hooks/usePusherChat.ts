"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  upsert,
  removeById,
  addReader,
  normalizeMessage,
  getMsgId,
} from "../helper/chatCache";
import { addDelivered } from "../helper/chatCache"; // ⬅️ NEW
import { getPusherClient } from "@/lib/pusher/pusher";
import type { ChatRoomMessage } from "../model/chat.model";
import type { ApiPaginatedResponse } from "@/shared/model/model";
import { ackDelivered as apiAckDelivered } from "../services/chat.service"; // ⬅️ NEW

// Optional: expose typing state to your UI
export type TypingMap = Record<string, number>;

/**
 * @param roomId required
 * @param meId used to auto-ack delivered and suppress own typing indicator
 */
export function usePusherChatRoom(roomId?: string | null, meId?: string) {
  const qc = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<TypingMap>({});
  const sweepRef = useRef<number | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    // Debug while testing:
    (pusher.constructor as any).logToConsole = true;

    const channelName = `private-room-${roomId}`;
    const channel = pusher.subscribe(channelName);

    const patchPages = (
      mutator: (items: ChatRoomMessage[]) => ChatRoomMessage[],
      adjustTotal?: (t: number) => number
    ) => {
      qc.setQueriesData<ApiPaginatedResponse<ChatRoomMessage[]>>(
        {
          queryKey: ["chatMessages"],
          // IMPORTANT: your message query **must** use ["chatMessages", { roomId, page, limit, search }]
          // so we can match on roomId here:
          predicate: (q) => (q.queryKey?.[1] as any)?.roomId === roomId,
        },
        (old) => {
          if (!old) return old;

          const prevItems = Array.isArray(old.data) ? old.data : [];
          const nextItems = mutator(prevItems);
          return {
            ...old,
            data: nextItems,
            totalRecords:
              typeof adjustTotal === "function"
                ? adjustTotal(old.totalRecords ?? prevItems.length)
                : old.totalRecords,
            results: nextItems.length,
          };
        }
      );
    };

    // -------------------- EVENT HANDLERS --------------------

    const onNew = async (raw: ChatRoomMessage) => {
      const msg = normalizeMessage(raw);

      console.log(msg);
      if (msg.room !== roomId) return;

      patchPages(
        (items) =>
          items.some((m) => getMsgId(m) === getMsgId(msg))
            ? items
            : [...items, msg], // or [msg, ...items] if newest-first UI
        (t) => t + 1
      );

      // auto-ack delivered if I'm not the sender
      try {
        const sender = String((msg as any).sender?.id ?? (msg as any).senderId);
        if (meId && sender !== String(meId)) {
          await apiAckDelivered(roomId, String(msg._id));
        }
      } catch {
        // ignore network fail; server can reconcile later
      }
    };

    const onEdit = (raw: ChatRoomMessage) => {
      const msg = normalizeMessage(raw);
      if (msg.room !== roomId) return;
      patchPages((items) => upsert(items, msg));
    };

    const onDelete = ({ id }: { id: string }) => {
      patchPages(
        (items) => removeById(items, id),
        (t) => Math.max(0, t - 1)
      );
    };

    // READ: payload matches your existing signature
    const onRead = ({ id, readerId }: { id: string; readerId: string }) => {
      patchPages((items) => addReader(items, id, readerId));
    };

    // DELIVERED: new handler; payload: { id: messageId, userId }
    const onDelivered = ({ id, userId }: { id: string; userId: string }) => {
      patchPages((items) => addDelivered(items, id, userId));
    };

    // TYPING (client event on private channel)
    // incoming: { userId, isTyping }
    const onTyping = ({
      userId,
      isTyping,
    }: {
      userId: string;
      isTyping: boolean;
    }) => {
      if (meId && String(userId) === String(meId)) return; // don't show myself
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) next[userId] = Date.now();
        else delete next[userId];
        return next;
      });
    };

    // -------------------- BIND --------------------
    channel.bind("pusher:subscription_succeeded", () =>
      console.log("✅ subscribed:", channelName)
    );
    channel.bind("message:new", onNew);
    channel.bind("message:edit", onEdit);
    channel.bind("message:delete", onDelete);
    channel.bind("message:read", onRead);
    channel.bind("message:delivered", onDelivered);
    channel.bind("client-typing", onTyping);

    pusher.connection.bind("connected", () => {
      console.log("✅ pusher connected");
      qc.invalidateQueries({ queryKey: ["chatMessages", { roomId }] });
    });

    // sweep stale typing indicators every 1s (3.5s TTL)
    sweepRef.current = window.setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        const next: TypingMap = {};
        for (const [u, ts] of Object.entries(prev))
          if (now - ts < 3500) next[u] = ts;
        return next;
      });
    }, 1000) as number;

    return () => {
      channel.unbind("message:new", onNew);
      channel.unbind("message:edit", onEdit);
      channel.unbind("message:delete", onDelete);
      channel.unbind("message:read", onRead);
      channel.unbind("message:delivered", onDelivered);
      channel.unbind("client-typing", onTyping);
      pusher.connection.unbind("connected");
      pusher.unsubscribe(channelName);
      if (sweepRef.current) clearInterval(sweepRef.current);
    };
  }, [roomId, meId, qc]);

  /**
   * Emit typing from inputs:
   *   emitTyping(true) onChange; debounce emitTyping(false) after idle.
   */
  const emitTyping = (isTyping: boolean) => {
    if (!roomId) return;
    const pusher = getPusherClient();
    // client events must start with "client-"
    pusher?.channel(`private-room-${roomId}`)?.trigger("client-typing", {
      userId: meId,
      isTyping,
    });
  };

  return { typingUsers, emitTyping };
}
