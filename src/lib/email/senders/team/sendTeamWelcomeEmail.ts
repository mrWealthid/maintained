import type { NextRequest } from "next/server";

import { sendAppTemplateEmail } from "@/lib/email/clients/app-email.client";
import { buildTeamWelcomeEmailHtml } from "@/lib/email/helpers/app-email-layout";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";
import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import { getWorkspaceTypeLabel } from "@/shared/model/workspace.model";
import { APP_ROUTE_PATHS } from "@/shared/routes/appRoutePaths";

export async function sendTeamWelcomeEmail(args: {
  request: NextRequest;
  to: string;
  attendeeName: string;
  workspaceName: string;
  workspaceType?: string | null;
  workspaceRole: string;
}) {
  const baseUrl = resolveAppBaseUrl(args.request);
  const loginUrl = `${baseUrl}${APP_ROUTE_PATHS.AUTH.LOGIN}`;
  const dashboardUrl = `${baseUrl}${APP_ROUTE_PATHS.DASHBOARD.OVERVIEW}`;
  const workspaceLabel = getWorkspaceTypeLabel(args.workspaceType);

  return sendAppTemplateEmail({
    templateKey: APP_EMAIL_TEMPLATE.TEAM_WELCOME,
    to: args.to,
    fallbackSubject: `Welcome to ${args.workspaceName}`,
    variables: {
      attendee_name: args.attendeeName,
      business_name: args.workspaceName,
      workspace_label: workspaceLabel,
      workspace_role: args.workspaceRole,
      login_url: loginUrl,
      dashboard_url: dashboardUrl,
    },
    customBodyHtml: buildTeamWelcomeEmailHtml({
      attendeeName: args.attendeeName,
      workspaceName: args.workspaceName,
      workspaceLabel,
      workspaceRole: args.workspaceRole,
      dashboardUrl,
      loginUrl,
    }),
  });
}
