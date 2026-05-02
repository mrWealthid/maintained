import { z } from "zod";

import { Ticket, User } from "@/shared/model/model";
import { CHAT_ROLES, CHAT_TYPE } from "../data/enums";

export type ChatUser = Pick<User, "id" | "name" | "email"> & {
  photo?: string;
};

export interface ChatRoomListFilter {
  title?: string;
}

export interface ChatRoom {
  id: string;
  ticket: Ticket;
  participants: Participant[];
  lastMessageAt?: Date;
  isArchived?: boolean;
  updatedAt: Date;
  createdAt: Date;
  unitLabel: string;
  propertyName: string;
  unreadCount: number;
}

export interface Participant {
  user: { id: string; name: string; avatar?: string | null }; // ALWAYS object with id
  role: CHAT_ROLES;
  joinedAt: string;
  lastReadMessageId: string | null;
  lastActiveAt: string | null;
}

export interface ChatRoomMessage {
  id: string;
  _id: string;
  room: string;
  sender: ChatUser | null; // null for system
  type: CHAT_TYPE;
  text?: string;
  meta?: Record<string, any>;
  readBy: string[];
  updatedAt: Date;
  createdAt: Date;
  receipts: { userId: string; deliveredAt?: Date; readAt?: Date }[];
}

export interface ChatMessageFilter {
  text?: string;
  // id?: string;
}

export type ChatMessageQueryParams = {
  status?: string;
  page?: number;
  limit?: number;
  roomId: string | null;
  search?: ChatMessageFilter;
};

export const chatMessageListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  text: z.string().optional(),
  search: z.string().optional(),
});

export interface SendChatMessagePayload {
  message: string;
}

export interface SendChatMessageResponse {
  id: string;
  sender: ChatUser;
  text: string;
  createdAt: Date;
}
