import { ApiPaginatedResponse, ApiResponse } from "@/app/shared/model/model";
import { API_ROUTES } from "@/app/shared/routes/apiRoutes";
import { ListQueryParams } from "@/app/shared/ticket-feat/model/ticket.model";
import { ApiErrorHandler } from "@/utils/apiError";
import { buildQueryString } from "@/utils/helpers";
import axios from "axios";
import {
  ChatMessageFilter,
  ChatMessageQueryParams,
  ChatRoomListFilter,
  ChatRoomMessage,
} from "../model/chat.model";
import { normalizeMessage } from "../helper/chatCache";

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
    const response = await axios(url);
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

  try {
    const response = await axios.post(url, { message });
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
