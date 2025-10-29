import { redirect } from "next/navigation";
import Breadcrumbs from "@/app/shared/components/breadcrumbs/BreadCrumbs";
import { layoutConfig } from "@/app/shared/data/data";
import AppSidebar from "../shared/components/sidebar/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ROLES } from "../shared/enums/enums";
import { AppShell } from "../shared/shells/AppShell";
import { HeaderBar } from "../shared/components/header/Headerbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const verify = await getVerifiedUser();

  if (!verify) {
    redirect("/auth/login");
  }

  const { routes, crumbLabelMap } = layoutConfig[ROLES.technician];

  return (
    <section className=" h-dvh flex">
      <SidebarProvider>
        <AppSidebar routes={routes} />
        <section className="flex flex-col overflow-x-hidden w-full">
          <HeaderBar />
          <section className="dashboard-body px-4 py-4  ">
            <Breadcrumbs crumbLabelMap={crumbLabelMap} />
            <AppShell>{children}</AppShell>
          </section>
        </section>
      </SidebarProvider>
    </section>
  );
}
