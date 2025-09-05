import { Ticket, User } from "@/app/shared/model/model";
import { CHAT_ROLES, CHAT_TYPE } from "../data/enums";

export interface ChatRoomListFilter {
  title?: string;
}

export interface ChatRoom {
  id: string;
  ticket: Ticket;
  participants: Participants[];
  lastMessageAt?: Date;
  isArchived?: boolean;
  updatedAt: Date;
  createdAt: Date;
}

export interface Participants {
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
  sender: User | null; // null for system
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

export interface SendChatMessagePayload {
  message: string;
}

export interface SendChatMessageResponse {
  id: string;
  sender: User;
  text: string;
  createdAt: Date;
}
