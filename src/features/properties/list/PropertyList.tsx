import { TableColumn } from "@/shared/components/table/models/table.model";
import PropertyRow from "./PropertyRow";
import { FC } from "react";
import { fetchPropertyList } from "@/features/properties/services/property-service";
import Table from "@/shared/components/table/Table";
import { Property } from "@/features/properties/services/property-service";
import PropertyHeaderActions from "./PropertyHeaderActions";

const PropertyList: FC = () => {
  const columns: TableColumn<Property>[] = [
    {
      header: "Property Name",
      accessor: "name",
      filterKey: "name",
      searchType: "TEXT",
      colspan: 3,
      exportValue: (row) => row.name ?? "",
    },
    {
      header: "Type",
      accessor: "type",
      searchType: "TEXT",
      filterKey: "type",
      colspan: 2,
      exportValue: (row) => row.type ?? "",
    },
    {
      header: "Address",
      accessor: "address.line1",
      searchType: "TEXT",
      filterKey: "address",
      exportValue: (row) => row.address?.line1 ?? "",
    },
    {
      header: "City",
      accessor: "address.city",
      searchType: "TEXT",
      filterKey: "city",
      exportValue: (row) => row.address?.city ?? "",
    },
    {
      header: "State",
      accessor: "address.state",
      searchType: "TEXT",
      filterKey: "state",
      exportValue: (row) => row.address?.state ?? "",
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
      <Table<Property>
        service={fetchPropertyList}
        queryKey="properties"
        exportTitle="Properties"
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
