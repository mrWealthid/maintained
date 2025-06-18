import { TICKET_STATUS } from '@/utils/enums';
import { Ticket } from '../../model/model';

export type TicketStatus =
	| TICKET_STATUS.pending
	| TICKET_STATUS.assigned
	| TICKET_STATUS.declined
	| TICKET_STATUS.completed;

export interface ManageTicketFormProps {
	ticket?: Ticket | undefined;
}

export interface ManageTicketForm {
	title: string;
	description: string;
	area: string;
	category: string;
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
