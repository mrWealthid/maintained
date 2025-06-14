import { REQUEST_STATUS } from '@/utils/enums';
import { MaintenanceRequest } from '../../model/model';

export type RequestStatus =
	| (typeof REQUEST_STATUS)['pending']
	| (typeof REQUEST_STATUS)['assigned']
	| (typeof REQUEST_STATUS)['declined']
	| (typeof REQUEST_STATUS)['completed'];

export interface MaintenanceRequestFormProps {
	maintenanceRequest?: MaintenanceRequest;
}

export interface MaintenanceRequestForm {
	title: string;
	description: string;
	area: string;
	category: string;
}
