import { FC } from "react";
import TicketView from "@/features/tickets/view/TicketView";

const Page: FC<{ params: Promise<{ ticketId: string }> }> = async ({
  params,
}) => {
  const { ticketId } = await params;
  return <TicketView ticketId={ticketId} />;
};

export default Page;
