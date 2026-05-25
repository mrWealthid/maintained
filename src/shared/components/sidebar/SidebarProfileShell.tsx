"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import Profile from "@/shared/components/profile/Profile";
import Logout from "@/shared/components/header/Logout";
import { ROLES } from "@/shared/enums/enums";
import { isSuperAdminRole } from "@/lib/auth/roles";
import type { SidebarProfileData } from "./model/sidebar.model";
import { useSidebarProfile } from "./hooks/useSidebarProfile";
import {
  DEFAULT_WORKSPACE_TYPE,
  getWorkspaceTypeLabel,
  type WorkspaceType,
} from "@/shared/model/workspace.model";
import { useSwitchWorkspace, useUpgradeWorkspace } from "@/shared/hooks/useWorkspaceActions";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
import { Building2, Check, Eye, Loader2, Plus, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import UserPermissionsSheet from "@/features/access-control/components/UserPermissionsSheet";
import {
  formatWorkspaceRoleLabel,
  type WORKSPACE_ROLE,
} from "@/shared/auth/roles";

function SidebarProfileSkeleton({ expanded }: { expanded: boolean }) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center",
        expanded ? "gap-3" : "w-full justify-center",
      )}
    >
      <Skeleton className="size-10 rounded-full" />
      {expanded ? (
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      ) : null}
    </div>
  );
}

export default function SidebarProfileShell({
  fallbackRole,
  fallbackWorkspaceRole,
  fallbackWorkspaceType,
}: {
  fallbackRole: ROLES;
  fallbackWorkspaceRole?: WORKSPACE_ROLE | null;
  fallbackWorkspaceType?: WorkspaceType | null;
}) {
  const { open, isMobile } = useSidebar();
  const { data, isLoading } = useSidebarProfile();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [permissionsSheetOpen, setPermissionsSheetOpen] = useState(false);
  const [switchingWorkspaceId, setSwitchingWorkspaceId] = useState<string | null>(
    null,
  );
  const switchWorkspaceMutation = useSwitchWorkspace();
  const upgradeWorkspaceMutation = useUpgradeWorkspace();

  const fallbackProfile: SidebarProfileData = {
    id: "",
    name: "Workspace User",
    email: "",
    role: fallbackRole,
    workspaceRole: fallbackWorkspaceRole,
    permissions: [],
    effectivePermissions: [],
    permissionCatalog: [],
    isWorkspaceOwner: false,
    currentBusiness: {
      id: "",
      name: isSuperAdminRole(fallbackRole) ? "Platform" : "Business",
    },
    businessName: isSuperAdminRole(fallbackRole) ? "Platform" : "Business",
    workspaceType: isSuperAdminRole(fallbackRole)
      ? null
      : (fallbackWorkspaceType ?? DEFAULT_WORKSPACE_TYPE),
    workspaceLabel: isSuperAdminRole(fallbackRole)
      ? "Platform"
        : getWorkspaceTypeLabel(
          fallbackWorkspaceType ?? DEFAULT_WORKSPACE_TYPE,
          { short: true },
        ),
    imageUrl: "",
    currentWorkspaceId: undefined,
    canUpgradeCurrentWorkspace: false,
    workspaces: [],
  };

  const profile = data ?? fallbackProfile;
  const hasResolvedProfile = Boolean(data) || !isLoading;
  const availableWorkspaces = profile.workspaces ?? [];
  const canSwitchWorkspaces = availableWorkspaces.length > 1;
  const canCreateWorkspace =
    !isSuperAdminRole(profile.role) && profile.isWorkspaceOwner === true;
  let roleLabel = "No role assigned";
  if (isSuperAdminRole(profile.role)) {
    roleLabel = "Platform administrator";
  } else if (profile.workspaceRole) {
    roleLabel = formatWorkspaceRoleLabel(profile.workspaceRole);
  }

  const handleSwitchWorkspace = async (businessId: string) => {
    if (
      switchingWorkspaceId ||
      businessId === profile.currentWorkspaceId
    ) {
      return;
    }

    setSwitchingWorkspaceId(businessId);

    try {
      await switchWorkspaceMutation.mutateAsync(businessId);
    } finally {
      setSwitchingWorkspaceId(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="h-auto min-h-14 rounded-xl border border-sidebar-border/70 bg-card px-3 py-3 shadow-none transition-colors hover:border-border dark:hover:border-primary/40 focus-visible:ring-0 data-[state=open]:border-primary/50 data-[state=open]:bg-sidebar-accent/80 data-[state=open]:text-foreground dark:bg-sidebar-accent/55 group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:border-sidebar-border/70 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0"
          >
            {hasResolvedProfile ? (
              <Profile {...profile} expanded={open} />
            ) : (
              <SidebarProfileSkeleton expanded={open} />
            )}
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-72 rounded-xl border-border/70 bg-popover p-2 shadow-xs dark:bg-card"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          <div className="rounded-xl border border-border/70 bg-muted/35 px-3 py-3 dark:bg-sidebar-accent/45">
            {hasResolvedProfile ? (
              <Profile {...profile} expanded />
            ) : (
              <SidebarProfileSkeleton expanded />
            )}
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="rounded-lg px-3 py-2"
            onSelect={(event) => {
              event.preventDefault();
              setPermissionsSheetOpen(true);
            }}
          >
            <Eye className="size-4" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                Access Details
              </p>
              <p className="text-xs text-muted-foreground">
                Review your role and workspace access.
              </p>
            </div>
          </DropdownMenuItem>

          {canCreateWorkspace ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="rounded-lg px-3 py-2"
                onSelect={(event) => {
                  event.preventDefault();
                  setCreateDialogOpen(true);
                }}
              >
                <Plus className="size-4" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Create New Workspace
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add another solo or business workspace under this account.
                  </p>
                </div>
              </DropdownMenuItem>
            </>
          ) : null}

          {canSwitchWorkspaces ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="px-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Switch Workspace
              </DropdownMenuLabel>
              {availableWorkspaces.map((workspace) => {
                const isSwitching =
                  switchingWorkspaceId === workspace.businessId &&
                  switchWorkspaceMutation.isPending;
                let statusIcon = (
                  <Building2 className="mt-0.5 size-4 text-muted-foreground" />
                );

                if (workspace.isCurrent) {
                  statusIcon = <Check className="mt-0.5 size-4 text-primary" />;
                }

                if (isSwitching) {
                  statusIcon = <Loader2 className="mt-0.5 size-4 animate-spin" />;
                }

                return (
                  <DropdownMenuItem
                    key={workspace.businessId}
                    disabled={switchWorkspaceMutation.isPending}
                    className={cn(
                      "rounded-lg px-3 py-2",
                      workspace.isCurrent && "bg-sidebar-accent/70",
                    )}
                    onSelect={(event) => {
                      event.preventDefault();
                      void handleSwitchWorkspace(workspace.businessId);
                    }}
                  >
                    {statusIcon}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {workspace.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {workspace.workspaceLabel} • {formatWorkspaceRoleLabel(
                          workspace.workspaceRole ?? workspace.role,
                        )}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </>
          ) : null}

          {profile.canUpgradeCurrentWorkspace ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="rounded-lg px-3 py-2"
                disabled={upgradeWorkspaceMutation.isPending}
                onSelect={(event) => {
                  event.preventDefault();
                  setUpgradeDialogOpen(true);
                }}
              >
                {upgradeWorkspaceMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <TrendingUp className="size-4" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Upgrade to Business Workspace
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Unlock team invitations and business workspace tools.
                  </p>
                </div>
              </DropdownMenuItem>
            </>
          ) : null}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            asChild
            className="rounded-lg p-0 focus:bg-transparent"
          >
            <Logout />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        title="Upgrade to Business Workspace"
        description="This will convert your current solo owner workspace into a business workspace and enable team invitations."
        confirmLabel={
          upgradeWorkspaceMutation.isPending
            ? "Upgrading..."
            : "Upgrade Workspace"
        }
        icon={TrendingUp}
        isLoading={upgradeWorkspaceMutation.isPending}
        onConfirm={async () => {
          await upgradeWorkspaceMutation.mutateAsync();
          setUpgradeDialogOpen(false);
        }}
      />
      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <UserPermissionsSheet
        open={permissionsSheetOpen}
        onOpenChange={setPermissionsSheetOpen}
        userName={profile.name}
        roleLabel={roleLabel}
        effectivePermissions={
          new Set(profile.effectivePermissions ?? profile.permissions ?? [])
        }
        permissionCatalog={profile.permissionCatalog ?? []}
      />
    </>
  );
}
