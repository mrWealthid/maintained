"use client";
import { Routes } from "../model/model";
import {
  Home,
  Settings,
  Wrench,
  MessageSquare,
  Users,
  Building2,
} from "lucide-react";

export const ROUTES_DEFINITION = {
  DASHBOARD: {
    OVERVIEW: "/dashboard",
    TICKETS: "/dashboard/ticket-management",
    MANAGE_TICKET: "/dashboard/ticket-management/manage",
    CHAT: "/dashboard/chat",
    SETTINGS: "/dashboard/settings",
  },
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
  },
};

export const TECHNICIAN_ROUTES_DEFINITION = {
  DASHBOARD: {
    OVERVIEW: "/dashboard",
    TICKETS: "/dashboard/ticket-management",
    CHAT: "/dashboard/chat",
    SETTINGS: "/dashboard/settings",
  },
};

export const ADMIN_ROUTES_DEFINITION = {
  DASHBOARD: {
    OVERVIEW: "/dashboard",
    TICKETS: "/dashboard/ticket-management",
    CHAT: "/dashboard/chat",
    USERS: "/dashboard/users",
    PROPERTIES: "/dashboard/properties",
    SETTINGS: "/dashboard/settings",
  },
};

export const routes: Routes[] = [
  {
    name: "Overview",
    path: ROUTES_DEFINITION.DASHBOARD.OVERVIEW,
    icon: Home,
  },
  {
    name: "Tickets",
    path: ROUTES_DEFINITION.DASHBOARD.TICKETS,
    icon: Wrench,
  },
  {
    name: "Chat",
    path: ROUTES_DEFINITION.DASHBOARD.CHAT,
    icon: MessageSquare,
  },
  {
    name: "Settings",
    path: ROUTES_DEFINITION.DASHBOARD.SETTINGS,
    icon: Settings,
  },
];
export const technicianRoutes: Routes[] = [
  {
    name: "Overview",
    path: TECHNICIAN_ROUTES_DEFINITION.DASHBOARD.OVERVIEW,
    icon: Home,
  },
  {
    name: "Tickets",
    path: TECHNICIAN_ROUTES_DEFINITION.DASHBOARD.TICKETS,
    icon: Wrench,
  },
  {
    name: "Chat",
    path: ROUTES_DEFINITION.DASHBOARD.CHAT,
    icon: MessageSquare,
  },
  {
    name: "Settings",
    path: TECHNICIAN_ROUTES_DEFINITION.DASHBOARD.SETTINGS,
    icon: Settings,
  },
];

export const adminRoutes: Routes[] = [
  {
    name: "Overview",
    path: ADMIN_ROUTES_DEFINITION.DASHBOARD.OVERVIEW,
    icon: Home,
  },
  {
    name: "Tickets",
    path: ADMIN_ROUTES_DEFINITION.DASHBOARD.TICKETS,
    icon: Wrench,
  },
  {
    name: "User Management",
    path: ADMIN_ROUTES_DEFINITION.DASHBOARD.USERS,
    icon: Users,
  },
  {
    name: "Property Management",
    path: ADMIN_ROUTES_DEFINITION.DASHBOARD.PROPERTIES,
    icon: Building2,
  },
  {
    name: "Chat",
    path: ADMIN_ROUTES_DEFINITION.DASHBOARD.CHAT,
    icon: MessageSquare,
  },
  {
    name: "Settings",
    path: ADMIN_ROUTES_DEFINITION.DASHBOARD.SETTINGS,
    icon: Settings,
  },
];
