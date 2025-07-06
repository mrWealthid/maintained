export enum TICKET_STATUS {
	pending = 'PENDING',
	assigned = 'ASSIGNED',
	pending_assignment = 'PENDING_ASSIGNMENT',
	processing = 'PROCESSING',
	scheduled = 'SCHEDULED',
	declined = 'DECLINED',
	completed = 'COMPLETED',
	all = 'ALL'
}
export enum INVITE_STATUS {
	invited = 'INVITED',
	activated = 'ACTIVATED',
	declined = 'DECLINED',
	all = 'ALL'
}
export enum ROLES {
	admin = 'ADMIN',
	user = 'USER',
	technician = 'TECHNICIAN',
	owner = 'OWNER'
}

export enum TECHNICIAN_RESPONSE {
	accepted = 'ACCEPTED',
	declined = 'DECLINED',
	inspection_requested = 'INSPECTION_REQUESTED'
}
