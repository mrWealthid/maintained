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
import { ApiError } from "@/app/shared/model/model";

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

export function useFetchChatRoomMessages<T>(
  page: number,
  limit: number,
  roomId: string | null,
  search?: ChatMessageFilter
) {
  const {
    isLoading: isFetchingMessages,
    data,
    error,
    isRefetching,
  } = useQuery({
    queryKey: ["chatMessages", limit, page, search],
    queryFn: () =>
      fetchChatMessagesByRoomId<ChatRoomMessage>({
        page,
        limit,
        search,
        roomId,
      }),

    enabled: !!roomId,
    // retry: true,
    // placeholderData: undefined
  });

  return {
    isFetchingMessages,
    isRefetching,
    error,
    messages: data?.data,
    // summary: data?.summary,
    totalRecords: data?.totalRecords,
    results: data?.results,
  };
}

export function useSendChatMessage(roomId: string) {
  const queryClient = useQueryClient();
  const {
    mutate: sendMessage,
    error,
    isPending,
  } = useMutation({
    mutationFn: (sendMessagePayload: string) =>
      sendChatMessage(roomId, sendMessagePayload),
    onSuccess: (data) =>
      queryClient.invalidateQueries({
        queryKey: ["chatMessages"],
      }),
    onError: (err: ApiError) => toast.error(err.message),
  });

  return {
    sendMessage,
    isPending,
    error,
  };
}
