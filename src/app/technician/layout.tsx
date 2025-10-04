import { redirect } from "next/navigation";
import Header from "@/app/shared/components/header/Header";
import Breadcrumbs from "@/app/shared/components/breadcrumbs/BreadCrumbs";
import { layoutConfig } from "@/app/shared/data/data";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "../shared/components/sidebar/AppSidebar";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { AppProvider } from "../shared/contexts/AppContext";
import { ROLES } from "../shared/enums/enums";

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
          <header className="sticky top-0 z-50 p-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-gray-950/90">
            <SidebarTrigger />
            <Header />
          </header>
          <section className="dashboard-body px-4 py-4  ">
            <Breadcrumbs crumbLabelMap={crumbLabelMap} />
            <AppProvider>{children}</AppProvider>
          </section>
        </section>
      </SidebarProvider>
    </section>
  );
}
