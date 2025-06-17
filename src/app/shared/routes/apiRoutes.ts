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
		userById: resourceById('users')
	},
	ticketManagement: {
		get_tickets: `${base}/tickets`,
		ticketById: resourceById('tickets'),
		get_categories: `${base}/categories`,
		create_ticket: `${base}/tickets`
	}
};
