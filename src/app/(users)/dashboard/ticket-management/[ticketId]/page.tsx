import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { findData } from "@/utils/apiRequests";
import { FC } from "react";
import TicketDetails from "@/features/tickets/components/TicketDetails";
import { TicketDetailsResponse } from "@/features/tickets/models/ticket.model";

const Page: FC<{ params: Promise<{ ticketId: string }> }> = async ({
  params,
}) => {
  const { ticketId } = await params;
  const response = await findData<TicketDetailsResponse>(
    API_ROUTES.ticketManagement.get_tickets,
    ticketId
  );

  return (
    <>
      <TicketDetails ticket={response?.data} />
    </>
  );
};

export default Page;
