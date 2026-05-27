import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import { sendAppTemplateEmail } from "@/lib/email/clients/app-email.client";
import { buildPasscodeEmailHtml } from "@/lib/email/helpers/app-email-layout";

export async function sendPasswordChangePasscodeEmail(args: {
  to: string;
  attendeeName: string;
  passcode: string;
}) {
  const expiresMinutes = process.env.PASSWORD_CHANGE_PASSCODE_EXPIRES_IN || "10";

  return sendAppTemplateEmail({
    templateKey: APP_EMAIL_TEMPLATE.PASSWORD_CHANGE_PASSCODE,
    to: args.to,
    fallbackSubject: "Your Properly verification code",
    variables: {
      attendee_name: args.attendeeName,
      passcode: args.passcode,
      passcode_expires_minutes: expiresMinutes,
    },
    customBodyHtml: buildPasscodeEmailHtml({
      attendeeName: args.attendeeName,
      passcode: args.passcode,
      expiresMinutes,
    }),
  });
}
