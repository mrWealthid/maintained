export function buildWorkspaceRecipientMap(args: {
  workspaceName: string;
  workspaceEmail?: string;
  creatorName?: string;
  creatorEmail?: string;
}) {
  const recipients = new Map<string, string>();

  if (args.creatorEmail?.trim()) {
    recipients.set(
      args.creatorEmail.trim().toLowerCase(),
      args.creatorName?.trim() || args.workspaceName,
    );
  }

  if (args.workspaceEmail?.trim()) {
    const normalizedWorkspaceEmail = args.workspaceEmail.trim().toLowerCase();
    if (!recipients.has(normalizedWorkspaceEmail)) {
      recipients.set(normalizedWorkspaceEmail, args.workspaceName);
    }
  }

  return recipients;
}
