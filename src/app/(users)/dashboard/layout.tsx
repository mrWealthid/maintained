import type { CSSProperties, ReactNode } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { HeaderBar } from "@/shared/components/header/Headerbar";
import AppSidebar from "@/shared/components/sidebar/AppSidebar";
import { AppShell } from "@/shared/shells/AppShell";
import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { getSessionTimeoutMinutesForVerifiedUser } from "@/lib/auth/session-timeout";
import { getEffectiveWorkspacePermissionSet } from "@/lib/auth/effective-permissions";
import { isPlatformSuperAdminRole } from "@/shared/auth/roles";
import Business from "@/models/businessModel";
import { redirect } from "next/navigation";

// The layout reads cookies and per-user permissions, so it must always run
// fresh — never cached across users or refreshes.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const verify = await requireDashboardAccess();
  if (!isPlatformSuperAdminRole(verify.platformRole)) {
    const business = await Business.findById(verify.businessId)
      .select("onboardingCompletedAt")
      .lean<{ onboardingCompletedAt?: Date | null } | null>();

    if (!business?.onboardingCompletedAt) {
      redirect("/onboarding");
    }
  }

  const sessionTimeoutMinutes =
    await getSessionTimeoutMinutesForVerifiedUser(verify);

  // Resolve the effective permission set on the server so the sidebar renders
  // the identical nav during SSR and after hydration. Filtering nav purely
  // from a client-side fetch caused items to flash in then disappear.
  const permissions = Array.from(
    await getEffectiveWorkspacePermissionSet({
      userId: verify.id,
      businessId: verify.businessId,
      platformRole: verify.platformRole,
      workspaceRole: verify.workspaceRole,
    }),
  );

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
        <AppSidebar
          role={verify.role}
          workspaceRole={verify.workspaceRole}
          permissions={permissions}
        />

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
