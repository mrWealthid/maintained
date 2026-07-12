/** Who, on either side of the conversation, authored a given message. */
export const CONVERSATION_SENDER_KIND = {
  MANAGER: "manager",
  TRADE: "trade",
  SYSTEM: "system",
} as const;

export type ConversationSenderKind =
  (typeof CONVERSATION_SENDER_KIND)[keyof typeof CONVERSATION_SENDER_KIND];

export const CONVERSATION_SENDER_KIND_VALUES = Object.values(
  CONVERSATION_SENDER_KIND,
);

/**
 * Body shape varies by message type. Text messages are free-form prose; the
 * quote-event messages are emitted by the server when a `RepairQuote`
 * transitions, and carry structured `meta` so the client can render rich UI
 * (amount diff, status badge, deep-link) without re-fetching the quote.
 */
export const CONVERSATION_MESSAGE_TYPE = {
  TEXT: "text",
  QUOTE_SUBMITTED: "quote_submitted",
  QUOTE_REVISED: "quote_revised",
  QUOTE_ACCEPTED: "quote_accepted",
  QUOTE_DECLINED: "quote_declined",
  QUOTE_WITHDRAWN: "quote_withdrawn",
} as const;

export type ConversationMessageType =
  (typeof CONVERSATION_MESSAGE_TYPE)[keyof typeof CONVERSATION_MESSAGE_TYPE];

export const CONVERSATION_MESSAGE_TYPE_VALUES = Object.values(
  CONVERSATION_MESSAGE_TYPE,
);
