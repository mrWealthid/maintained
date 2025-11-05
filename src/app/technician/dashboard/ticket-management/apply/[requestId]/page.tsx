import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { findData } from "@/utils/apiRequests";
import { FC } from "react";
import ApplyForm from "../../ApplyForm";
import { TechnicianRequest } from "@/features/ticket-feat/model/ticket.model";

const Page: FC<{ params: Promise<{ requestId: string }> }> = async ({
  params,
}) => {
  const { requestId } = await params;
  const response = await findData<TechnicianRequest>(
    API_ROUTES.ticketManagement.fetch_technician_requestDetails,
    requestId
  );

  console.log("Ticket response:", response?.data);

  return <>{response?.data && <ApplyForm ticketRequest={response?.data} />}</>;
};

export default Page;
