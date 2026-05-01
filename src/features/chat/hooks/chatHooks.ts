import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteChatMessage,
  editChatMessage,
  fetchChatMessagesByRoomId,
  fetchChatRooms,
  markReadUpTo,
  sendChatMessage,
} from "../services/chat.service";
import {
  ChatMessageFilter,
  ChatRoom,
  ChatRoomMessage,
  ChatUser,
} from "../model/chat.model";
import toast from "react-hot-toast";
import {
  ApiError,
  ApiPaginatedResponse,
  ApiResponse,
} from "@/shared/model/model";
import { CHAT_TYPE } from "../data/enums";
import { nanoid } from "nanoid";
import { getMsgId } from "../helper/chatCache";

export function useFetchChatRooms(
  // onSuccess?: (data: ChatRoom[]) => void,
  page: number = 1,
  limit: number = 50
) {
  const {
    isLoading: isFetchingRooms,
    data: rooms,
    error: roomsError,
    isRefetching,
  } = useQuery({
    queryKey: ["chat-rooms", page, limit], // include pagination in key
    queryFn: () => fetchChatRooms<ChatRoom>({ page, limit }),
    select: (data) => data.data, // pick only what you need
    // onSuccess, // ✅ attach the callback here
  });

  return {
    isFetchingRooms,
    roomsError,
    isRefetching,
    rooms,
  };
}

export function useFetchChatRoomMessages(
  page: number,
  limit: number,
  roomId: string | null,
  search?: ChatMessageFilter
) {
  const q = useQuery<ApiPaginatedResponse<ChatRoomMessage[]>>({
    queryKey: ["chatMessages", { roomId, page, limit, search }],
    queryFn: () =>
      fetchChatMessagesByRoomId({
        page,
        limit,
        roomId: roomId!, // safe due to enabled
        search,
      }),
    enabled: !!roomId,
    // keepPreviousData: true,
    staleTime: 30_000,
  });

  return {
    isFetchingMessages: q.isLoading || q.isRefetching,
    messages: q.data?.data ?? [],
    totalRecords: q.data?.totalRecords ?? 0, // total across all pages
    results: q.data?.results ?? 0, // how many on this page
    error: q.error,
  };
}

export function useSendMessage(roomId: string, me: ChatUser) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => sendChatMessage(roomId, text),

    onMutate: async (text) => {
      const tempId = `tmp_${nanoid()}`;
      const now = new Date();

      const optimistic: ChatRoomMessage = {
        id: tempId,
        _id: tempId,
        room: roomId,
        sender: me,
        type: CHAT_TYPE.USER,
        text,
        meta: { tempId },
        readBy: [me.id],
        receipts: [{ userId: me.id, deliveredAt: now, readAt: now }],
        createdAt: now,
        updatedAt: now,
      };

      await qc.cancelQueries({ queryKey: ["chatMessages"] });

      qc.setQueriesData<ApiPaginatedResponse<ChatRoomMessage[]>>(
        {
          queryKey: ["chatMessages"],
          predicate: (q) => (q.queryKey?.[1] as any)?.roomId === roomId,
        },
        (old) =>
          old
            ? {
                ...old,
                data: [...old.data, optimistic],
                totalRecords: (old.totalRecords ?? 0) + 1,
                results: (old.results ?? 0) + 1,
              }
            : old
      );

      return { tempId };
    },

    onError: (_e, _v, ctx) => {
      qc.setQueriesData<ApiPaginatedResponse<ChatRoomMessage[]>>(
        {
          queryKey: ["chatMessages"],
          predicate: (q) => (q.queryKey?.[1] as any)?.roomId === roomId,
        },
        (old) =>
          old
            ? {
                ...old,
                data: old.data.filter((m) => m.meta?.tempId !== ctx?.tempId),
                totalRecords: Math.max(0, (old.totalRecords ?? 1) - 1),
                results: Math.max(0, (old.results ?? 1) - 1),
              }
            : old
      );
    },

    onSuccess: (real, _v, ctx) => {
      const payload = (real as any)?.data ?? real;
      const serverMsg = Array.isArray(payload) ? payload[0] : payload;
      if (!serverMsg) return;

      qc.setQueriesData<ApiPaginatedResponse<ChatRoomMessage[]>>(
        {
          queryKey: ["chatMessages"],
          predicate: (q) => (q.queryKey?.[1] as any)?.roomId === roomId,
        },
        (old) =>
          old
            ? {
                ...old,
                data: old.data.map((m) =>
                  m.meta?.tempId === ctx?.tempId ? serverMsg : m
                ),
                totalRecords: old.totalRecords,
                results: old.results,
              }
            : old
      );
    },
  });
}

export function useDeleteMessage(roomId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteChatMessage(roomId, id),

    // Optimistic remove
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: ["chatMessages"] });

      const prev = qc.getQueriesData<ApiPaginatedResponse<ChatRoomMessage[]>>({
        queryKey: ["chatMessages"],
        predicate: (q) => (q.queryKey?.[1] as any)?.roomId === roomId,
      });

      qc.setQueriesData<ApiPaginatedResponse<ChatRoomMessage[]>>(
        {
          queryKey: ["chatMessages"],
          predicate: (q) => (q.queryKey?.[1] as any)?.roomId === roomId,
        },
        (old) => {
          if (!old) return old;
          const nextData = old.data.filter((m) => getMsgId(m) !== id);
          return {
            ...old,
            data: nextData,
            totalRecords: Math.max(0, (old.totalRecords ?? 1) - 1),
            results: Math.max(0, (old.results ?? 1) - 1),
          };
        }
      );

      return { prev };
    },

    // Rollback on error
    onError: (_e, _vars, ctx) => {
      if (!ctx?.prev) return;
      for (const [queryKey, snapshot] of ctx.prev) {
        qc.setQueryData(queryKey, snapshot);
      }
    },

    // Nothing extra on success — Pusher already syncs others
    onSuccess: (res: ApiResponse<{ id: string }>) => {
      console.log("✅ Deleted", res.data.id);
    },
  });
}

export function useEditMessage(roomId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      editChatMessage(roomId, id, text),

    onMutate: async ({ id, text }) => {
      await qc.cancelQueries({ queryKey: ["chatMessages"] });

      // snapshot all matching caches to rollback if needed
      const prev = qc.getQueriesData<ApiPaginatedResponse<ChatRoomMessage[]>>({
        queryKey: ["chatMessages"],
        predicate: (q) => (q.queryKey?.[1] as any)?.roomId === roomId,
      });

      // optimistic patch
      qc.setQueriesData<ApiPaginatedResponse<ChatRoomMessage[]>>(
        {
          queryKey: ["chatMessages"],
          predicate: (q) => (q.queryKey?.[1] as any)?.roomId === roomId,
        },
        (old) => {
          if (!old) return old;
          const nextData = old.data.map((m) =>
            getMsgId(m) === id
              ? {
                  ...m,
                  text,
                  updatedAt: new Date(),
                  meta: { ...(m.meta ?? {}), _optimisticEdit: true },
                }
              : m
          );
          // totals don’t change on edit
          return { ...old, data: nextData };
        }
      );

      return { prev };
    },

    onError: (_e, _vars, ctx) => {
      // rollback all snapshots
      if (!ctx?.prev) return;
      for (const [queryKey, snapshot] of ctx.prev) {
        qc.setQueryData(queryKey, snapshot);
      }
    },

    onSuccess: (res: ApiResponse<ChatRoomMessage>) => {
      const serverMsg = res.data;
      // replace optimistic item with server version
      qc.setQueriesData<ApiPaginatedResponse<ChatRoomMessage[]>>(
        {
          queryKey: ["chatMessages"],
          predicate: (q) => (q.queryKey?.[1] as any)?.roomId === serverMsg.room,
        },
        (old) => {
          if (!old) return old;
          const nextData = old.data.map((m) =>
            getMsgId(m) === getMsgId(serverMsg) ? serverMsg : m
          );
          return { ...old, data: nextData };
        }
      );
    },
  });
}

export function useReadChatMessages(roomId: string) {
  const queryClient = useQueryClient();
  const { isPending: isUpdating, mutate: handleMarkReadUpTo } = useMutation({
    mutationFn: (lastMessageId: string) => markReadUpTo(roomId, lastMessageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat-rooms"],
      });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isUpdating, handleMarkReadUpTo };
}
