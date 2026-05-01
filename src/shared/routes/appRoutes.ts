"use client";

import {
  Building2,
  Home,
  MessageSquare,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

import { ROLES } from "@/shared/enums/enums";
import type { WORKSPACE_ROLE } from "@/shared/auth/roles";
import type { WorkspaceType } from "@/shared/model/workspace.model";
import type { Routes } from "@/shared/model/model";
import { APP_ROUTE_PATHS } from "./appRoutePaths";

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
  },
  {
    name: "Chat",
    path: APP_ROUTES.DASHBOARD.CHAT,
    icon: MessageSquare,
  },
  {
    name: "Settings",
    path: APP_ROUTES.DASHBOARD.SETTINGS,
    icon: Settings,
  },
];

export const technicianRoutes: Routes[] = [
  {
    name: "Overview",
    path: APP_ROUTES.TECHNICIAN_DASHBOARD.OVERVIEW,
    icon: Home,
  },
  {
    name: "Tickets",
    path: APP_ROUTES.TECHNICIAN_DASHBOARD.TICKETS,
    icon: Wrench,
  },
  {
    name: "Chat",
    path: APP_ROUTES.TECHNICIAN_DASHBOARD.CHAT,
    icon: MessageSquare,
  },
  {
    name: "Settings",
    path: APP_ROUTES.TECHNICIAN_DASHBOARD.SETTINGS,
    icon: Settings,
  },
];

export const adminRoutes: Routes[] = [
  {
    name: "Overview",
    path: APP_ROUTES.ADMIN_DASHBOARD.OVERVIEW,
    icon: Home,
  },
  {
    name: "Tickets",
    path: APP_ROUTES.ADMIN_DASHBOARD.TICKETS,
    icon: Wrench,
  },
  {
    name: "User Management",
    path: APP_ROUTES.ADMIN_DASHBOARD.USERS,
    icon: Users,
  },
  {
    name: "Property Management",
    path: APP_ROUTES.ADMIN_DASHBOARD.PROPERTIES,
    icon: Building2,
  },
  {
    name: "Chat",
    path: APP_ROUTES.ADMIN_DASHBOARD.CHAT,
    icon: MessageSquare,
  },
  {
    name: "Settings",
    path: APP_ROUTES.ADMIN_DASHBOARD.SETTINGS,
    icon: Settings,
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

  switch (args.role) {
    case ROLES.admin:
    case ROLES.owner:
    case ROLES.super_admin:
      return adminRoutes;
    case ROLES.technician:
      return technicianRoutes;
    default:
      return routes;
  }
}
