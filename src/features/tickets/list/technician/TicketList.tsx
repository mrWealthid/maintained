"use client";
import { TableColumn } from "@/shared/components/table/models/table.model";
import RequestRow from "./TicketRow";
import { TECHNICIAN_RESPONSE } from "@/shared/enums/enums";
import { FC } from "react";
import { fetchRequestTicketList } from "@/features/tickets/services/ticket-service";
import TableComponent from "@/shared/components/table/Table";
import { TechnicianRequest } from "@/features/tickets/models/ticket.model";
import TicketHeaderActions from "./TicketHeaderActions";

const TicketList: FC = () => {
  const columns: TableColumn<TechnicianRequest>[] = [
    {
      header: "Title",
      accessor: "ticket.title",
      filterKey: "title",
      searchType: "TEXT",
      colspan: 3,
      exportValue: (row) => row.ticket?.title ?? "",
    },
    {
      header: "User",
      accessor: "user.name",
      searchType: "TEXT",
      filterKey: "user",
      colspan: 2,
      exportValue: (row) => row.ticket?.user?.name ?? "",
    },
    {
      header: "Category",
      accessor: "ticket.category.name",
      searchType: "TEXT",
      exportValue: (row) =>
        typeof row.ticket?.category === "object"
          ? (row.ticket?.category?.name ?? "")
          : (row.ticket?.category ?? ""),
    },
    {
      header: "Area",
      accessor: "ticket.area",
      searchType: "TEXT",
      exportValue: (row) => row.ticket?.area ?? "",
    },
    {
      header: "Priority",
      accessor: "ticket.priority",
      searchType: "TEXT",
      exportValue: (row) => row.ticket?.priority ?? "",
    },
    {
      header: "Status",
      accessor: "status",
      searchType: "DROPDOWN",
      filterKey: "status",
      selectOptions: [
        { name: "All", value: TECHNICIAN_RESPONSE.all },
        { name: "Pending", value: TECHNICIAN_RESPONSE.pending },
        { name: "Applied", value: TECHNICIAN_RESPONSE.applied },
        { name: "Selected", value: TECHNICIAN_RESPONSE.selected },
        { name: "Inspection Requested", value: TECHNICIAN_RESPONSE.inspection_requested },
        { name: "Declined", value: TECHNICIAN_RESPONSE.declined },
      ],
      exportValue: (row) => row.status ?? "",
    },
    {
      header: "Date",
      accessor: "",
      exportValue: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "",
    },
  ];

  return (
    <>
      <TableComponent<TechnicianRequest>
        service={fetchRequestTicketList}
        queryKey="tickets"
        exportTitle="Technician Requests"
        searchKey="title"
        headerActions={<TicketHeaderActions />}
        columns={columns}
      >
        <TableComponent.TableHeader />
        <TableComponent.TableRow customRow={true}>
          <RequestRow />
        </TableComponent.TableRow>
      </TableComponent>
    </>
  );
};

export default TicketList;
