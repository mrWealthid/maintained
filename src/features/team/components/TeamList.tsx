"use client";

import { useRef, useState } from "react";
import { Ban } from "lucide-react";
import Table from "@/shared/components/table/Table";
import type { TableColumn } from "@/shared/components/table/models/table.model";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
import TeamBulkSelectionActions, {
  hasTeamBulkActions,
} from "./TeamBulkSelectionActions";
import {
  TEAM_LIST_CONFIRM_CONFIG,
  TEAM_LIST_FILTER_FIELDS,
} from "../data/list-data";
import type { TeamListItem, TeamListBulkAction } from "../models/team.model";
import {
  formatTeamRoleSummary,
  formatTeamStatusLabel,
  getTeamMemberLabel,
  getTeamTimelineLabel,
} from "../helpers/list-helper";
import { useBulkTeamAction } from "../hooks/use-team";
import { teamListService } from "../services/team-service";
import TeamHeaderActions from "./TeamHeaderActions";
import TeamRow from "./TeamRow";

const columns: TableColumn<TeamListItem>[] = [
  {
    header: "Member",
    accessor: "name",
    filterKey: "name",
    searchType: "TEXT",
    colspan: 3,
    exportValue: getTeamMemberLabel,
  },
  {
    header: "Email",
    accessor: "email",
    filterKey: "email",
    searchType: "TEXT",
    exportValue: (row) => row.email,
  },
  {
    header: "Role",
    accessor: "role",
    exportValue: (row) => formatTeamRoleSummary(row),
  },
  {
    header: "Status",
    accessor: "status",
    exportValue: (row) => formatTeamStatusLabel(row.status),
  },
  {
    header: "Joined / Invited",
    accessor: "joinedAt",
    exportValue: getTeamTimelineLabel,
  },
];

export default function TeamList({
  inviteAllowed,
}: {
  inviteAllowed: boolean;
}) {
  const { mutateAsync: runBulkAction, isPending: isBulkActionPending } =
    useBulkTeamAction();
  const clearSelectionRef = useRef<(() => void) | null>(null);
  const [confirmState, setConfirmState] = useState<{
    action: TeamListBulkAction;
    memberIds: string[];
  } | null>(null);

  const handleConfirmBulkAction = async () => {
    if (!confirmState) return;
    await runBulkAction(confirmState);
    clearSelectionRef.current?.();
    setConfirmState(null);
  };

  const confirmConfig = confirmState
    ? TEAM_LIST_CONFIRM_CONFIG[confirmState.action]
    : null;

  const teamTableService = async (
    params: Parameters<typeof teamListService>[0],
  ) => {
    const response = await teamListService(params);
    return { ...response, summary: {} };
  };

  return (
    <>
      <Table<TeamListItem>
        queryKey="team"
        exportTitle="Team Management"
        service={teamTableService}
        columns={columns}
        filterFields={TEAM_LIST_FILTER_FIELDS}
        headerActions={<TeamHeaderActions />}
        searchKey="name"
        getRowId={(row) => row.id}
        enableSelection
        renderSelectionActions={({ selectedRows, clearSelection }) => {
          if (!hasTeamBulkActions({ selectedRows, inviteAllowed })) return null;
          return (
            <TeamBulkSelectionActions
              selectedRows={selectedRows}
              clearSelection={clearSelection}
              inviteAllowed={inviteAllowed}
              isBulkActionPending={isBulkActionPending}
              onOpenConfirm={(action, memberIds) => {
                clearSelectionRef.current = clearSelection;
                setConfirmState({ action, memberIds });
              }}
            />
          );
        }}
        actionable
      >
        <Table.TableHeader />
        <Table.TableRow customRow={true}>
          <TeamRow inviteAllowed={inviteAllowed} />
        </Table.TableRow>
      </Table>

      {confirmState ? (
        <ActionConfirmDialog
          open={!!confirmState}
          onOpenChange={(open) => {
            if (!open) setConfirmState(null);
          }}
          title={confirmConfig?.title ?? "Manage selected team members"}
          description={
            confirmConfig?.describe(confirmState.memberIds.length) ??
            "This action will update the selected team records."
          }
          confirmLabel={
            isBulkActionPending
              ? "Working..."
              : (confirmConfig?.confirmLabel ?? "Proceed")
          }
          variant={confirmConfig?.variant ?? "default"}
          icon={confirmConfig?.icon ?? Ban}
          isLoading={isBulkActionPending}
          onConfirm={handleConfirmBulkAction}
        />
      ) : null}
    </>
  );
}
