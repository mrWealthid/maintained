import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { findData } from "@/utils/apiRequests";
import { FC } from "react";
import TicketDetails from "@/features/ticket-feat/pages/TicketDetails";
import { TicketDetailsResponse } from "@/features/ticket-feat/model/ticket.model";

const Page: FC<{ params: Promise<{ ticketId: string }> }> = async ({
  params,
}) => {
  const { ticketId } = await params;
  const response = await findData<TicketDetailsResponse>(
    API_ROUTES.ticketManagement.get_tickets,
    ticketId
  );

  console.log("Ticket response:", response?.data);

  return (
    <>
      <TicketDetails ticket={response?.data} />
    </>
  );
};

export default Page;
