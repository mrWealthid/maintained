import { TICKET_PRIORITY, TICKET_STATUS } from "@/app/shared/enums/enums";
import { CHAT_ROLES } from "../data/enums";

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
