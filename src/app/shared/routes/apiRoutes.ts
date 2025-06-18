const base = '/api';
const resourceById = (resource: string) => (id: string) =>
	`${base}/${resource}/${id}`;

export const API_ROUTES = {
	auth: {
		login: `${base}/auth/login`,
		register: `${base}/auth/register`,
		logout: `${base}/auth/logout`,
		onboard: `${base}/auth/onboard`,
		forgot_password: `${base}/auth/forgotPassword`,
		reset_password: `${base}/auth/resetPassword`,
		update_password: `${base}/auth/updatePassword`
	},
	userManagement: {
		get_users: `${base}/users`,
		get_user: `${base}/users/me`,
		invite_user: `${base}/users/invite-user`,
		userById: (id: string) => resourceById('users')(id)
	},
	ticketManagement: {
		get_tickets: `${base}/tickets`,
		ticketById: (id: string) => resourceById('tickets')(id),
		get_categories: `${base}/tickets/categories`,
		create_ticket: `${base}/tickets`
	}
};
