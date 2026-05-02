import { TICKET_PRIORITY, TICKET_STATUS } from "@/shared/enums/enums";
import { CHAT_MSG_DELIVERY_STATUS, CHAT_ROLES } from "../data/enums";
import { ChatRoomMessage } from "../model/chat.model";
import { User } from "@/shared/model/model";

export const getRoleColor = (role: CHAT_ROLES) => {
  switch (role) {
    case CHAT_ROLES.ADMIN:
      return "bg-primary text-primary-foreground";
    case CHAT_ROLES.REQUESTER:
      return "bg-status-resolved text-status-resolved-foreground";
    case CHAT_ROLES.TECHNICIAN:
      return "bg-accent text-accent-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

// const getStatusColor = (status: TICKET_STATUS) => {
//   switch (status) {
//     case TICKET_STATUS.pending:
//       return "bg-status-open text-status-open dark:bg-status-open dark:text-status-open";
//     case TICKET_STATUS.processing:
//       return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
//     case TICKET_STATUS.assigned:
//       return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
//     case TICKET_STATUS.completed:
//       return "bg-status-resolved text-status-resolved dark:bg-status-resolved dark:text-status-resolved";
//     case TICKET_STATUS.declined:
//       return "bg-destructive text-destructive dark:bg-destructive dark:text-destructive";
//     default:
//       return "bg-muted text-foreground dark:bg-card dark:text-muted-foreground";
//   }
// };
export const getStatusColor = (status: TICKET_STATUS) => {
  switch (status) {
    case TICKET_STATUS.pending:
    case TICKET_STATUS.pending_assignment:
      return "bg-status-open text-status-open-foreground";
    case TICKET_STATUS.assigned:
    case TICKET_STATUS.processing:
    case TICKET_STATUS.scheduled:
      return "bg-status-progress text-status-progress-foreground";
    case TICKET_STATUS.completed:
      return "bg-status-resolved text-status-resolved-foreground";
    case TICKET_STATUS.declined:
      return "bg-status-overdue text-status-overdue-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const getPriorityColor = (priority: TICKET_PRIORITY) => {
  switch (priority) {
    case TICKET_PRIORITY.high:
      return "text-status-overdue";
    case TICKET_PRIORITY.medium:
      return "text-status-open";
    case TICKET_PRIORITY.low:
      return "text-status-resolved";
    default:
      return "text-muted-foreground";
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
