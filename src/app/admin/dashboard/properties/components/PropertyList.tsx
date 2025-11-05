import { TableColumn } from "@/shared/components/table/models/table.model";
import PropertyRow from "./PropertyRow";
import { FC } from "react";
import { fetchPropertyList } from "@/features/property-feat/service/property-service";
import Table from "@/shared/components/table/Table";
import { Property } from "@/features/property-feat/service/property-service";
import PropertyHeaderActions from "./PropertyHeaderActions";

const PropertyList: FC = () => {
  const columns: TableColumn[] = [
    {
      header: "Property Name",
      accessor: "name",
      filterKey: "name",
      searchType: "TEXT",
      colspan: 3,
    },
    {
      header: "Type",
      accessor: "type",
      searchType: "TEXT",
      filterKey: "type",
      colspan: 2,
    },
    {
      header: "Address",
      accessor: "address.line1",
      searchType: "TEXT",
      filterKey: "address",
    },
    {
      header: "City",
      accessor: "address.city",
      searchType: "TEXT",
      filterKey: "city",
    },
    {
      header: "State",
      accessor: "address.state",
      searchType: "TEXT",
      filterKey: "state",
    },
    {
      header: "Created",
      accessor: "createdAt",
      searchType: "TEXT",
    },
  ];

  return (
    <>
      <Table<Property>
        service={fetchPropertyList}
        queryKey="properties"
        searchKey="name"
        headerActions={<PropertyHeaderActions />}
        columns={columns}
      >
        <Table.TableHeader />
        <Table.TableRow customRow={true}>
          <PropertyRow />
        </Table.TableRow>
      </Table>
    </>
  );
};

export default PropertyList;
