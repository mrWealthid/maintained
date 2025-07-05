import { Ticket } from '@/shared/model/model';
import TicketForm from '@/shared/ticket-feat/form/TicketForm';
import { findData } from '@/utils/apiRequests';
import { FC } from 'react';

const Page: FC<{ params: { ticketId: string } }> = async ({ params }) => {
	const ticketId = params.ticketId;
	const response = await findData<Ticket>(
		'api/maintenance/request',
		ticketId
	);

	return (
		<>
			<TicketForm ticket={response?.data} />
		</>
	);
};

export default Page;
