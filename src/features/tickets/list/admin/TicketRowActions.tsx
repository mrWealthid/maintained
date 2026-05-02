import React, { FC } from "react";

import { TicketRowActionsProps } from "@/features/tickets/models/ticket.model";

import { TableCell } from "@/components/ui/table";

import { TicketActions } from "@/features/tickets/components/TicketActions";

const TicketRowActions: FC<TicketRowActionsProps> = ({ ticket }) => {
  return (
    <TableCell className="md:px-2 py-2 space-x-3">
      <TicketActions ticket={ticket} />
    </TableCell>
  );
};

export default TicketRowActions;
