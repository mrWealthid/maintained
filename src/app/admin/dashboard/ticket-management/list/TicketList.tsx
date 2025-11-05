import { TableColumn } from "@/shared/components/table/models/table.model";
import RequestRow from "./TicketRow";
import { TICKET_STATUS } from "@/shared/enums/enums";
import React, { FC } from "react";
import { fetchTicketList } from "@/features/ticket-feat/service/ticket-service";
import Table from "@/shared/components/table/Table";
import { Ticket } from "@/shared/model/model";
import TicketHeaderActions from "./TicketHeaderActions";
import TableComponent from "@/shared/components/table/Table";

const TicketList: FC = () => {
  const columns: TableColumn[] = [
    {
      header: "Title",
      accessor: "title",
      filterKey: "title",
      searchType: "TEXT",
      colspan: 3,
    },
    {
      header: "user",
      accessor: "user.name",
      searchType: "TEXT",
      filterKey: "user",
      colspan: 2,
    },
    { header: "category", accessor: "category.name", searchType: "TEXT" },
    { header: "area", accessor: "area", searchType: "TEXT" },
    {
      header: "actionedBy",
      accessor: "actionedBy.name",
      searchType: "TEXT",
    },
    {
      header: "status",
      accessor: "status",
      searchType: "DROPDOWN",
      filterKey: "status",
      selectOptions: [
        { name: "Pending", value: TICKET_STATUS.pending },
        { name: "Assigned", value: TICKET_STATUS.assigned },
        { name: "Completed", value: TICKET_STATUS.completed },
        { name: "Declined", value: TICKET_STATUS.declined },
      ],
    },

    {
      header: "Date",
      accessor: "",
    },
  ];

  return (
    <>
      <TableComponent<Ticket>
        service={fetchTicketList}
        queryKey="tickets"
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
