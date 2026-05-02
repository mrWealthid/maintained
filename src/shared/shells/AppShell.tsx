// components/shells/AppShell.tsx
"use client";
import React from "react";
import { ROLES } from "@/shared/enums/enums";
import { AppProvider } from "../contexts/AppContext";
import { SessionKeepAliveDialog } from "@/shared/components/auth/SessionKeepAliveDialog";
import type { WorkspaceType } from "@/shared/model/workspace.model";
import type { WORKSPACE_ROLE } from "@/shared/auth/roles";

export function AppShell({
  children,
  fallbackRole,
  fallbackWorkspaceRole,
  fallbackWorkspaceType,
  sessionTimeoutMinutes,
}: {
  children: React.ReactNode;
  fallbackRole: ROLES;
  fallbackWorkspaceRole?: WORKSPACE_ROLE | null;
  fallbackWorkspaceType?: WorkspaceType | null;
  sessionTimeoutMinutes: number;
}) {
  return (
    <>
      <SessionKeepAliveDialog sessionTimeoutMinutes={sessionTimeoutMinutes} />
      <AppProvider
        fallbackRole={fallbackRole}
        fallbackWorkspaceRole={fallbackWorkspaceRole}
        fallbackWorkspaceType={fallbackWorkspaceType}
      >
        {children}
      </AppProvider>
    </>
  );
}
