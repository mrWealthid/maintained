import { FC } from "react";
import TicketView from "@/features/tickets/view/TicketView";

const Page: FC<{ params: Promise<{ slug: string }> }> = async ({
  params,
}) => {
  const { slug } = await params;
  return <TicketView slug={slug} />;
};

export default Page;
