"use client";

import { useState } from "react";
import { ShieldBan, ShieldCheck } from "lucide-react";
import RowActionsMenu from "@/shared/components/table/RowActionsMenu";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
import type { WorkspaceListRowDTO } from "../models/workspace-list.model";
import { useUpdateWorkspaceStatus } from "../hooks/use-workspaces";

type ConfirmKey = "activate" | "deactivate";

export default function WorkspaceActions({
  workspace,
}: {
  workspace: WorkspaceListRowDTO;
}) {
  const [confirmKey, setConfirmKey] = useState<ConfirmKey | null>(null);
  const { mutateAsync, isPending } = useUpdateWorkspaceStatus();

  const targetState = confirmKey === "activate";

  return (
    <>
      <RowActionsMenu<never, ConfirmKey>
        ariaLabel={`${workspace.name} actions`}
        confirmActions={[
          workspace.isActive
            ? {
                key: "deactivate",
                label: "Deactivate",
                variant: "destructive",
                icon: ShieldBan,
              }
            : {
                key: "activate",
                label: "Activate",
                icon: ShieldCheck,
              },
        ]}
        onConfirmAction={(key) => setConfirmKey(key)}
      />

      <ActionConfirmDialog
        open={confirmKey !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmKey(null);
        }}
        title={targetState ? "Activate workspace" : "Deactivate workspace"}
        description={
          targetState
            ? `${workspace.name} will be reactivated and members can sign in again.`
            : `${workspace.name} will be marked inactive and members will be blocked from new sign-ins.`
        }
        confirmLabel={
          isPending
            ? targetState
              ? "Activating…"
              : "Deactivating…"
            : targetState
              ? "Activate"
              : "Deactivate"
        }
        variant={targetState ? "default" : "destructive"}
        icon={targetState ? ShieldCheck : ShieldBan}
        isLoading={isPending}
        onConfirm={async () => {
          await mutateAsync({ id: workspace.id, isActive: targetState });
          setConfirmKey(null);
        }}
      />
    </>
  );
}
