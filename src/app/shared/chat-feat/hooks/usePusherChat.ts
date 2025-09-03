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
import { ChatRoomMessage } from "../model/chat.model";
import { ApiPaginatedResponse } from "../../model/model";

export function usePusherChatRoom(roomId?: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!roomId) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`private-room-${roomId}`);

    const patchPages = (
      mutator: (items: ChatRoomMessage[]) => ChatRoomMessage[],
      adjustTotal?: (t: number) => number
    ) => {
      qc.setQueriesData<ApiPaginatedResponse<ChatRoomMessage[]>>(
        {
          queryKey: ["chatMessages"],
          predicate: (q) => (q.queryKey?.[1] as any)?.roomId === roomId,
        },
        (old) =>
          old
            ? {
                ...old,
                data: mutator(old.data),
                total:
                  typeof adjustTotal === "function"
                    ? adjustTotal(old.totalRecords ?? 0)
                    : old.totalRecords,
              }
            : old
      );
    };

    const onNew = (raw: ChatRoomMessage) => {
      const msg = normalizeMessage(raw);
      if (msg.room !== roomId) return;
      patchPages(
        (items) =>
          items.some((m) => getMsgId(m) === getMsgId(msg))
            ? items
            : [...items, msg],
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

    channel.bind("message:new", onNew);
    channel.bind("message:edit", onEdit);
    channel.bind("message:delete", onDelete);
    channel.bind("message:read", onRead);

    pusher.connection.bind("connected", () => {
      qc.invalidateQueries({ queryKey: ["chatMessages", { roomId }] });
    });

    return () => {
      channel.unbind("message:new", onNew);
      channel.unbind("message:edit", onEdit);
      channel.unbind("message:delete", onDelete);
      channel.unbind("message:read", onRead);
      pusher.connection.unbind("connected");
      pusher.unsubscribe(`private-room-${roomId}`);
    };
  }, [roomId, qc]);
}
