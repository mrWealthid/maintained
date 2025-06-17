import { RiHomeLine, RiUserReceivedLine } from 'react-icons/ri';
import { CiSettings, CiUser } from 'react-icons/ci';
import { Routes } from '../model/model';

const ROUTES_DEFINITION = {
	DASHBOARD: {
		OVERVIEW: '/dashboard',
		TICKETS: '/dashboard/tickets',
		CHAT: '/dashboard/chat'
	}
};

const ADMIN_ROUTES_DEFINITION = {
	DASHBOARD: {
		OVERVIEW: '/admin/dashboard',
		TICKETS: '/admin/dashboard/tickets',
		CHAT: '/admin/dashboard/chat',
		USERS: '/admin/dashboard/users',
		SETTINGS: '/admin/dashboard/settings'
	}
};

export const routes: Routes[] = [
	{
		name: 'Overview',
		path: ROUTES_DEFINITION.DASHBOARD.OVERVIEW,
		icon: RiHomeLine
	},
	{
		name: 'Tickets',
		path: ROUTES_DEFINITION.DASHBOARD.TICKETS,
		icon: RiUserReceivedLine
	},

	{ name: 'Chat', path: ROUTES_DEFINITION.DASHBOARD.CHAT, icon: CiUser }
];

export const adminRoutes: Routes[] = [
	{
		name: 'Overview',
		path: ADMIN_ROUTES_DEFINITION.DASHBOARD.OVERVIEW,
		icon: RiHomeLine
	},
	{
		name: 'Tickets',
		path: ADMIN_ROUTES_DEFINITION.DASHBOARD.TICKETS,
		icon: RiUserReceivedLine
	},

	{
		name: 'User Management',
		path: ADMIN_ROUTES_DEFINITION.DASHBOARD.USERS,
		icon: CiUser
	},
	{
		name: 'Chat',
		path: ADMIN_ROUTES_DEFINITION.DASHBOARD.CHAT,
		icon: CiUser
	},
	{
		name: 'Settings',
		path: ADMIN_ROUTES_DEFINITION.DASHBOARD.SETTINGS,
		icon: CiSettings
	}
];
