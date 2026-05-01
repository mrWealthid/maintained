// components/shells/AppShell.tsx
"use client";
import React from "react";
import { ROLES } from "@/shared/enums/enums";
import { AppProvider } from "../contexts/AppContext";
import type { WorkspaceType } from "@/shared/model/workspace.model";
import type { WORKSPACE_ROLE } from "@/shared/auth/roles";

export function AppShell({
  children,
  fallbackRole,
  fallbackWorkspaceRole,
  fallbackWorkspaceType,
}: {
  children: React.ReactNode;
  fallbackRole: ROLES;
  fallbackWorkspaceRole?: WORKSPACE_ROLE | null;
  fallbackWorkspaceType?: WorkspaceType | null;
}) {
  return (
    <AppProvider
      fallbackRole={fallbackRole}
      fallbackWorkspaceRole={fallbackWorkspaceRole}
      fallbackWorkspaceType={fallbackWorkspaceType}
    >
      {children}
    </AppProvider>
  );
}
