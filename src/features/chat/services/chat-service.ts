import axios from "axios";

import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";

export type SendMessagePayload = {
  text?: string;
  meta?: Record<string, unknown>;
};

export async function fetchChatRooms() {
  try {
    const { data } = await axios.get(API_ROUTES.chat.get_rooms);
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchRoomMessages(roomId: string) {
  try {
    const { data } = await axios.get(
      API_ROUTES.chat.get_room_messages(roomId),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function sendChatMessage(
  roomId: string,
  payload: SendMessagePayload,
) {
  try {
    const { data } = await axios.post(
      API_ROUTES.chat.send_message(roomId),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function editChatMessage(
  roomId: string,
  messageId: string,
  payload: SendMessagePayload,
) {
  try {
    const { data } = await axios.patch(
      API_ROUTES.chat.edit_message(roomId, messageId),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteChatMessage(roomId: string, messageId: string) {
  try {
    const { data } = await axios.delete(
      API_ROUTES.chat.delete_message(roomId, messageId),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function markRoomRead(roomId: string) {
  try {
    const { data } = await axios.post(API_ROUTES.chat.message_read(roomId));
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function markMessageDelivered(
  roomId: string,
  messageId: string,
) {
  try {
    const { data } = await axios.post(
      API_ROUTES.chat.message_delivered(roomId, messageId),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
