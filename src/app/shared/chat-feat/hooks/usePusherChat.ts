// hooks/usePusherChatRoom.ts
"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  upsert,
  removeById,
  addReader,
  normalizeMessage,
  getMsgId,
} from "../helper/chatCache";
import { getPusherClient } from "@/lib/pusher/pusher";
import type { ChatRoomMessage } from "../model/chat.model";
import type { ApiPaginatedResponse } from "../../model/model";

export function usePusherChatRoom(roomId?: string | null) {
  const qc = useQueryClient();

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
            // keep API contract names:
            totalRecords:
              typeof adjustTotal === "function"
                ? adjustTotal(old.totalRecords ?? prevItems.length)
                : old.totalRecords,
            // keep results (items on this page) in sync too:
            results: nextItems.length,
          };
        }
      );
    };

    const onNew = (raw: ChatRoomMessage) => {
      const msg = normalizeMessage(raw);
      if (msg.room !== roomId) return;
      patchPages(
        (items) =>
          items.some((m) => getMsgId(m) === getMsgId(msg))
            ? items
            : [...items, msg], // flip to [msg, ...items] if newest-first
        (t) => t + 1
      );
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

    const onRead = ({ id, readerId }: { id: string; readerId: string }) => {
      patchPages((items) => addReader(items, id, readerId));
    };

    channel.bind("pusher:subscription_succeeded", () =>
      console.log("✅ subscribed:", channelName)
    );
    channel.bind("message:new", onNew);
    channel.bind("message:edit", onEdit);
    channel.bind("message:delete", onDelete);
    channel.bind("message:read", onRead);

    pusher.connection.bind("connected", () => {
      console.log("✅ pusher connected");
      qc.invalidateQueries({ queryKey: ["chatMessages", { roomId }] });
    });

    return () => {
      channel.unbind("message:new", onNew);
      channel.unbind("message:edit", onEdit);
      channel.unbind("message:delete", onDelete);
      channel.unbind("message:read", onRead);
      pusher.connection.unbind("connected");
      pusher.unsubscribe(channelName);
    };
  }, [roomId, qc]);
}
