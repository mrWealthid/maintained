import { CrumbLabelMap } from '../model/model';

export const crumbLabelMap: CrumbLabelMap = {
	dashboard: { label: 'Dashboard' },
	'ticket-management': { label: 'Ticket Management' }
};

export const adminCrumbLabelMap: CrumbLabelMap = {
	admin: { label: '', hide: true },
	dashboard: { label: 'Dashboard' },
	'ticket-management': { label: 'Ticket Management' },
	users: { label: 'Users' }
};
export const technicianCrumbLabelMap: CrumbLabelMap = {
	technician: { label: '', hide: true },
	dashboard: { label: 'Dashboard' },
	'ticket-management': { label: 'Ticket Management' }
};
