"use client";

import { ShieldBan, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WorkspaceListRowDTO } from "../models/workspace-list.model";
import type { BulkWorkspaceAction } from "../services/workspace-admin.service";

export function hasWorkspaceBulkActions(rows: WorkspaceListRowDTO[]) {
  return rows.length > 0;
}

export default function WorkspaceBulkSelectionActions({
  selectedRows,
  clearSelection,
  isBulkActionPending,
  onOpenConfirm,
}: {
  selectedRows: WorkspaceListRowDTO[];
  clearSelection: () => void;
  isBulkActionPending: boolean;
  onOpenConfirm: (action: BulkWorkspaceAction, workspaceIds: string[]) => void;
}) {
  void clearSelection;
  const ids = selectedRows.map((r) => r.id);
  const allActive = selectedRows.every((r) => r.isActive);
  const allInactive = selectedRows.every((r) => !r.isActive);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">
        {selectedRows.length} selected
      </span>
      {!allActive ? (
        <Button
          size="sm"
          variant="outline"
          disabled={isBulkActionPending}
          onClick={() => onOpenConfirm("activate", ids)}
        >
          <ShieldCheck className="mr-1.5 size-3.5" />
          Activate
        </Button>
      ) : null}
      {!allInactive ? (
        <Button
          size="sm"
          variant="destructive"
          disabled={isBulkActionPending}
          onClick={() => onOpenConfirm("deactivate", ids)}
        >
          <ShieldBan className="mr-1.5 size-3.5" />
          Deactivate
        </Button>
      ) : null}
    </div>
  );
}
