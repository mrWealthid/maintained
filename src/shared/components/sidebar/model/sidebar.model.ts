import { ROLES } from "@/shared/enums/enums";
import type { WorkspaceType } from "@/shared/model/workspace.model";
import type { WORKSPACE_ROLE } from "@/shared/auth/roles";
import type { PermissionKey } from "@/shared/auth/permission-registry";

export interface SidebarProps {
  role: ROLES;
  workspaceRole?: WORKSPACE_ROLE | null;
  workspaceType?: WorkspaceType | null;
}

export interface SidebarProfileData {
  id: string;
  name: string;
  email: string;
  photo?: string;
  role: ROLES;
  workspaceRole?: WORKSPACE_ROLE | null;
  permissions: PermissionKey[];
  isWorkspaceOwner?: boolean;
  currentBusiness: {
    id: string;
    name: string;
  };
  businessName: string;
  workspaceType?: WorkspaceType | null;
  workspaceLabel?: string;
  imageUrl?: string;
  currentWorkspaceId?: string;
  canUpgradeCurrentWorkspace?: boolean;
  workspaces?: SidebarWorkspaceSummary[];
}

export interface SidebarWorkspaceSummary {
  businessId: string;
  name: string;
  role: string;
  workspaceRole: WORKSPACE_ROLE | null;
  workspaceType: WorkspaceType;
  workspaceLabel: string;
  isCurrent: boolean;
}

export enum SidebarPosition {
  right = "right",
  left = "left",
}
