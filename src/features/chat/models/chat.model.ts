export const CHAT_PARTICIPANT_ROLE = {
  REQUESTER: "REQUESTER",
  TECHNICIAN: "TECHNICIAN",
  ADMIN: "ADMIN",
} as const;

export const CHAT_PARTICIPANT_ROLE_VALUES = Object.values(
  CHAT_PARTICIPANT_ROLE,
);

export type ChatParticipantRole =
  (typeof CHAT_PARTICIPANT_ROLE_VALUES)[number];

export const CHAT_MESSAGE_TYPE = {
  USER: "USER",
  SYSTEM: "SYSTEM",
} as const;

export const CHAT_MESSAGE_TYPE_VALUES = Object.values(CHAT_MESSAGE_TYPE);

export type ChatMessageType = (typeof CHAT_MESSAGE_TYPE_VALUES)[number];

export function isChatMessageType(value: unknown): value is ChatMessageType {
  return (
    typeof value === "string" &&
    CHAT_MESSAGE_TYPE_VALUES.includes(value as ChatMessageType)
  );
}
