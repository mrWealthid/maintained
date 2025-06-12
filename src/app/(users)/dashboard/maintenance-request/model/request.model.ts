import { REQUEST_STATUS } from '@/utils/enums';
export interface Category {
	id: number;
	name: string;
	description?: string;
	createdAt?: Date;
}

export type RequestStatus =
	| (typeof REQUEST_STATUS)['pending']
	| (typeof REQUEST_STATUS)['assigned']
	| (typeof REQUEST_STATUS)['declined']
	| (typeof REQUEST_STATUS)['completed'];
