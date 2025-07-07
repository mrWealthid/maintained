import { TECHNICIAN_RESPONSE, TICKET_STATUS } from '@/app/shared/enums/enums';
import { Ticket } from '../../model/model';

export type TicketStatus =
	| TICKET_STATUS.pending
	| TICKET_STATUS.assigned
	| TICKET_STATUS.declined
	| TICKET_STATUS.completed;

export interface ManageTicketFormProps {
	ticket?: Ticket | undefined;
}
export interface DeclineTicketFormProps {
	ticket: Ticket;
	onCloseModal?: () => void;
}
export interface AssignTechnicianFormProps {
	ticket: Ticket;
	onCloseModal?: () => void;
}

export interface AssignTechnicianFormControls {
	assignedTo: string;
}

export interface ManageTicketForm {
	title: string;
	description: string;
	area: string;
	category: string;
	images?: FileList | null;
	videos?: FileList | null;
}

export type TicketRowActionsProps = {
	ticket: Ticket;
};

export type TicketRowProps = {
	data?: Ticket[];
};

export type TicketQueryprops = {
	handleFilter?: (query: { status?: TICKET_STATUS } | null) => void;
};

export type TicketFilterQuery = {
	status?: TICKET_STATUS;
};

export type ListQueryParams<T> = {
	status?: string;
	page?: number;
	limit?: number;
	search?: T;
};
// export type FetchTicketsListParams = {
// 	status?: TICKET_STATUS;
// 	page?: number;
// 	limit?: number;
// 	search?: { [key: string]: any };
// 	// [key: string]: any; // to allow future extension
// };

export interface TicketListFilter {
	title?: string;
	status?: TICKET_STATUS;
	createdAt?: string;
	user?: string;
	area?: string;
	category?: string;
	id?: string;
}

export interface ProcessRequest {
	response: TECHNICIAN_RESPONSE;
	reason?: string;
}
