import { Ticket } from '@/app/shared/model/model';
import TicketForm from '@/app/shared/ticket-feat/form/TicketForm';
import { API_ROUTES } from '@/app/shared/routes/apiRoutes';
import { findData } from '@/utils/apiRequests';
import { FC } from 'react';
import TicketDetails from '@/app/shared/ticket-feat/pages/TicketDetails';
import { ManageTicketDetails, TicketDetailsResponse } from '@/app/shared/ticket-feat/model/ticket.model';

const Page: FC<{ params: { ticketId: string } }> = async ({ params }) => {
	const ticketId = params.ticketId;
	const response = await findData<TicketDetailsResponse>(
		API_ROUTES.ticketManagement.get_tickets,
		ticketId
	);

	console.log('Ticket response:', response?.data);

	return (
		<>
			<TicketDetails ticket={response?.data} />
		</>
	);
};

export default Page;
