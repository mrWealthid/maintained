import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchChatMessagesByRoomId,
  fetchChatRooms,
  sendChatMessage,
} from "../services/chat.service";
import {
  ChatMessageFilter,
  ChatRoom,
  ChatRoomMessage,
  SendChatMessagePayload,
} from "../model/chat.model";
import toast from "react-hot-toast";
import { ApiError, ApiPaginatedResponse, User } from "@/app/shared/model/model";
// import { PageResp } from "../helper/chatCache";
import { CHAT_TYPE } from "../data/enums";
import { nanoid } from "nanoid";

// export function useFetchChatRooms(
//   onSuccess: (data: ChatRoom[]) => void,
//   page: number = 1,
//   limit: number = 50
// ) {
//   const {
//     isLoading: isFetchingRooms,
//     data: rooms,
//     error: roomsError,
//     isRefetching,
//   } = useQuery({
//     queryKey: ["chat-rooms"],
//     queryFn: () => fetchChatRooms<ChatRoom>({ page, limit }),
//     onSuccess,
//     select(data) {
//       return data.data;
//     }

//   });

//   return {
//     isFetchingRooms,
//     roomsError,
//     isRefetching,
//     rooms,
//   };
// }

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

// export function useFetchChatRoomMessages<T>(
//   page: number,
//   limit: number,
//   roomId: string | null,
//   search?: ChatMessageFilter
// ) {
//   const {
//     isLoading: isFetchingMessages,
//     data,
//     error,
//     isRefetching,
//   } = useQuery({
//     queryKey: ["chatMessages", limit, page, search],
//     queryFn: () =>
//       fetchChatMessagesByRoomId({
//         page,
//         limit,
//         search,
//         roomId: roomId ?? "",
//       }),

//     enabled: typeof roomId === "string" && roomId.length > 0,
//     // placeholderData: undefined
//   });

//   return {
//     isFetchingMessages,
//     isRefetching,
//     error,
//     messages: data?.data,
//     // summary: data?.summary,
//     totalRecords: data?.totalRecords,
//     results: data?.results,
//   };
// }

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

// export function useSendChatMessage(roomId: string) {
//   const queryClient = useQueryClient();
//   const {
//     mutate: sendMessage,
//     error,
//     isPending,
//   } = useMutation({
//     mutationFn: (sendMessagePayload: string) =>
//       sendChatMessage(roomId, sendMessagePayload),
//     onSuccess: (data) =>
//       queryClient.invalidateQueries({
//         queryKey: ["chatMessages"],
//       }),
//     onError: (err: ApiError) => toast.error(err.message),
//   });

//   return {
//     sendMessage,
//     isPending,
//     error,
//   };
// }

export function useSendMessage(roomId: string, me: User) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => sendChatMessage(roomId, text),
    onMutate: async (text) => {
      const tempId = `tmp_${nanoid()}`;
      const optimistic: ChatRoomMessage = {
        id: tempId,
        _id: tempId,
        room: roomId,
        sender: me,
        type: CHAT_TYPE.USER,
        text,
        meta: { tempId },
        readBy: [me.id],
        createdAt: new Date(),
        updatedAt: new Date(),
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
      qc.setQueriesData<ApiPaginatedResponse<ChatRoomMessage[]>>(
        {
          queryKey: ["chatMessages"],
          predicate: (q) => (q.queryKey?.[1] as any)?.roomId === roomId,
        },
        (old) =>
          old
            ? {
                ...old,
                // data: old.data.map((m) =>
                //   m.meta?.tempId === ctx?.tempId ? real.data : m
                // ),

                totalRecords: old.totalRecords,
                results: old.results,
              }
            : old
      );
    },
  });
}
