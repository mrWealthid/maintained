"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiErrorHandler } from "@/utils/apiError";

import {
  deleteChatMessage,
  editChatMessage,
  fetchChatRooms,
  fetchRoomMessages,
  markMessageDelivered,
  markRoomRead,
  sendChatMessage,
  type SendMessagePayload,
} from "../services/chat-service";

export const CHAT_KEYS = {
  rooms: ["chat", "rooms"] as const,
  messages: (roomId: string) => ["chat", "rooms", roomId, "messages"] as const,
} as const;

export function useChatRooms() {
  return useQuery({
    queryKey: CHAT_KEYS.rooms,
    queryFn: fetchChatRooms,
  });
}

export function useRoomMessages(roomId: string | undefined) {
  return useQuery({
    queryKey: roomId ? CHAT_KEYS.messages(roomId) : ["chat", "noop"],
    queryFn: () => fetchRoomMessages(roomId as string),
    enabled: Boolean(roomId),
  });
}

export function useSendChatMessage(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      sendChatMessage(roomId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.messages(roomId) });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.rooms });
    },
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}

export function useEditChatMessage(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      payload,
    }: {
      messageId: string;
      payload: SendMessagePayload;
    }) => editChatMessage(roomId, messageId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.messages(roomId) });
    },
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}

export function useDeleteChatMessage(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => deleteChatMessage(roomId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.messages(roomId) });
    },
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}

export function useMarkRoomRead(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markRoomRead(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.rooms });
    },
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}

export function useMarkMessageDelivered(roomId: string) {
  return useMutation({
    mutationFn: (messageId: string) => markMessageDelivered(roomId, messageId),
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}
