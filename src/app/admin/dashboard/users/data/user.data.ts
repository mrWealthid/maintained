import { INVITE_STATUS } from '@/shared/enums/enums';

export const userListFilter = [
	{
		label: 'All',
		value: INVITE_STATUS.all
	},
	{
		label: 'Invited',
		value: INVITE_STATUS.invited
	},
	{
		label: 'Activated',
		value: INVITE_STATUS.activated
	},
	{
		label: 'Declined',
		value: INVITE_STATUS.declined
	}
];
