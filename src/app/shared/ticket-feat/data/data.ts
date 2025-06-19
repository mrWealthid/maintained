import { TICKET_STATUS } from '@/utils/enums';

export const tabData = [
	{
		label: 'All',
		value: TICKET_STATUS.all
	},
	{
		label: 'Pending',
		value: TICKET_STATUS.pending
	},
	{
		label: 'Assigned',
		value: TICKET_STATUS.assigned
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
