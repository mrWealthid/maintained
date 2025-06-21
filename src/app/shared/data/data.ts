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
