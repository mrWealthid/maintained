import { format } from "date-fns";
import { formatWorkspaceRoleLabel } from "@/shared/auth/roles";
import { TEAM_MEMBER_STATUS, type TeamListItem } from "../models/team.model";

export function formatTeamDateValue(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "MMM d, yyyy");
}

export function formatTeamRoleLabel(role: TeamListItem["role"]) {
  return formatWorkspaceRoleLabel(role);
}

export function formatTeamRoleSummary(member: TeamListItem) {
  return (
    member.roleDefinitionName?.trim() || formatWorkspaceRoleLabel(member.role)
  );
}

export function formatTeamStatusLabel(status: TeamListItem["status"]) {
  if (status === TEAM_MEMBER_STATUS.pending) return "Pending";
  if (status === TEAM_MEMBER_STATUS.accepted) return "Accepted";
  if (status === TEAM_MEMBER_STATUS.declined) return "Declined";
  return "Active";
}

export function getTeamMemberLabel(member: TeamListItem) {
  return member.isCurrentUser ? `${member.name} (Current user)` : member.name;
}

export function getTeamTimelineSecondaryLabel(member: TeamListItem) {
  if (member.status === TEAM_MEMBER_STATUS.pending) {
    const prefix = member.isInviteExpired ? "Expired" : "Expires";
    return `${prefix} ${formatTeamDateValue(member.inviteExpiresAt)}`;
  }
  if (member.status === TEAM_MEMBER_STATUS.accepted) return "Accepted";
  if (member.kind === "member") return "Joined";
  return "Invitation";
}

export function getTeamTimelineLabel(member: TeamListItem) {
  if (member.kind === "member") {
    return `Joined ${formatTeamDateValue(member.joinedAt)}`;
  }

  const invitedLabel = `Invited ${formatTeamDateValue(member.invitedAt)}`;

  if (member.status === TEAM_MEMBER_STATUS.pending) {
    const expiryLabel = member.isInviteExpired ? "Expired" : "Expires";
    return `${invitedLabel} • ${expiryLabel} ${formatTeamDateValue(member.inviteExpiresAt)}`;
  }
  if (member.status === TEAM_MEMBER_STATUS.accepted) {
    return `${invitedLabel} • Accepted`;
  }
  if (member.status === TEAM_MEMBER_STATUS.declined) {
    return `${invitedLabel} • Declined`;
  }
  return invitedLabel;
}
