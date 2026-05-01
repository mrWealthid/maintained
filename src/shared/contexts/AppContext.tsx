"use client";
import { createContext, useContext, useMemo } from "react";
import { isSuperAdminRole } from "@/lib/auth/roles";
import { ROLES } from "@/shared/enums/enums";
import type { SidebarProfileData } from "../components/sidebar/model/sidebar.model";
import { useSidebarProfile } from "../components/sidebar/hooks/useSidebarProfile";
import {
  DEFAULT_WORKSPACE_TYPE,
  getWorkspaceTypeLabel,
  type WorkspaceType,
} from "@/shared/model/workspace.model";
import type { WORKSPACE_ROLE } from "@/shared/auth/roles";

interface AppContextType {
  hasResolvedUser: boolean;
  user: SidebarProfileData;
  isLoading: boolean;
  error: unknown;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

function buildFallbackUser(
  role: ROLES,
  workspaceRole?: WORKSPACE_ROLE | null,
  workspaceType?: WorkspaceType | null
): SidebarProfileData {
  const resolvedWorkspaceType = isSuperAdminRole(role)
    ? null
    : (workspaceType ?? DEFAULT_WORKSPACE_TYPE);

  return {
    id: "",
    name: "Workspace User",
    email: "",
    role,
    workspaceRole,
    permissions: [],
    isWorkspaceOwner: false,
    currentBusiness: {
      id: "",
      name: isSuperAdminRole(role) ? "Platform" : "Business",
    },
    businessName: isSuperAdminRole(role) ? "Platform" : "Business",
    workspaceType: resolvedWorkspaceType,
    workspaceLabel: isSuperAdminRole(role)
      ? "Platform"
      : getWorkspaceTypeLabel(resolvedWorkspaceType, { short: true }),
    imageUrl: "",
  };
}

export const AppProvider = ({
  children,
  fallbackRole,
  fallbackWorkspaceRole,
  fallbackWorkspaceType,
}: {
  children: React.ReactNode;
  fallbackRole: ROLES;
  fallbackWorkspaceRole?: WORKSPACE_ROLE | null;
  fallbackWorkspaceType?: WorkspaceType | null;
}) => {
  const { data, isLoading, error } = useSidebarProfile();

  const memoizedValue = useMemo(
    () => ({
      user:
        data ??
        buildFallbackUser(
          fallbackRole,
          fallbackWorkspaceRole,
          fallbackWorkspaceType
        ),
      hasResolvedUser: Boolean(data),
      isLoading,
      error,
    }),
    [
      data,
      error,
      fallbackRole,
      fallbackWorkspaceRole,
      fallbackWorkspaceType,
      isLoading,
    ]
  );

  return (
    <AppContext.Provider value={memoizedValue}>
      {children}
    </AppContext.Provider>
  );
};
