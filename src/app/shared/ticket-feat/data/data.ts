import { TICKET_STATUS } from '@/app/shared/enums/enums';

export const ticketListFilter = [
	{
		label: 'All',
		value: TICKET_STATUS.all
	},
	{
		label: 'Pending',
		value: TICKET_STATUS.pending
	},
	{
		label: 'Processing',
		value: TICKET_STATUS.processing
	},
	{
		label: 'Pending Assigment',
		value: TICKET_STATUS.pending_assignment
	},
	{
		label: 'Assigned',
		value: TICKET_STATUS.assigned
	},
	{
		label: 'Scheduled',
		value: TICKET_STATUS.scheduled
	},
	{
		label: 'Declined',
		value: TICKET_STATUS.declined
	},
	{
		label: 'Completed',
		value: TICKET_STATUS.completed
	}
];
