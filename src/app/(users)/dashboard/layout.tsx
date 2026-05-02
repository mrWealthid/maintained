import type { CSSProperties, ReactNode } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { HeaderBar } from "@/shared/components/header/Headerbar";
import AppSidebar from "@/shared/components/sidebar/AppSidebar";
import { AppShell } from "@/shared/shells/AppShell";
import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { getSessionTimeoutMinutesForVerifiedUser } from "@/lib/auth/session-timeout";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const verify = await requireDashboardAccess();
  const sessionTimeoutMinutes =
    await getSessionTimeoutMinutesForVerifiedUser(verify);

  return (
    <div className="dashboard-shell h-dvh flex overflow-hidden">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "17rem",
            "--header-height": "3rem",
          } as CSSProperties
        }
      >
        <AppSidebar role={verify.role} workspaceRole={verify.workspaceRole} />

        <SidebarInset className="bg-background shadow-none!">
          <HeaderBar />
          <ScrollArea className="@container/main flex-1 min-h-0">
            <div className="font-display flex flex-col gap-4 px-2 py-4 md:gap-6 md:px-4 md:py-6">
              <AppShell
                fallbackRole={verify.role}
                fallbackWorkspaceRole={verify.workspaceRole}
                sessionTimeoutMinutes={sessionTimeoutMinutes}
              >
                {children}
              </AppShell>
            </div>
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
