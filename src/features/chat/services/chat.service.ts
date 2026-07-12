import { ApiPaginatedResponse, ApiResponse } from "@/shared/model/model";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ListQueryParams } from "@/features/tickets/models/ticket.model";
import { ApiErrorHandler } from "@/utils/apiError";
import { buildQueryString } from "@/utils/helpers";
import { http } from "@/services/http";
import {
  ChatMessageQueryParams,
  ChatRoomListFilter,
  ChatRoomMessage,
} from "../model/chat.model";
import { getPusherClient } from "@/lib/pusher/client";

export async function fetchChatRooms<T>({
  limit = 10,
  page = 1,
}: ListQueryParams<ChatRoomListFilter>): Promise<ApiPaginatedResponse<T[]>> {
  const queryString = buildQueryString({ limit, page });
  const url = `${API_ROUTES.chat.get_rooms}?${queryString}`;
  try {
    const response = await http(url);
    return response.data;
  } catch (err) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchChatMessagesByRoomId<T>({
  limit = 10,
  page = 1,
  roomId,
  search,
}: ChatMessageQueryParams): Promise<ApiPaginatedResponse<T[]>> {
  if (!roomId) throw Error("room Id must be specified");
  const queryString = buildQueryString({ limit, page, ...search });
  const url = `${API_ROUTES.chat.get_room_messages(roomId)}?${queryString}`;

  try {
    const response = await http<ApiPaginatedResponse<T[]>>(url);
    console.log(response.data);
    return response.data;
  } catch (err) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function sendChatMessage(
  roomId: string,
  message: string
): Promise<ApiPaginatedResponse<ChatRoomMessage>> {
  const url = `${API_ROUTES.chat.send_message(roomId)}`;

  const socketId = getPusherClient()?.connection.socket_id ?? "";

  try {
    const response = await http.post(
      url,
      { message },
      {
        headers: {
          "content-type": "application/json",
          "X-Socket-Id": socketId, // <- send it
        },
      }
    );
    return response.data;
  } catch (error) {
    throw ApiErrorHandler.toUIError(error);
  }
}

// export async function fetchChatMessagesByRoomId({
//   page,
//   limit,
//   roomId,
//   search,
// }: {
//   page: number;
//   limit: number;
//   roomId: string;
//   search?: ChatMessageFilter;
// }): Promise<ApiPaginatedResponse<ChatRoomMessage[]>> {
//   const qs = new URLSearchParams({
//     page: String(page),
//     limit: String(limit),
//     ...(search ? { search: JSON.stringify(search) } : {}),
//   });
//   try {
//     const res = await http(`/api/rooms/${roomId}/messages?${qs.toString()}`);

//     const json = res.data as ApiPaginatedResponse<ChatRoomMessage[]>;

//     // Map to internal shape
//     const data = (json.data ?? []).map(normalizeMessage);
//     const totalRecords = json.totalRecords ?? data.length;
//     const results = json.results ?? data.length;

//     return {
//       data,
//       totalRecords,
//       results,
//       status: json.status,
//       message: json.message,
//     };
//   } catch (error) {
//     throw ApiErrorHandler.toUIError(error);
//   }
// }

export async function editChatMessage(
  roomId: string,
  messageId: string,
  message: string
): Promise<ApiResponse<ChatRoomMessage>> {
  const url = API_ROUTES.chat.edit_message(roomId, messageId);
  const socketId = getPusherClient()?.connection.socket_id ?? "";

  try {
    const res = await http.patch<ApiResponse<ChatRoomMessage>>(
      url,
      { message },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Socket-Id": socketId,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw ApiErrorHandler.toUIError(error);
  }
}

/** DELETE: remove a message */
export async function deleteChatMessage(
  roomId: string,
  messageId: string
): Promise<ApiResponse<{ id: string }>> {
  const url = API_ROUTES.chat.delete_message(roomId, messageId);
  const socketId = getPusherClient()?.connection.socket_id ?? "";

  try {
    // http.delete supports a config with headers; body is not required
    const res = await http.delete<ApiResponse<{ id: string }>>(url, {
      headers: {
        "X-Socket-Id": socketId,
      },
    });
    return res.data;
  } catch (error) {
    throw ApiErrorHandler.toUIError(error);
  }
}

// ---------- DELIVERY ACK ----------
export async function ackDelivered(roomId: string, messageId: string) {
  console.log(roomId, messageId);
  const url = API_ROUTES.chat.message_delivered(roomId, messageId);
  await http.post(
    url,
    {},
    { headers: { "content-type": "application/json" } }
  );
}

const isTemp = (m: string) => /tmp/.test(m);
// ---------- READ-UP-TO ----------
export async function markReadUpTo(roomId: string, lastReadMessageId: string) {
  if (isTemp(lastReadMessageId)) return false;
  const url = API_ROUTES.chat.message_read(roomId);
  await http.post(
    url,
    { lastReadMessageId },
    { headers: { "content-type": "application/json" } }
  );
}
