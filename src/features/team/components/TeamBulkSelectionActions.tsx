"use client";

import { Ban, RefreshCw, Trash2 } from "lucide-react";

import BulkSelectionActionBar from "@/shared/components/BulkSelectionActionBar";
import type { SelectionActionRenderArgs } from "@/shared/model/action-confirm.model";

import {
  TEAM_MEMBER_STATUS,
  type TeamListBulkAction,
  type TeamListItem,
} from "../models/team.model";

type TeamBulkSelectionActionsProps = SelectionActionRenderArgs<TeamListItem> & {
  inviteAllowed: boolean;
  isBulkActionPending: boolean;
  onOpenConfirm: (action: TeamListBulkAction, memberIds: string[]) => void;
};

export function hasTeamBulkActions(args: {
  selectedRows: TeamListItem[];
  inviteAllowed: boolean;
}) {
  const { selectedRows, inviteAllowed } = args;
  const hasPendingInvite = selectedRows.some(
    (member) => member.status === TEAM_MEMBER_STATUS.pending,
  );
  const hasRemovable = selectedRows.some((member) => !member.isCurrentUser);
  return (inviteAllowed && hasPendingInvite) || hasRemovable;
}

export default function TeamBulkSelectionActions({
  selectedRows,
  inviteAllowed,
  isBulkActionPending,
  onOpenConfirm,
}: TeamBulkSelectionActionsProps) {
  const pendingInviteIds = selectedRows
    .filter((member) => member.status === TEAM_MEMBER_STATUS.pending)
    .map((member) => member.id);
  const memberIds = selectedRows
    .filter((member) => member.kind === "member" && !member.isCurrentUser)
    .map((member) => member.id);
  const removableIds = selectedRows
    .filter((member) => !member.isCurrentUser)
    .map((member) => member.id);

  const actions = [
    ...(inviteAllowed && pendingInviteIds.length > 0
      ? [
          {
            key: "resend",
            label: "Resend invite",
            icon: RefreshCw,
            disabled: false,
            onClick: () => onOpenConfirm("resend", pendingInviteIds),
          },
        ]
      : []),
    ...(memberIds.length > 0
      ? [
          {
            key: "deactivate",
            label: "Deactivate",
            icon: Ban,
            disabled: false,
            onClick: () => onOpenConfirm("deactivate", memberIds),
          },
        ]
      : []),
    ...(removableIds.length > 0
      ? [
          {
            key: "delete",
            label: "Delete selected",
            icon: Trash2,
            disabled: false,
            onClick: () => onOpenConfirm("delete", removableIds),
          },
        ]
      : []),
  ];

  return (
    <BulkSelectionActionBar
      isActionPending={isBulkActionPending}
      isMessagePending={false}
      isSelectionActionPending={isBulkActionPending}
      showMessageButton={false}
      onMessageClick={() => {}}
      actionPendingLabel="Processing..."
      actions={actions}
    />
  );
}
