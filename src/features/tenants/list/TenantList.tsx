"use client";

import type { TableColumn } from "@/shared/components/table/models/table.model";
import Table from "@/shared/components/table/Table";
import { fetchTenantList } from "../services/tenants-service";
import type { TenantListItem } from "../models/tenant-form.model";
import { TENANT_LIST_FILTER_FIELDS } from "../data/list-data";
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
    header: "Property",
    accessor: "property.name",
    filterKey: "property",
    searchType: "TEXT",
    exportValue: (row) => row.property?.name ?? "",
  },
  {
    header: "Unit",
    accessor: "unit.label",
    filterKey: "unit",
    searchType: "TEXT",
    exportValue: (row) => row.unit?.label ?? "",
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
    <Table<TenantListItem>
      queryKey="tenants"
      exportTitle="Tenants"
      service={tenantTableService}
      columns={columns}
      filterFields={TENANT_LIST_FILTER_FIELDS}
      searchKey="name"
      getRowId={(row) => `${row.kind}-${row.id}`}
    >
      <Table.TableHeader />
      <Table.TableRow customRow={true}>
        <TenantRow onView={onView} />
      </Table.TableRow>
    </Table>
  );
}
