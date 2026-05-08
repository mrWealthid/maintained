"use client";

import { useRef, useState } from "react";
import type { TableColumn } from "@/shared/components/table/models/table.model";
import Table from "@/shared/components/table/Table";
import BulkAudienceMessageDialog from "@/shared/components/BulkAudienceMessageDialog";
import type { AudienceMessageContent } from "@/shared/model/audience-message.model";
import { fetchTenantList } from "../services/tenants-service";
import type { TenantListItem } from "../models/tenant-form.model";
import { TENANT_LIST_FILTER_FIELDS } from "../data/list-data";
import { useSendBulkTenantMessage } from "../hooks/use-tenants";
import TenantBulkSelectionActions, {
  hasTenantBulkActions,
} from "./TenantBulkSelectionActions";
import TenantRow from "./TenantRow";

type TenantListProps = {
  onView: (tenant: TenantListItem) => void;
};

const columns: TableColumn<TenantListItem>[] = [
  {
    header: "Tenant",
    accessor: "name",
    filterKey: "name",
    searchType: "TEXT",
    colspan: 3,
    exportValue: (row) => `${row.name} <${row.email}>`,
  },
  {
    header: "Email",
    accessor: "email",
    filterKey: "email",
    searchType: "TEXT",
    exportValue: (row) => row.email,
  },
  {
    header: "Property",
    accessor: "property.name",
    filterKey: "property",
    searchType: "TEXT",
    exportValue: (row) =>
      [row.property?.name, row.property?.type].filter(Boolean).join(" - "),
  },
  {
    header: "Unit",
    accessor: "unit.label",
    filterKey: "unit",
    searchType: "TEXT",
    exportValue: (row) => row.unit?.label ?? "",
  },
  {
    header: "Rent / Layout",
    accessor: "unit.monthlyRent.amount",
    exportValue: (row) => {
      const rent = row.unit?.monthlyRent?.amount;
      const currency = row.unit?.monthlyRent?.currency ?? "USD";
      const layout = [
        row.unit?.bedrooms != null ? `${row.unit.bedrooms} bed` : null,
        row.unit?.bathrooms != null ? `${row.unit.bathrooms} bath` : null,
        row.unit?.sizeSqft != null ? `${row.unit.sizeSqft} sqft` : null,
      ].filter(Boolean);

      return [
        rent != null
          ? new Intl.NumberFormat(undefined, {
              style: "currency",
              currency,
              maximumFractionDigits: 0,
            }).format(rent)
          : "",
        layout.join(", "),
      ]
        .filter(Boolean)
        .join(" - ");
    },
  },
  {
    header: "Status",
    accessor: "status",
    filterKey: "status",
    searchType: "DROPDOWN",
    selectOptions: [
      { name: "Active", value: "active" },
      { name: "Pending", value: "pending" },
    ],
    exportValue: (row) => row.status,
  },
  {
    header: "Joined / Invited",
    accessor: "joinedAt",
    sortType: "date",
    exportValue: (row) => row.joinedAt ?? row.invitedAt ?? "",
  },
];

export default function TenantList({ onView }: TenantListProps) {
  const clearSelectionRef = useRef<(() => void) | null>(null);
  const [messageState, setMessageState] = useState<{
    tenantIds: string[];
    recipientEmails: string[];
  } | null>(null);
  const { mutateAsync: sendMessage, isPending: isMessagePending } =
    useSendBulkTenantMessage();

  const tenantTableService = async (params: {
    page: number;
    limit: number;
    search?: Record<string, unknown> | null;
  }) => {
    const response = await fetchTenantList({
      page: params.page,
      limit: params.limit,
      ...(params.search ?? {}),
    });

    return {
      ...response,
      summary: response.summary ?? {},
    };
  };

  return (
    <>
      <Table<TenantListItem>
        queryKey="tenants"
        exportTitle="Tenants"
        service={tenantTableService}
        columns={columns}
        filterFields={TENANT_LIST_FILTER_FIELDS}
        searchKey="name"
        getRowId={(row) => `${row.kind}-${row.id}`}
        enableSelection
        renderSelectionActions={({ selectedRows, clearSelection }) => {
          if (!hasTenantBulkActions(selectedRows)) return null;
          return (
            <TenantBulkSelectionActions
              selectedRows={selectedRows}
              isMessagePending={isMessagePending}
              onMessageClick={(tenantIds, recipientEmails) => {
                clearSelectionRef.current = clearSelection;
                setMessageState({ tenantIds, recipientEmails });
              }}
            />
          );
        }}
        actionable
      >
        <Table.TableHeader />
        <Table.TableRow customRow={true}>
          <TenantRow onView={onView} />
        </Table.TableRow>
      </Table>

      <BulkAudienceMessageDialog
        open={!!messageState}
        onOpenChange={(open) => {
          if (!open) setMessageState(null);
        }}
        title="Message selected tenants"
        description="Send one email to the selected tenant contacts."
        audienceLabel="tenant contacts"
        recipientCount={messageState?.tenantIds.length ?? 0}
        selectedRecipientEmails={messageState?.recipientEmails ?? []}
        isSending={isMessagePending}
        onSubmit={async (values: AudienceMessageContent) => {
          if (!messageState) return;
          await sendMessage({
            ...values,
            tenantIds: messageState.tenantIds,
          });
          clearSelectionRef.current?.();
          setMessageState(null);
        }}
      />
    </>
  );
}
