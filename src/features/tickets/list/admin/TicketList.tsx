"use client";
import React, { FC, useState, type ComponentType } from "react";
import { Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableColumn } from "@/shared/components/table/models/table.model";
import RequestRow from "./TicketRow";
import { TICKET_STATUS } from "@/shared/enums/enums";
import { fetchTicketList } from "@/features/tickets/services/ticket-service";
import Table from "@/shared/components/table/Table";
import { Ticket } from "@/shared/model/model";
import TicketHeaderActions from "./TicketHeaderActions";
import TableComponent from "@/shared/components/table/Table";
import {
  TICKET_LIST_FILTER_FIELDS,
  TICKET_STATUS_FILTER_SELECT_OPTIONS,
} from "@/features/tickets/data/list-data";
import type { BulkTicketAction } from "@/features/tickets/services/ticket-service";
import { useBulkTicketAction } from "@/features/tickets/hooks/ticketHooks";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
import type { SelectionActionRenderArgs } from "@/shared/model/action-confirm.model";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";

type ConfirmConfigItem = {
  title: string;
  describe: (count: number) => string;
  confirmLabel: string;
  variant?: "default" | "destructive";
  icon: ComponentType<{ className?: string }>;
};

const BULK_CONFIRM_CONFIG: Record<BulkTicketAction, ConfirmConfigItem> = {
  delete: {
    title: "Delete Tickets",
    describe: (n) =>
      `${n} ticket${n === 1 ? "" : "s"} will be permanently removed.`,
    confirmLabel: "Delete",
    variant: "destructive",
    icon: Trash2,
  },
  decline: {
    title: "Decline Tickets",
    describe: (n) => `${n} ticket${n === 1 ? "" : "s"} will be declined.`,
    confirmLabel: "Decline",
    variant: "destructive",
    icon: XCircle,
  },
};

const TicketList: FC = () => {
  const { mutateAsync: runBulk, isPending: isBulkPending } =
    useBulkTicketAction();

  const [confirmState, setConfirmState] = useState<{
    action: BulkTicketAction;
    ticketIds: string[];
    clearSelection: () => void;
  } | null>(null);

  const canDeleteTicket = useHasPermission(PERMISSION.TICKETS_DELETE);
  const canManageTicketStatus = useHasPermission(
    PERMISSION.TICKETS_STATUS_MANAGE,
  );

  const openConfirm = (
    action: BulkTicketAction,
    ticketIds: string[],
    clearSelection: () => void,
  ) => {
    if (!ticketIds.length) return;
    setConfirmState({ action, ticketIds, clearSelection });
  };

  const handleConfirmBulkAction = async () => {
    if (!confirmState) return;
    await runBulk({
      action: confirmState.action,
      ticketIds: confirmState.ticketIds,
    });
    confirmState.clearSelection();
    setConfirmState(null);
  };

  const activeConfig = confirmState
    ? BULK_CONFIRM_CONFIG[confirmState.action]
    : null;

  const renderBulkSelectionActions = ({
    selectedRows,
    clearSelection,
  }: SelectionActionRenderArgs<Ticket>) => {
    const ids = Array.from(
      new Set(
        selectedRows
          .map((row) => (row as { id?: string; _id?: string }).id ?? (row as { _id?: string })._id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    if (ids.length === 0) return null;

    type ActionEntry = {
      key: BulkTicketAction;
      label: string;
      icon: ComponentType<{ className?: string }>;
      variant?: "outline" | "destructive";
      enabled: boolean;
    };

    const actions: ActionEntry[] = [
      {
        key: "decline",
        label: "Decline",
        icon: XCircle,
        variant: "outline",
        enabled: canManageTicketStatus,
      },
      {
        key: "delete",
        label: "Delete",
        icon: Trash2,
        variant: "destructive",
        enabled: canDeleteTicket,
      },
    ];

    return (
      <>
        {actions
          .filter((a) => a.enabled)
          .map((action) => (
            <Button
              key={action.key}
              type="button"
              size="sm"
              variant={action.variant === "destructive" ? "destructive" : "outline"}
              disabled={isBulkPending}
              onClick={() => openConfirm(action.key, ids, clearSelection)}
              className="gap-1"
            >
              <action.icon className="size-3.5" />
              {action.label}
            </Button>
          ))}
      </>
    );
  };

  const columns: TableColumn<Ticket>[] = [
    {
      header: "Title",
      accessor: "title",
      filterKey: "title",
      searchType: "TEXT",
      colspan: 3,
      exportValue: (row) => row.title,
    },
    {
      header: "User",
      accessor: "user.name",
      searchType: "TEXT",
      filterKey: "user",
      colspan: 2,
      exportValue: (row) => row.user?.name ?? "",
    },
    {
      header: "Category",
      accessor: "category.name",
      searchType: "TEXT",
      exportValue: (row) =>
        typeof row.category === "object"
          ? (row.category?.name ?? "")
          : (row.category ?? ""),
    },
    {
      header: "Area",
      accessor: "area",
      searchType: "TEXT",
      exportValue: (row) => row.area ?? "",
    },
    {
      header: "Actioned By",
      accessor: "actionedBy.name",
      searchType: "TEXT",
      exportValue: (row) => row.actionedBy?.name ?? "",
    },
    {
      header: "Status",
      accessor: "status",
      searchType: "DROPDOWN",
      filterKey: "status",
      selectOptions: TICKET_STATUS_FILTER_SELECT_OPTIONS,
      exportValue: (row) => row.status ?? "",
    },
    {
      header: "Date",
      accessor: "",
      exportValue: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "",
    },
  ];

  const enableSelection = canDeleteTicket || canManageTicketStatus;

  return (
    <>
      <TableComponent<Ticket>
        service={fetchTicketList}
        queryKey="tickets"
        exportTitle="Tickets"
        searchKey="title"
        headerActions={<TicketHeaderActions />}
        filterFields={TICKET_LIST_FILTER_FIELDS}
        enableSelection={enableSelection}
        renderSelectionActions={renderBulkSelectionActions}
        columns={columns}
      >
        <Table.TableHeader />
        <Table.TableRow customRow={true}>
          <RequestRow />
        </Table.TableRow>
      </TableComponent>

      {confirmState && activeConfig ? (
        <ActionConfirmDialog
          open={!!confirmState}
          onOpenChange={(open) => {
            if (!open) setConfirmState(null);
          }}
          title={activeConfig.title}
          description={activeConfig.describe(confirmState.ticketIds.length)}
          confirmLabel={
            isBulkPending ? "Working..." : activeConfig.confirmLabel
          }
          variant={activeConfig.variant}
          icon={activeConfig.icon}
          isLoading={isBulkPending}
          onConfirm={handleConfirmBulkAction}
        />
      ) : null}
    </>
  );
};

export default React.memo(TicketList);
