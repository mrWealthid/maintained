import { INVITE_STATUS } from '@/utils/enums';

export interface UserListFilter {
	title?: string;
	status?: INVITE_STATUS;
	createdAt?: string;
	user?: string;
	area?: string;
	category: string;
	id?: string;
}
