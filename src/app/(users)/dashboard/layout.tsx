import type { CSSProperties, ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { HeaderBar } from "@/shared/components/header/Headerbar";
import AppSidebar from "@/shared/components/sidebar/AppSidebar";
import { AppShell } from "@/shared/shells/AppShell";
import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const verify = await requireDashboardAccess();

  return (
    <section className="h-dvh flex overflow-hidden dashboard-shell">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "20.5rem",
          } as CSSProperties
        }
      >
        <AppSidebar role={verify.role} workspaceRole={verify.workspaceRole} />

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <HeaderBar />

          <section className="flex-1 overflow-y-auto overflow-x-hidden px-2 md:px-4 py-10">
            <div className="font-display">
              <AppShell
                fallbackRole={verify.role}
                fallbackWorkspaceRole={verify.workspaceRole}
              >
                {children}
              </AppShell>
            </div>
          </section>
        </section>
      </SidebarProvider>
    </section>
  );
}
