"use client";

import { useState, type ComponentType } from "react";
import { Edit, Mail, Trash2 } from "lucide-react";

import { TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RowActionsMenu from "@/shared/components/table/RowActionsMenu";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";

import { UserRowActionsProps } from "@/shared/model/model";
import { useDeleteUser, useReInviteUser } from "../hooks/userHooks";
import UserForm from "../forms/UserForm";
import { getMembershipForBusiness } from "@/utils/helpers";
import { INVITE_STATUS } from "@/shared/enums/enums";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";
import type { BaseActions, ConfirmActions } from "@/shared/model/model";

type ConfirmKey = "delete" | "reinvite";

type ConfirmConfigItem = {
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "destructive";
  icon?: ComponentType<{ className?: string }>;
  onConfirm: () => Promise<void> | void;
};

const UserRowAction = ({ user, membership }: UserRowActionsProps) => {
  const { isDeleting, deleteUser } = useDeleteUser();
  const { isInviting, reInviteUser } = useReInviteUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmKey, setConfirmKey] = useState<ConfirmKey | null>(null);

  const canEditUser = useHasPermission(PERMISSION.TEAM_ROLE_MANAGE);
  const canInviteTeam = useHasPermission(PERMISSION.TEAM_INVITE);
  const canRemoveTeamMember = useHasPermission(PERMISSION.TEAM_REMOVE);

  const member = getMembershipForBusiness(user, user.currentBusiness.id);
  const canReInviteUser =
    canInviteTeam &&
    member?.inviteExpired &&
    member.status !== INVITE_STATUS.activated;
  const hasRowActions = canEditUser || canReInviteUser || canRemoveTeamMember;

  if (!hasRowActions) return <TableCell className="md:px-2 py-2" />;

  const confirmConfig: Record<ConfirmKey, ConfirmConfigItem> = {
    delete: {
      title: "Delete User",
      description: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      confirmLabel: isDeleting ? "Deleting..." : "Delete",
      variant: "destructive",
      icon: Trash2,
      onConfirm: () => {
        if (!user.id) return;
        deleteUser(user.id, { onSuccess: () => setConfirmKey(null) });
      },
    },
    reinvite: {
      title: "Re-Invite User",
      description: `Are you sure you want to re-invite ${user.name}?`,
      confirmLabel: isInviting ? "Sending..." : "Re-invite",
      icon: Mail,
      onConfirm: () => {
        if (!user.id) return;
        reInviteUser(
          { email: user.email },
          { onSuccess: () => setConfirmKey(null) },
        );
      },
    },
  };

  const activeConfirm = confirmKey ? confirmConfig[confirmKey] : null;

  const baseActions: BaseActions[] = [];

  if (canEditUser) {
    baseActions.push({
      label: "Edit",
      action: () => {
        setMenuOpen(false);
        setEditOpen(true);
      },
      icon: Edit,
    });
  }

  const confirmableActions: Array<
    Omit<ConfirmActions, "key"> & { key: ConfirmKey }
  > = [];

  if (canReInviteUser) {
    confirmableActions.push({
      label: "Re-Invite",
      key: "reinvite",
      icon: Mail,
    });
  }

  if (canRemoveTeamMember) {
    confirmableActions.push({
      label: "Delete",
      key: "delete",
      icon: Trash2,
      variant: "destructive",
    });
  }

  return (
    <TableCell className="md:px-2 py-2 space-x-3">
      <RowActionsMenu
        ariaLabel={`Actions for user ${user.name}`}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        baseActions={baseActions}
        confirmActions={confirmableActions}
        onConfirmAction={(key) => {
          setMenuOpen(false);
          setConfirmKey(key);
        }}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>Manage your users</DialogDescription>
          </DialogHeader>
          <UserForm
            user={user}
            membership={membership}
            onCloseModal={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {activeConfirm ? (
        <ActionConfirmDialog
          open={!!activeConfirm}
          onOpenChange={(o) => !o && setConfirmKey(null)}
          title={activeConfirm.title}
          description={activeConfirm.description}
          confirmLabel={activeConfirm.confirmLabel}
          variant={activeConfirm.variant}
          icon={activeConfirm.icon}
          isLoading={isDeleting || isInviting}
          onConfirm={async () => {
            await activeConfirm.onConfirm();
          }}
        />
      ) : null}
    </TableCell>
  );
};

export default UserRowAction;
