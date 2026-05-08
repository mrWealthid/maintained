"use client";

import { type ComponentType, useState } from "react";
import {
  Ban,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
  Wallet,
  Wrench,
} from "lucide-react";
import { BaseActions, ConfirmActions } from "@/shared/model/model";
import {
  formatWorkspaceRoleLabel,
  USER_TYPE,
  WORKSPACE_ROLE,
} from "@/shared/auth/roles";
import {
  TEAM_INVITE_ROLE_VALUES,
  TEAM_MEMBER_STATUS,
  type TeamInviteRole,
  type TeamListItem,
} from "../models/team.model";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
import RowActionsMenu from "@/shared/components/table/RowActionsMenu";
import { useWorkspaceRoles } from "@/features/access-control/hooks/use-access-control";
import {
  useDeactivateTeamMember,
  useDeleteTeamMember,
  useResendTeamInvite,
  useUpdateTeamRole,
} from "../hooks/use-team";

type ConfirmKey = "resend" | "deactivate" | "delete" | `role:${string}`;

type ConfirmConfigItem = {
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "destructive";
  icon?: ComponentType<{ className?: string }>;
  onConfirm: () => Promise<void>;
};

type TeamConfirmAction = Omit<ConfirmActions, "key"> & { key: ConfirmKey };

const TEAM_ROLE_ACTION_META = {
  [WORKSPACE_ROLE.property_manager]: { icon: ShieldCheck },
  [WORKSPACE_ROLE.maintenance_coordinator]: { icon: ShieldCheck },
  [WORKSPACE_ROLE.accountant]: { icon: Wallet },
  [WORKSPACE_ROLE.member]: { icon: UserRound },
  [USER_TYPE.technician]: { icon: Wrench },
} as const satisfies Record<
  TeamInviteRole,
  { icon: ComponentType<{ className?: string }> }
>;

const TEAM_INVITE_ACTION_META = {
  active: {
    title: "Resend invitation",
    getDescription: (email: string) =>
      `A fresh onboarding email will be sent to ${email}.`,
    confirmLabel: "Resend",
    menuLabel: "Resend invite",
  },
  expired: {
    title: "Re-invite team member",
    getDescription: (email: string) =>
      `The expired invite for ${email} will be replaced with a fresh onboarding link.`,
    confirmLabel: "Re-invite",
    menuLabel: "Re-invite",
  },
} as const;

function toRoleConfirmKey(role: string) {
  return `role:${role}` as const;
}

type RoleOption = {
  id: string;
  label: string;
  legacyRole: TeamInviteRole;
  isSystem: boolean;
};

function getRoleIcon(role: TeamInviteRole) {
  return TEAM_ROLE_ACTION_META[role].icon;
}

function getRoleActionCopy(args: {
  member: TeamListItem;
  nextRole: RoleOption;
}) {
  const roleLabel = args.nextRole.label;
  const lowerRoleLabel = roleLabel.toLowerCase();

  if (args.member.kind === "invite") {
    return {
      title: `Assign ${roleLabel} access`,
      description: `${args.member.name} will be invited as ${lowerRoleLabel}.`,
      confirmLabel: "Update invite role",
      menuLabel: `Change invite to ${roleLabel}`,
    };
  }

  return {
    title: `Change role to ${roleLabel}`,
    description: `${args.member.name} will be updated to ${lowerRoleLabel}.`,
    confirmLabel: "Update role",
    menuLabel: `Change to ${roleLabel}`,
  };
}

export default function TeamActions({
  member,
  inviteAllowed,
}: {
  member: TeamListItem;
  inviteAllowed: boolean;
}) {
  const rolesQuery = useWorkspaceRoles();
  const updateRole = useUpdateTeamRole();
  const resendInvite = useResendTeamInvite();
  const deactivateMember = useDeactivateTeamMember();
  const deleteMember = useDeleteTeamMember();

  const [confirmKey, setConfirmKey] = useState<ConfirmKey | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const memberRoleOptions: RoleOption[] =
    rolesQuery.data?.roles
      ?.filter((role) => !role.locked)
      .map((role) => ({
        id: role.id,
        label: role.name,
        legacyRole: role.legacyRole,
        isSystem: role.isSystem,
      })) ?? [];
  const inviteRoleOptions: RoleOption[] = TEAM_INVITE_ROLE_VALUES.map(
    (role) => ({
      id: role,
      label: formatWorkspaceRoleLabel(role),
      legacyRole: role,
      isSystem: true,
    }),
  );

  let nextRoles: RoleOption[] = [];
  if (!member.isCurrentUser && member.role !== WORKSPACE_ROLE.owner) {
    const roleOptions =
      member.kind === "invite" ? inviteRoleOptions : memberRoleOptions;
    nextRoles = roleOptions.filter((role) => {
      if (member.kind === "invite") return role.legacyRole !== member.role;
      if (member.roleDefinitionId) return role.id !== member.roleDefinitionId;
      return !(role.isSystem && role.legacyRole === member.role);
    });
  }

  const isBusy =
    (updateRole.isPending && updateRole.variables?.id === member.id) ||
    (resendInvite.isPending && resendInvite.variables === member.id) ||
    (deactivateMember.isPending && deactivateMember.variables === member.id) ||
    (deleteMember.isPending && deleteMember.variables === member.id);

  let activeRoleMutation: string | null = null;
  if (updateRole.isPending && updateRole.variables?.id === member.id) {
    activeRoleMutation =
      "roleDefinitionId" in updateRole.variables.payload
        ? updateRole.variables.payload.roleDefinitionId
        : updateRole.variables.payload.role;
  }

  const isResendingInvite =
    isBusy && resendInvite.isPending && resendInvite.variables === member.id;
  const inviteActionKey = member.isInviteExpired ? "expired" : "active";
  const inviteActionMeta = TEAM_INVITE_ACTION_META[inviteActionKey];

  const confirmConfig: Partial<Record<ConfirmKey, ConfirmConfigItem>> = {
    resend: {
      title: inviteActionMeta.title,
      description: inviteActionMeta.getDescription(member.email),
      confirmLabel: isResendingInvite
        ? "Working..."
        : inviteActionMeta.confirmLabel,
      icon: RefreshCw,
      onConfirm: async () => {
        await resendInvite.mutateAsync(member.id);
      },
    },
    deactivate: {
      title: "Deactivate team member",
      description: `${member.name} will lose access to this workspace.`,
      confirmLabel:
        isBusy && deactivateMember.variables === member.id
          ? "Working..."
          : "Deactivate",
      variant: "destructive",
      icon: Ban,
      onConfirm: async () => {
        await deactivateMember.mutateAsync(member.id);
      },
    },
    delete: {
      title:
        member.kind === "invite" ? "Delete invitation" : "Delete team member",
      description:
        member.kind === "invite"
          ? `This will permanently remove the pending invitation for ${member.email}.`
          : `${member.name} will be removed from this workspace. This action cannot be undone.`,
      confirmLabel:
        isBusy && deleteMember.variables === member.id ? "Working..." : "Delete",
      variant: "destructive",
      icon: Trash2,
      onConfirm: async () => {
        await deleteMember.mutateAsync(member.id);
      },
    },
    ...Object.fromEntries(
      nextRoles.map((nextRole) => {
        const key = toRoleConfirmKey(nextRole.id);
        const actionCopy = getRoleActionCopy({ member, nextRole });

        return [
          key,
          {
            title: actionCopy.title,
            description: actionCopy.description,
            confirmLabel:
              activeRoleMutation === nextRole.id
                ? "Working..."
                : actionCopy.confirmLabel,
            icon: getRoleIcon(nextRole.legacyRole),
            onConfirm: async () => {
              await updateRole.mutateAsync({
                id: member.id,
                payload:
                  member.kind === "invite"
                    ? { kind: member.kind, role: nextRole.legacyRole }
                    : { kind: "member", roleDefinitionId: nextRole.id },
              });
            },
          } satisfies ConfirmConfigItem,
        ];
      }),
    ),
  };

  const activeDialog = confirmKey ? (confirmConfig[confirmKey] ?? null) : null;

  const baseActions: BaseActions[] = nextRoles.map((nextRole) => {
    const actionCopy = getRoleActionCopy({ member, nextRole });
    const Icon = getRoleIcon(nextRole.legacyRole);
    return {
      label: actionCopy.menuLabel,
      action: () => {
        setMenuOpen(false);
        setConfirmKey(toRoleConfirmKey(nextRole.id));
      },
      icon: Icon,
    };
  });

  if (member.status === TEAM_MEMBER_STATUS.pending) {
    baseActions.push({
      label: inviteActionMeta.menuLabel,
      action: () => {
        setMenuOpen(false);
        setConfirmKey("resend");
      },
      icon: RefreshCw,
      disabled: !inviteAllowed,
    });
  }

  const confirmableActions: TeamConfirmAction[] = [];

  if (member.kind === "member" && !member.isCurrentUser) {
    confirmableActions.push({
      label: "Deactivate",
      key: "deactivate",
      icon: Ban,
      variant: "destructive",
    });
  }

  if (!member.isCurrentUser) {
    confirmableActions.push({
      label: "Delete",
      key: "delete",
      icon: Trash2,
      variant: "destructive",
    });
  }

  return (
    <>
      <RowActionsMenu
        ariaLabel={`Actions for ${member.name}`}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        baseActions={baseActions}
        confirmActions={confirmableActions}
        disabled={isBusy}
        onConfirmAction={(key) => {
          setMenuOpen(false);
          setConfirmKey(key);
        }}
      />

      {activeDialog ? (
        <ActionConfirmDialog
          open={!!activeDialog}
          onOpenChange={() => setConfirmKey(null)}
          title={activeDialog.title}
          description={activeDialog.description}
          confirmLabel={activeDialog.confirmLabel}
          variant={activeDialog.variant}
          icon={activeDialog.icon}
          isLoading={isBusy}
          onConfirm={async () => {
            await activeDialog.onConfirm();
            setConfirmKey(null);
          }}
        />
      ) : null}
    </>
  );
}
