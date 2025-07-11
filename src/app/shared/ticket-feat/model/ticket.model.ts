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
	ticketRequest: TechnicianRequest;
	onCloseModal?: () => void;
}
export interface ApplyTicketFormProps {
	ticketRequest: TechnicianRequest;
	onCloseModal?: () => void;
}
export interface AssignTechnicianFormProps {
	ticket: Ticket;
	onCloseModal?: () => void;
}
export interface SendTechnicianRequestFormProps {
	ticket: Ticket;
	onCloseModal?: () => void;
}

export interface AssignTechnicianFormControls {
	assignedTo: string;
}
export interface ApplyTechnicianFormControls {
	quote?: { amount: number; currency: string };
	message?: string;
	addSchedule: boolean;
	schedule?: {
		date?: Date | undefined;
		startTime?: string;
		endTime?: string;
		day?: string;
	};
}

export interface SendTechnicianRequestFormControls {
	technicianIds: string[];
	expiresAt: Date;
}

export interface ManageTicketForm {
	title: string;
	description: string;
	area: string;
	category: string;
	images?: FileList | null;
	videos?: FileList | null;
	type: string;
}

export type TechnicianRequest = {
	quote: {
		amount: number;
		currency: string;
	};
	_id: string;
	ticket: Ticket;
	status: TECHNICIAN_RESPONSE;
	createdAt: string;
	schedule: {
		start: string;
		end: string;
		day: string;
		date: string;
	};
	message: string;
};

export type TicketRowActionsProps = {
	ticket: Ticket;
};
export type TechnicianRowActionsProps = {
	technicianRequest: TechnicianRequest;
};

export type TicketRowProps = {
	data?: Ticket[];
};

export type TechnicianTicketRowProps = {
	data?: TechnicianRequest[];
};

export type TicketQueryprops<T = TICKET_STATUS> = {
	handleFilter?: (query: { status?: T } | null) => void;
};

export type TicketFilterQuery<T = TICKET_STATUS> = {
	status?: T;
};
// export type TechnicianTicketFilterQuery = {
// 	status?: TECHNICIAN_RESPONSE;
// };

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
	reason?: string;
	status: TECHNICIAN_RESPONSE;
	quote?: {
		amount?: number;
		currency?: string;
	};
	schedule?: {
		start: string;
		end: string;
		day: string;
	};
	message?: string;
}

export interface SendTechnicianRequestPayload {
	technicianIds: string[];
	expiresAt: Date;
}
