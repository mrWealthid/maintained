import { Ticket, User } from "@/app/shared/model/model";
import { CHAT_ROLES, CHAT_TYPE } from "../data/enums";

export interface ChatRoomListFilter {
  title?: string;
}

export interface ChatRoom {
  id: string;
  ticket: Ticket;
  participants: {
    user: User;
    role: CHAT_ROLES;
    joinedAt: Date;
  }[];
  lastMessageAt?: Date;
  isArchived?: boolean;
  updatedAt: Date;
  createdAt: Date;
}

export interface ChatRoomMessage {
  id: string;
  _id: string;
  room: string;
  sender: User; // null for system
  type: CHAT_TYPE;
  text?: string;
  meta?: Record<string, any>;
  readBy: string[];
  updatedAt: Date;
  createdAt: Date;
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
