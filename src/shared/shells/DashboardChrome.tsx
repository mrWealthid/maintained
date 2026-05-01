import type { ReactNode } from "react";

import Breadcrumbs from "@/shared/components/breadcrumbs/BreadCrumbs";
import AppSidebar from "@/shared/components/sidebar/AppSidebar";
import { HeaderBar } from "@/shared/components/header/Headerbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ROLES } from "@/shared/enums/enums";
import { AppShell } from "@/shared/shells/AppShell";

/**
 * Shared dashboard chrome: sidebar + header + breadcrumbs + content.
 *
 * The three role-specific dashboard layouts (admin, technician, users)
 * differ only in which `layoutConfig` entry they pick and which roles
 * pass through `requireDashboardAccess`. Both concerns are now handled
 * by this shell — the route-segment layouts become thin wrappers that
 * declare which role group they accept.
 */

type DashboardRole = ROLES.user | ROLES.admin | ROLES.technician;

type DashboardChromeProps = {
  role: DashboardRole;
  children: ReactNode;
};

export function DashboardChrome({ role, children }: DashboardChromeProps) {
  return (
    <section className="h-dvh flex">
      <SidebarProvider>
        <AppSidebar role={role} />
        <section className="flex flex-col overflow-x-hidden w-full">
          <HeaderBar />
          <section className="dashboard-body px-4 py-4">
            <Breadcrumbs />
            <AppShell>{children}</AppShell>
          </section>
        </section>
      </SidebarProvider>
    </section>
  );
}
