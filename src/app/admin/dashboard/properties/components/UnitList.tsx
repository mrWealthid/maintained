import { TableColumn } from "@/shared/components/old-table/models/table.model";
import UnitRow from "./UnitRow";
import { FC } from "react";
import { fetchUnitList } from "@/features/property-feat/service/unit-service";
import Table from "@/shared/components/old-table/Table";
import { Unit } from "@/features/property-feat/service/unit-service";
import UnitHeaderActions from "./UnitHeaderActions";

const UnitList: FC = () => {
  const columns: TableColumn[] = [
    {
      header: "Unit Label",
      accessor: "label",
      filterKey: "label",
      searchType: "TEXT",
      colspan: 2,
    },
    {
      header: "Property",
      accessor: "property.name",
      searchType: "TEXT",
      filterKey: "property",
      colspan: 2,
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
    },
    {
      header: "Tenant",
      accessor: "tenantUser.name",
      searchType: "TEXT",
      filterKey: "tenant",
    },
    {
      header: "Created",
      accessor: "createdAt",
      searchType: "TEXT",
    },
  ];

  return (
    <>
      <Table<Unit>
        service={fetchUnitList}
        queryKey="units"
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
