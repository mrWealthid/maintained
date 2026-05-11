import AppPageHeader from "@/shared/components/app-header/AppPageHeader";
import WorkspaceList from "@/features/workspaces/list/WorkspaceList";
import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { PERMISSION } from "@/shared/auth/permission-registry";

export default async function WorkspacesPage() {
  await requireDashboardAccess({
    requiredPermission: PERMISSION.PLATFORM_WORKSPACES_VIEW,
  });

  return (
    <div className="flex flex-col gap-3">
      <AppPageHeader
        title="Workspaces"
        description="Browse, audit, and manage every business workspace on the platform."
      />
      <WorkspaceList />
    </div>
  );
}
