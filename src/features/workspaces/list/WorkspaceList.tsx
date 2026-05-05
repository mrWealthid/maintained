"use client";

import { useRef, useState } from "react";
import { ShieldBan, ShieldCheck } from "lucide-react";
import Table from "@/shared/components/table/Table";
import type { TableColumn } from "@/shared/components/table/models/table.model";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
import type { WorkspaceListRowDTO } from "../models/workspace-list.model";
import { workspaceListService } from "../services/workspace-admin.service";
import type { BulkWorkspaceAction } from "../services/workspace-admin.service";
import { useBulkWorkspaceAction } from "../hooks/use-workspaces";
import WorkspaceBulkSelectionActions, {
  hasWorkspaceBulkActions,
} from "../components/WorkspaceBulkSelectionActions";
import WorkspaceRow from "./WorkspaceRow";

const columns: TableColumn<WorkspaceListRowDTO>[] = [
  {
    header: "Name",
    accessor: "name",
    filterKey: "name",
    searchType: "TEXT",
    colspan: 2,
    exportValue: (row) => row.name,
  },
  {
    header: "Contact",
    accessor: "email",
    filterKey: "email",
    searchType: "TEXT",
    colspan: 2,
    exportValue: (row) => row.email ?? "",
  },
  {
    header: "Properties",
    accessor: "propertyCount",
    exportValue: (row) => row.propertyCount,
  },
  {
    header: "Units",
    accessor: "unitCount",
    exportValue: (row) => row.unitCount,
  },
  {
    header: "Members",
    accessor: "memberCount",
    exportValue: (row) => row.memberCount,
  },
  {
    header: "Status",
    accessor: "isActive",
    exportValue: (row) => (row.isActive ? "Active" : "Inactive"),
  },
  {
    header: "Created",
    accessor: "createdAt",
    exportValue: (row) =>
      row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "",
  },
];

export default function WorkspaceList() {
  const { mutateAsync: runBulkAction, isPending: isBulkActionPending } =
    useBulkWorkspaceAction();
  const clearSelectionRef = useRef<(() => void) | null>(null);
  const [confirmState, setConfirmState] = useState<{
    action: BulkWorkspaceAction;
    workspaceIds: string[];
  } | null>(null);

  let confirmConfig: {
    title: string;
    description: string;
    confirmLabel: string;
    variant: "default" | "destructive";
    icon: typeof ShieldCheck | typeof ShieldBan;
  } | null = null;

  if (confirmState) {
    const selectedCount = confirmState.workspaceIds.length;
    const workspaceLabel = `workspace${selectedCount === 1 ? "" : "s"}`;

    if (confirmState.action === "activate") {
      confirmConfig = {
        title: "Activate selected workspaces",
        description: `${selectedCount} selected ${workspaceLabel} will be reactivated and their teams can sign in again.`,
        confirmLabel: isBulkActionPending
          ? "Activating..."
          : "Activate selected",
        variant: "default",
        icon: ShieldCheck,
      };
    } else {
      confirmConfig = {
        title: "Deactivate selected workspaces",
        description: `${selectedCount} selected ${workspaceLabel} will be marked inactive and their teams will be blocked from new sign-ins.`,
        confirmLabel: isBulkActionPending
          ? "Deactivating..."
          : "Deactivate selected",
        variant: "destructive",
        icon: ShieldBan,
      };
    }
  }

  const openConfirm = (action: BulkWorkspaceAction, workspaceIds: string[]) => {
    if (!workspaceIds.length) return;
    setConfirmState({ action, workspaceIds });
  };

  const handleConfirmBulkAction = async () => {
    if (!confirmState) return;
    await runBulkAction({
      action: confirmState.action,
      workspaceIds: confirmState.workspaceIds,
    });
    clearSelectionRef.current?.();
    setConfirmState(null);
  };

  return (
    <>
      <Table<WorkspaceListRowDTO>
        queryKey="workspaces"
        exportTitle="Workspaces"
        service={workspaceListService}
        columns={columns}
        searchKey="name"
        enableSelection
        getRowId={(row) => row.id}
        renderSelectionActions={({ selectedRows, clearSelection }) => {
          if (!hasWorkspaceBulkActions(selectedRows)) return null;
          clearSelectionRef.current = clearSelection;
          return (
            <WorkspaceBulkSelectionActions
              selectedRows={selectedRows}
              clearSelection={clearSelection}
              isBulkActionPending={isBulkActionPending}
              onOpenConfirm={openConfirm}
            />
          );
        }}
        actionable
      >
        <Table.TableHeader />
        <Table.TableRow customRow={true}>
          <WorkspaceRow />
        </Table.TableRow>
      </Table>

      {confirmState && confirmConfig ? (
        <ActionConfirmDialog
          open={Boolean(confirmState)}
          onOpenChange={(open) => {
            if (!open) setConfirmState(null);
          }}
          title={confirmConfig.title}
          description={confirmConfig.description}
          confirmLabel={confirmConfig.confirmLabel}
          variant={confirmConfig.variant}
          icon={confirmConfig.icon}
          isLoading={isBulkActionPending}
          onConfirm={handleConfirmBulkAction}
        />
      ) : null}
    </>
  );
}
