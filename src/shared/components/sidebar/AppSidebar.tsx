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
import { ProperlyLogo } from "../ProperlyLogo";
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
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex flex-col   justify-between">
          {/* {open  (
            <div>
              <p>Voluntary</p>{" "}
              <span className="italic text-xs">Volunteer Today Somewhere</span>
            </div>
          )} */}

          <ProperlyLogo size={"sm"} variant={open ? "full" : "icon"} />

        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {(() => {
                // Pick the sidebar entry whose path is the longest prefix of
                // the current URL — that way `/dashboard/ticket-management/abc`
                // activates the "Tickets" entry, and any deeper sub-route
                // (e.g. `/dashboard/volunteers/timecards`) still picks the
                // most specific entry rather than lighting up its parent too.
                const matches = routes.filter((link) => {
                  if (pathname === link.path) return true;
                  return pathname.startsWith(`${link.path}/`);
                });
                const longestMatch = matches.reduce<string | null>(
                  (best, link) =>
                    best === null || link.path.length > best.length
                      ? link.path
                      : best,
                  null,
                );
                return routes.map((link) => {
                  const isActive = link.path === longestMatch;

                  return (
                    <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                      className="bg-transparent transition-[background-color,color] duration-300 ease-out active:bg-muted/70 dark:active:bg-sidebar-accent/80 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground"
                      asChild
                    >
                      <Link
                        href={link.path}
                        className="flex items-center gap-2 rounded-lg text-sm transition-transform duration-200 ease-out hover:translate-x-1"
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
                });
              })()}
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
