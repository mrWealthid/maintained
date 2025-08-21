import { ROLES } from '../enums/enums';
import { CrumbLabelMap, Routes } from '../model/model';
import { adminRoutes, routes, technicianRoutes } from '../routes/routes';

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

export const layoutConfig: Record<ROLES.user| ROLES.admin| ROLES.technician, {routes: Routes[],
	crumbLabelMap: CrumbLabelMap
}> = {
	[ROLES.user]: {
		routes: routes,
		crumbLabelMap: crumbLabelMap
	},
	[ROLES.admin]: {
		routes: adminRoutes,
		crumbLabelMap: adminCrumbLabelMap
	},

	[ROLES.technician]: {
		routes: technicianRoutes,
		crumbLabelMap: technicianCrumbLabelMap
	}
};


