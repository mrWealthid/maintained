import { Ticket } from '@/app/shared/model/model';
import TicketForm from '@/app/shared/ticket-feat/form/TicketForm';
import { API_ROUTES } from '@/app/shared/routes/apiRoutes';
import { findData } from '@/utils/apiRequests';
import { FC } from 'react';

const Page: FC<{ params: { ticketId: string } }> = async ({ params }) => {
	const ticketId = params.ticketId;
	const response = await findData<Ticket>(
		API_ROUTES.ticketManagement.get_tickets,
		ticketId
	);

	console.log('Ticket response:', response?.data);

	return (
		<>
			<TicketForm ticket={response?.data} />
		</>
	);
};

export default Page;
