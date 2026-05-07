"use client";

import { Home, Mail, Shield, UserRound, Wallet } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { USER_TYPE, WORKSPACE_ROLE } from "@/shared/auth/roles";
import {
  TEAM_MEMBER_STATUS,
  type TeamListItem,
} from "../models/team.model";
import {
  formatTeamDateValue,
  formatTeamRoleSummary,
  formatTeamStatusLabel,
  getTeamTimelineSecondaryLabel,
} from "../helpers/list-helper";
import TeamActions from "./TeamActions";

type TeamRowProps = {
  data?: TeamListItem[];
  enableSelection?: boolean;
  getRowIdForRow?: (row: TeamListItem, index: number) => string | number;
  isRowSelected?: (id: string | number) => boolean;
  toggleRowSelection?: (id: string | number) => void;
  inviteAllowed?: boolean;
};

function getStatusPresentation(status: TeamListItem["status"]) {
  if (status === TEAM_MEMBER_STATUS.pending) {
    return {
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300",
    };
  }
  if (status === TEAM_MEMBER_STATUS.accepted) {
    return {
      className:
        "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300",
    };
  }
  if (status === TEAM_MEMBER_STATUS.declined) {
    return {
      className:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300",
    };
  }
  return {
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300",
  };
}

function getRoleIcon(role: TeamListItem["role"]) {
  if (role === USER_TYPE.tenant) return Home;
  if (
    role === WORKSPACE_ROLE.owner ||
    role === WORKSPACE_ROLE.property_manager
  ) {
    return Shield;
  }
  if (role === WORKSPACE_ROLE.accountant) return Wallet;
  return UserRound;
}

function getRoleBadgeClassName(role: TeamListItem["role"]) {
  if (role === USER_TYPE.tenant) {
    return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300";
  }
  if (role === WORKSPACE_ROLE.owner) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300";
  }
  if (role === WORKSPACE_ROLE.property_manager) {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300";
  }
  if (role === WORKSPACE_ROLE.accountant) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300";
  }
  return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-900/40 dark:bg-slate-950/30 dark:text-slate-300";
}

export default function TeamRow({
  data,
  enableSelection,
  getRowIdForRow,
  isRowSelected,
  toggleRowSelection,
  inviteAllowed = true,
}: TeamRowProps) {
  if (!data?.length) return null;

  return (
    <>
      {data.map((member, index) => {
        const rowId = getRowIdForRow
          ? getRowIdForRow(member, index)
          : member.id;
        const checked = !!enableSelection && !!isRowSelected?.(rowId);
        const status = getStatusPresentation(member.status);
        const RoleIcon = getRoleIcon(member.role);

        return (
          <TableRow
            key={`${member.kind}-${member.id}`}
            className="relative hover:bg-muted/40 transition-colors"
          >
            {enableSelection ? (
              <TableCell className="w-8 px-2">
                <Checkbox
                  aria-label="Select row"
                  checked={checked}
                  onCheckedChange={() => toggleRowSelection?.(rowId)}
                  className="m-0"
                />
              </TableCell>
            ) : null}

            <TableCell className="font-medium whitespace-nowrap">
              {index + 1}.
            </TableCell>

            <TableCell colSpan={3} className="py-3 px-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <RoleIcon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-card-foreground">
                    {member.name}
                  </p>
                  {member.isCurrentUser ? (
                    <p className="text-xs text-muted-foreground">
                      Current session
                    </p>
                  ) : null}
                </div>
              </div>
            </TableCell>

            <TableCell className="py-3 px-2">
              <div className="flex items-center gap-1.5 text-sm text-card-foreground">
                <Mail className="size-3.5 text-muted-foreground" />
                <span className="truncate">{member.email}</span>
              </div>
            </TableCell>

            <TableCell className="py-3 px-2">
              <Badge
                variant="outline"
                className={getRoleBadgeClassName(member.role)}
              >
                {formatTeamRoleSummary(member)}
              </Badge>
            </TableCell>

            <TableCell className="py-3 px-2">
              <Badge variant="outline" className={status.className}>
                {formatTeamStatusLabel(member.status)}
              </Badge>
            </TableCell>

            <TableCell className="py-3 px-2">
              <div className="text-sm">
                <p className="text-card-foreground">
                  {member.kind === "member"
                    ? formatTeamDateValue(member.joinedAt)
                    : formatTeamDateValue(member.invitedAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getTeamTimelineSecondaryLabel(member)}
                </p>
              </div>
            </TableCell>

            <TableCell>
              <TeamActions member={member} inviteAllowed={inviteAllowed} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
