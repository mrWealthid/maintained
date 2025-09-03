// chatCache.ts

import { ChatRoomMessage } from "../model/chat.model";

// export type PageResp<T> = { items: T[]; total: number; count: number };

export const getMsgId = (m: Pick<ChatRoomMessage, "id" | "_id">) =>
  m.id ?? m._id;

export const normalizeMessage = (m: ChatRoomMessage): ChatRoomMessage => ({
  ...m,
  createdAt: m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt),
  updatedAt: m.updatedAt instanceof Date ? m.updatedAt : new Date(m.updatedAt),
});

export const upsert = (list: ChatRoomMessage[], next: ChatRoomMessage) => {
  const id = getMsgId(next);
  const idx = list.findIndex((x) => getMsgId(x) === id);
  return idx === -1
    ? [...list, next]
    : [...list.slice(0, idx), next, ...list.slice(idx + 1)];
};

export const removeById = (list: ChatRoomMessage[], id: string) =>
  list.filter((x) => getMsgId(x) !== id);

export const addReader = (
  list: ChatRoomMessage[],
  id: string,
  readerId: string
) =>
  list.map((m) =>
    getMsgId(m) === id
      ? { ...m, readBy: Array.from(new Set([...(m.readBy ?? []), readerId])) }
      : m
  );
