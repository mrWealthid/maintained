"use client";

import {
  Building2,
  Home,
  MessageSquare,
  Settings,
  Shield,
  Users,
  Wrench,
} from "lucide-react";

import { ROLES } from "@/shared/enums/enums";
import { isPlatformSuperAdminRole, type WORKSPACE_ROLE } from "@/shared/auth/roles";
import type { WorkspaceType } from "@/shared/model/workspace.model";
import type { Routes } from "@/shared/model/model";
import { APP_ROUTE_PATHS } from "./appRoutePaths";
import { PERMISSION } from "@/shared/auth/permission-registry";

export const APP_ROUTES = APP_ROUTE_PATHS;

export const routes: Routes[] = [
  {
    name: "Overview",
    path: APP_ROUTES.DASHBOARD.OVERVIEW,
    icon: Home,
  },
  {
    name: "Tickets",
    path: APP_ROUTES.DASHBOARD.TICKETS,
    icon: Wrench,
    permission: PERMISSION.TICKETS_VIEW,
  },
  {
    name: "Property Management",
    path: APP_ROUTES.DASHBOARD.PROPERTIES,
    icon: Building2,
    permission: PERMISSION.PROPERTIES_VIEW,
  },
  {
    name: "Team Management",
    path: APP_ROUTES.DASHBOARD.TEAM,
    icon: Users,
    permission: PERMISSION.TEAM_VIEW,
  },
  {
    name: "Access Control",
    path: APP_ROUTES.DASHBOARD.ACCESS_CONTROL,
    icon: Shield,
    permission: PERMISSION.TEAM_ROLE_MANAGE,
  },
  {
    name: "Chat",
    path: APP_ROUTES.DASHBOARD.CHAT,
    icon: MessageSquare,
    permission: PERMISSION.CHAT_VIEW,
  },
  {
    name: "Settings",
    path: APP_ROUTES.DASHBOARD.SETTINGS,
    icon: Settings,
    permission: PERMISSION.SETTINGS_VIEW,
  },
];

export const technicianRoutes: Routes[] = [...routes];

export const adminRoutes: Routes[] = [...routes];

export const superAdminRoutes: Routes[] = [
  {
    name: "Overview",
    path: APP_ROUTES.DASHBOARD.OVERVIEW,
    icon: Home,
  },
  {
    name: "Workspaces",
    path: APP_ROUTES.DASHBOARD.WORKSPACES,
    icon: Building2,
    permission: PERMISSION.PLATFORM_WORKSPACES_VIEW,
  },
  {
    name: "Settings",
    path: APP_ROUTES.DASHBOARD.SETTINGS,
    icon: Settings,
    permission: PERMISSION.PLATFORM_SETTINGS_VIEW,
  },
];

export function getDashboardRoutes(args: {
  role: ROLES;
  workspaceRole?: WORKSPACE_ROLE | null;
  workspaceType?: WorkspaceType | null;
  canViewPayments?: boolean;
}): Routes[] {
  void args.workspaceRole;
  void args.workspaceType;
  void args.canViewPayments;

  if (isPlatformSuperAdminRole(args.role)) {
    return superAdminRoutes;
  }

  switch (args.role) {
    case ROLES.admin:
    case ROLES.owner:
      return adminRoutes;
    case ROLES.technician:
      return technicianRoutes;
    default:
      return routes;
  }
}
