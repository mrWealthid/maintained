import { TableColumn } from "@/shared/components/table/models/table.model";
import RequestRow from "./TicketRow";
import { TICKET_STATUS } from "@/shared/enums/enums";
import React, { FC } from "react";
import { fetchTicketList } from "@/features/tickets/services/ticket-service";
import Table from "@/shared/components/table/Table";
import { Ticket } from "@/shared/model/model";
import TicketHeaderActions from "./TicketHeaderActions";
import TableComponent from "@/shared/components/table/Table";

const TicketList: FC = () => {
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
      selectOptions: [
        { name: "Pending", value: TICKET_STATUS.pending },
        { name: "Assigned", value: TICKET_STATUS.assigned },
        { name: "Completed", value: TICKET_STATUS.completed },
        { name: "Declined", value: TICKET_STATUS.declined },
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
      <TableComponent<Ticket>
        service={fetchTicketList}
        queryKey="tickets"
        exportTitle="Tickets"
        searchKey="title"
        defaultParams={{ status: TICKET_STATUS.pending }}
        headerActions={<TicketHeaderActions />}
        columns={columns}
      >
        <Table.TableHeader />
        <Table.TableRow customRow={true}>
          <RequestRow />
        </Table.TableRow>
      </TableComponent>
    </>
  );
};

export default React.memo(TicketList);
