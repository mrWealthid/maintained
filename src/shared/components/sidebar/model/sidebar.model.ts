import { ROLES } from "@/shared/enums/enums";
import type { WorkspaceType } from "@/shared/model/workspace.model";
import type { WORKSPACE_ROLE } from "@/shared/auth/roles";

export interface SidebarProps {
  role: ROLES;
  workspaceRole?: WORKSPACE_ROLE | null;
  workspaceType?: WorkspaceType | null;
}

export interface SidebarProfileData {
  name: string;
  email?: string;
  role: ROLES;
  workspaceRole?: WORKSPACE_ROLE | null;
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
