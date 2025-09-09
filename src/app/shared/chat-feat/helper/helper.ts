import { TICKET_PRIORITY, TICKET_STATUS } from "@/app/shared/enums/enums";
import { CHAT_MSG_DELIVERY_STATUS, CHAT_ROLES } from "../data/enums";
import { ChatRoomMessage, Participant } from "../model/chat.model";
import { User } from "../../model/model";

export const getRoleColor = (role: CHAT_ROLES) => {
  switch (role) {
    case CHAT_ROLES.ADMIN:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case CHAT_ROLES.REQUESTER:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case CHAT_ROLES.TECHNICIAN:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

// const getStatusColor = (status: TICKET_STATUS) => {
//   switch (status) {
//     case TICKET_STATUS.pending:
//       return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
//     case TICKET_STATUS.processing:
//       return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
//     case TICKET_STATUS.assigned:
//       return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
//     case TICKET_STATUS.completed:
//       return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
//     case TICKET_STATUS.declined:
//       return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
//     default:
//       return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
//   }
// };
export const getStatusColor = (status: TICKET_STATUS) => {
  switch (status) {
    case TICKET_STATUS.pending:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case TICKET_STATUS.pending_assignment:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case TICKET_STATUS.assigned:
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
    case TICKET_STATUS.processing:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case TICKET_STATUS.scheduled:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case TICKET_STATUS.completed:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case TICKET_STATUS.declined:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export const getPriorityColor = (priority: TICKET_PRIORITY) => {
  switch (priority) {
    case TICKET_PRIORITY.high:
      return "text-red-600 dark:text-red-400";
    case TICKET_PRIORITY.medium:
      return "text-orange-600 dark:text-orange-400";
    case TICKET_PRIORITY.low:
      return "text-green-600 dark:text-green-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

export const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Match your ChatRoomSchema shapes you might hydrate with
type RoomParticipant =
  | { user: string }
  | { user: { id: string } }
  | { user: { _id: string } }
  | { user: User };

const isTemp = (m: ChatRoomMessage) => Boolean(m.meta?.tempId);

const userIdFrom = (u: RoomParticipant["user"]): string => {
  if (!u) return "";
  if (typeof u === "string") return u;
  // Handle common user shapes
  return (u as any).id ?? (u as any)._id ?? "";
};

const extractParticipantIds = (participants: RoomParticipant[]): string[] =>
  Array.from(
    new Set(
      participants
        .map((p) => userIdFrom(p.user))
        .filter((id): id is string => Boolean(id))
    )
  );

/**
 * Delivered = all non-sender participants have deliveredAt
 * Read = all non-sender participants have readAt
 * Participants are accepted raw; IDs are extracted inside.
 */
export function computeDeliveryState(
  message: ChatRoomMessage,
  participants: RoomParticipant[]
): CHAT_MSG_DELIVERY_STATUS {
  if (isTemp(message)) return CHAT_MSG_DELIVERY_STATUS.SENDING;

  const senderId = message.sender?.id ?? "";
  const others = extractParticipantIds(participants).filter(
    (id) => id && id !== senderId
  );

  // If we don't know any recipients yet, consider it "sent" (real id, no delivery info)

  const messageIsSent = message.receipts.every(
    (msg) => !msg.deliveredAt && !msg.readAt
  );

  if (messageIsSent) return CHAT_MSG_DELIVERY_STATUS.SENT;

  const byId = new Map(message.receipts?.map((r) => [r.userId, r]) ?? []);

  // READ: all non-sender participants have readAt
  const allRead = others.some((id) => Boolean(byId.get(id)?.readAt));
  if (allRead) return CHAT_MSG_DELIVERY_STATUS.READ;

  // DELIVERED: at least one non-sender participant has deliveredAt OR readAt
  const anyDelivered = others.some((id) => {
    const r = byId.get(id);
    return Boolean(r?.deliveredAt || r?.readAt);
  });
  if (anyDelivered) return CHAT_MSG_DELIVERY_STATUS.DELIVERED;

  // otherwise it's SENT (saved in DB but nobody has received it yet)
  return CHAT_MSG_DELIVERY_STATUS.SENT;
}
