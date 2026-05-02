"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { MaintainLogo } from "../MaintainLogo";
import { ROLES } from "@/shared/enums/enums";
import SidebarProfileShell from "./SidebarProfileShell";
import type { WorkspaceType } from "@/shared/model/workspace.model";
import { getDashboardRoutes } from "@/shared/routes/appRoutes";
import type { WORKSPACE_ROLE } from "@/shared/auth/roles";
import { useSidebarProfile } from "./hooks/useSidebarProfile";

function AppSidebar({
  role,
  workspaceRole,
  workspaceType,
  canViewPayments,
}: {
  role: ROLES;
  workspaceRole?: WORKSPACE_ROLE | null;
  workspaceType?: WorkspaceType | null;
  canViewPayments?: boolean;
}) {
  const pathname = usePathname();
  const { open, setOpenMobile, isMobile } = useSidebar();
  const { data: profile } = useSidebarProfile();
  const routes = getDashboardRoutes({
    role,
    workspaceRole,
    workspaceType,
    canViewPayments,
  }).filter((route) => {
    if (!route.permission) return true;
    if (!profile) return true;
    return profile.permissions.includes(route.permission);
  });

  return (
    <Sidebar className="flex flex-col h-screen" collapsible="icon">
      <SidebarHeader>
        <div className="flex flex-col   justify-between">
          {/* {open  (
            <div>
              <p>Voluntary</p>{" "}
              <span className="italic text-xs">Volunteer Today Somewhere</span>
            </div>
          )} */}

          <MaintainLogo size={"sm"} variant={open ? "full" : "icon"} />

        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((link) => {
                const isActive = pathname === link.path;

                return (
                  <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                      className="bg-transparent transition-[background-color,color] duration-300 ease-out hover:bg-transparent active:bg-transparent data-[state=open]:hover:bg-transparent data-[active=true]:bg-muted data-[active=true]:font-medium"
                      asChild
                    >
                      <Link
                        href={link.path}
                        className="flex items-center gap-2 rounded-lg text-sm"
                      >
                        {link.icon &&
                          React.createElement(link.icon, {
                            className: "text-xl w-5 h-5",
                          })}
                        {link.name}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarProfileShell
              fallbackRole={role}
              fallbackWorkspaceRole={workspaceRole}
              fallbackWorkspaceType={workspaceType}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default React.memo(AppSidebar);
