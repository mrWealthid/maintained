import { TableColumn } from "@/shared/components/table/models/table.model";
import UnitRow from "./UnitRow";
import { FC } from "react";
import { fetchUnitList } from "@/features/units/services/unit-service";
import Table from "@/shared/components/table/Table";
import { Unit } from "@/features/units/services/unit-service";
import UnitHeaderActions from "./UnitHeaderActions";

const UnitList: FC = () => {
  const columns: TableColumn<Unit>[] = [
    {
      header: "Unit Label",
      accessor: "label",
      filterKey: "label",
      searchType: "TEXT",
      colspan: 2,
      exportValue: (row) => row.label ?? "",
    },
    {
      header: "Property",
      accessor: "property.name",
      searchType: "TEXT",
      filterKey: "property",
      colspan: 2,
      exportValue: (row) => row.property?.name ?? "",
    },
    {
      header: "Status",
      accessor: "tenantActive",
      searchType: "DROPDOWN",
      filterKey: "status",
      selectOptions: [
        { name: "Occupied", value: "true" },
        { name: "Vacant", value: "false" },
      ],
      exportValue: (row) => (row.tenantActive ? "Occupied" : "Vacant"),
    },
    {
      header: "Tenant",
      accessor: "tenantUser.name",
      searchType: "TEXT",
      filterKey: "tenant",
      exportValue: (row) => row.tenantUser?.name ?? "",
    },
    {
      header: "Created",
      accessor: "createdAt",
      searchType: "TEXT",
      exportValue: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "",
    },
  ];

  return (
    <>
      <Table<Unit>
        service={fetchUnitList}
        queryKey="units"
        exportTitle="Units"
        searchKey="label"
        headerActions={<UnitHeaderActions />}
        columns={columns}
      >
        <Table.TableHeader />
        <Table.TableRow customRow={true}>
          <UnitRow />
        </Table.TableRow>
      </Table>
    </>
  );
};

export default UnitList;
