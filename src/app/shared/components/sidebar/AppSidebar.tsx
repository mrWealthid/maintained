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
import { Routes } from "@/app/shared/model/model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Profile from "@/app/shared/components/profile/Profile";
import Logout from "@/app/shared/components/header/Logout";
import { Separator } from "@/components/ui/separator";
import { SwitchBusiness } from "./SwitchBusiness";

function AppSidebar({ routes }: { routes: Routes[] }) {
  const pathname = usePathname();
  const { open, setOpenMobile, isMobile } = useSidebar();

  return (
    <Sidebar className="flex flex-col h-screen" collapsible="icon">
      <SidebarHeader>
        <div className="flex flex-col   justify-between">
          {open && <SwitchBusiness />}
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
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                      asChild
                    >
                      <Link
                        href={link.path}
                        className={`hover:translate-x-1  rounded-lg text-sm transition-all duration-500 flex items-center gap-2 ${
                          isActive
                            ? "bg-sidebar-accent text-button-primary"
                            : ""
                        }`}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="focus-visible:ring-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Profile />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width)  min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <Logout />
                </DropdownMenuItem>

                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default React.memo(AppSidebar);
