import { Ticket } from '@/app/shared/model/model';
import TicketForm from '@/app/shared/ticket-feat/form/TicketForm';
import { findData } from '@/utils/apiRequests';
import { FC } from 'react';

const Page: FC<{ params: Promise<{ ticketId: string }> }> = async ({
	params
}) => {
	const { ticketId } = await params;
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
