import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { findData } from "@/utils/apiRequests";
import { FC } from "react";
import TicketDetails from "@/features/tickets/components/TicketDetails";
import { TicketDetailsResponse } from "@/features/tickets/models/ticket.model";
import Modal from "@/shared/components/modal/Modal";

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
      <Modal>
        <TicketDetails ticket={response?.data} />
      </Modal>
    </>
  );
};

export default Page;
