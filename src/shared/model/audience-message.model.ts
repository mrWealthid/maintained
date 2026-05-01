import { z } from "zod";

export const AUDIENCE_MESSAGE_COMPOSE_MODE = {
  TEMPLATE: "template",
  PLAIN: "plain",
} as const;

export const AudienceMessageComposeModeSchema = z.enum([
  AUDIENCE_MESSAGE_COMPOSE_MODE.TEMPLATE,
  AUDIENCE_MESSAGE_COMPOSE_MODE.PLAIN,
]);

export const AudienceMessageContentSchema = z.object({
  composeMode: AudienceMessageComposeModeSchema,
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(140, "Subject must be 140 characters or fewer"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be 5000 characters or fewer"),
});

export type AudienceMessageContent = z.infer<
  typeof AudienceMessageContentSchema
>;

export type AudienceMessageComposeMode = z.infer<
  typeof AudienceMessageComposeModeSchema
>;

export type AudienceMessageSendResult = {
  requestedCount: number;
  recipientCount: number;
  successCount: number;
  failureCount: number;
};
