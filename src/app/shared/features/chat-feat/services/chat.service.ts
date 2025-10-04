import { ApiPaginatedResponse, ApiResponse } from "@/app/shared/model/model";
import { API_ROUTES } from "@/app/shared/routes/apiRoutes";
import { ListQueryParams } from "@/app/shared/features/ticket-feat/model/ticket.model";
import { ApiErrorHandler } from "@/utils/apiError";
import { buildQueryString } from "@/utils/helpers";
import axios from "axios";
import {
  ChatMessageQueryParams,
  ChatRoomListFilter,
  ChatRoomMessage,
} from "../model/chat.model";
import { getPusherClient } from "@/lib/pusher/pusher";

export async function fetchChatRooms<T>({
  limit = 10,
  page = 1,
}: ListQueryParams<ChatRoomListFilter>): Promise<ApiPaginatedResponse<T[]>> {
  const queryString = buildQueryString({ limit, page });
  const url = `${API_ROUTES.chat.get_rooms}?${queryString}`;
  try {
    const response = await axios(url);
    return response.data;
  } catch (err) {
    throw new Error(ApiErrorHandler.parse(err));
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
    const response = await axios<ApiPaginatedResponse<T[]>>(url);
    console.log(response.data);
    return response.data;
  } catch (err) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}

export async function sendChatMessage(
  roomId: string,
  message: string
): Promise<ApiPaginatedResponse<ChatRoomMessage>> {
  const url = `${API_ROUTES.chat.send_message(roomId)}`;

  const socketId = getPusherClient()?.connection.socket_id ?? "";

  try {
    const response = await axios.post(
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
    throw new Error(ApiErrorHandler.parse(error));
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
//     const res = await axios(`/api/rooms/${roomId}/messages?${qs.toString()}`);

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
//     throw new Error(ApiErrorHandler.parse(error));
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
    const res = await axios.patch<ApiResponse<ChatRoomMessage>>(
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
    throw new Error(ApiErrorHandler.parse(error));
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
    // axios.delete supports a config with headers; body is not required
    const res = await axios.delete<ApiResponse<{ id: string }>>(url, {
      headers: {
        "X-Socket-Id": socketId,
      },
    });
    return res.data;
  } catch (error) {
    throw new Error(ApiErrorHandler.parse(error));
  }
}

// ---------- DELIVERY ACK ----------
export async function ackDelivered(roomId: string, messageId: string) {
  console.log(roomId, messageId);
  const url = API_ROUTES.chat.message_delivered(roomId, messageId);
  await axios.post(
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
  await axios.post(
    url,
    { lastReadMessageId },
    { headers: { "content-type": "application/json" } }
  );
}
