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
	super_admin = 'SUPER_ADMIN',
	user = 'USER',
	tenant = 'TENANT',
	technician = 'TECHNICIAN',
	owner = 'OWNER'
}

export enum TECHNICIAN_RESPONSE {
	pending = 'PENDING',
	applied = 'APPLIED',
	declined = 'DECLINED',
	selected = 'SELECTED',
	inspection_requested = 'INSPECTION_REQUESTED',
	all = 'ALL'
}

export enum TICKET_PRIORITY {
	emergency = 'EMERGENCY',
	low = 'LOW',
	medium = 'MEDIUM',
	high = 'HIGH'
}

export enum TICKET_TYPE {
	repair = 'repair',
	inspection = 'inspection',
	installation = 'installation',
	replacement = 'replacement',
	preventive_maintenance = 'preventive-maintenance',
	emergency = 'emergency'
}

export enum AI_TRIAGE_STATUS {
	notStarted = 'NOT_STARTED',
	pending = 'PENDING',
	processing = 'PROCESSING',
	completed = 'COMPLETED',
	failed = 'FAILED'
}

export enum AI_TRIAGE_SOURCE {
	n8n = 'n8n',
	flowise = 'flowise',
	manual = 'manual',
	system = 'system'
}
