// chatCache.ts
import { ChatRoomMessage } from "../model/chat.model";

// ---------- existing ----------
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

// ---------- NEW: small ID utils ----------
const toStrId = (v: any): string =>
  v == null
    ? ""
    : typeof v === "string"
      ? v
      : typeof v === "object" && "toString" in v
        ? String(v.toString())
        : String(v);

const sameId = (a: any, b: any) => toStrId(a) === toStrId(b);

const addUniqueId = (arr: any[] | undefined, id: any) => {
  const list = Array.isArray(arr) ? [...arr] : [];
  if (!list.some((x) => sameId(x, id))) list.push(id);
  return list;
};

type Receipt = {
  userId: any;
  deliveredAt?: string | Date;
  readAt?: string | Date;
};

const ensureReceipt = (receipts: Receipt[] | undefined, userId: any) => {
  const list = Array.isArray(receipts) ? receipts.map((r) => ({ ...r })) : [];
  const uid = toStrId(userId);
  let idx = list.findIndex((r) => toStrId(r.userId) === uid);
  if (idx === -1) {
    list.push({ userId });
    idx = list.length - 1;
  }
  return { list, idx };
};

// ---------- NEW: addDelivered ----------
export const addDelivered = (
  list: ChatRoomMessage[],
  messageId: string,
  userId: string
): ChatRoomMessage[] => {
  const nowIso = new Date().toISOString();

  return list.map((m) => {
    if (getMsgId(m) !== messageId) return m;

    const { list: receipts, idx } = ensureReceipt(m.receipts as any[], userId);
    const r = receipts[idx];

    if (!r.deliveredAt) receipts[idx] = { ...r, deliveredAt: nowIso };

    // If you keep a message.status, you can optionally bump it here to "delivered"
    return { ...m, receipts } as ChatRoomMessage;
  });
};

// ---------- UPDATED: addReader (receipts + legacy readBy) ----------
export const addReader = (
  list: ChatRoomMessage[],
  id: string,
  readerId: string
): ChatRoomMessage[] => {
  const nowIso = new Date().toISOString();

  return list.map((m) => {
    if (getMsgId(m) !== id) return m;

    // receipts[]: reading implies delivered too
    const { list: receipts, idx } = ensureReceipt(
      m.receipts as any[],
      readerId
    );
    const r = receipts[idx];
    receipts[idx] = {
      ...r,
      deliveredAt: r.deliveredAt ?? nowIso,
      readAt: r.readAt ?? nowIso,
    };

    // legacy readBy[] maintained for backward compat
    const readBy = addUniqueId(m.readBy as any[], readerId);

    // If you keep a message.status, you can optionally bump it here to "read"
    return { ...m, receipts, readBy } as ChatRoomMessage;
  });
};
