import { API_ROUTES } from "@/app/shared/routes/apiRoutes";
import { findData } from "@/utils/apiRequests";
import { FC } from "react";
import TicketDetails from "@/app/shared/features/ticket-feat/pages/TicketDetails";
import { TicketDetailsResponse } from "@/app/shared/features/ticket-feat/model/ticket.model";

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
