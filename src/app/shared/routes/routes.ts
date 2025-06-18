'use client';
import { RiHomeLine } from 'react-icons/ri';
import { CiSettings, CiUser } from 'react-icons/ci';
import { Routes } from '../model/model';
import { GrVmMaintenance } from 'react-icons/gr';
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';

export const ROUTES_DEFINITION = {
	DASHBOARD: {
		OVERVIEW: '/dashboard',
		TICKETS: '/dashboard/ticket-management',
		MANAGE_TICKET: '/dashboard/ticket-management/manage',
		CHAT: '/dashboard/chat'
	}
};

export const ADMIN_ROUTES_DEFINITION = {
	DASHBOARD: {
		OVERVIEW: '/admin/dashboard',
		TICKETS: '/admin/dashboard/ticket-management',
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
		icon: GrVmMaintenance
	},

	{
		name: 'Chat',
		path: ROUTES_DEFINITION.DASHBOARD.CHAT,
		icon: HiOutlineChatBubbleLeftRight
	}
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
		icon: GrVmMaintenance
	},

	{
		name: 'User Management',
		path: ADMIN_ROUTES_DEFINITION.DASHBOARD.USERS,
		icon: CiUser
	},
	{
		name: 'Chat',
		path: ADMIN_ROUTES_DEFINITION.DASHBOARD.CHAT,
		icon: HiOutlineChatBubbleLeftRight
	},
	{
		name: 'Settings',
		path: ADMIN_ROUTES_DEFINITION.DASHBOARD.SETTINGS,
		icon: CiSettings
	}
];
