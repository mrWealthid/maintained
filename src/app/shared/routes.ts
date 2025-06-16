import { RiHomeLine, RiUserReceivedLine } from 'react-icons/ri';
import { CiSettings, CiUser } from 'react-icons/ci';
import { Routes } from './model/model';

export const routes: Routes[] = [
	{ name: 'Overview', path: '/dashboard', icon: RiHomeLine },
	{
		name: 'Requests',
		path: '/dashboard/maintenance-request',
		icon: RiUserReceivedLine
	},

	{ name: 'Chat', path: '/dashboard/guests', icon: CiUser },
	{ name: 'Settings', path: '/dashboard/settings', icon: CiSettings }
];

export const adminRoutes: Routes[] = [
	{ name: 'Overview', path: '/admin/dashboard', icon: RiHomeLine },
	{
		name: 'Requests',
		path: '/admin/dashboard/maintenance-request',
		icon: RiUserReceivedLine
	},
	// {
	// 	name: 'Cabins',
	// 	path: '/dashboard/cabins',
	// 	icon: MdOutlineAirlineSeatIndividualSuite
	// },
	{
		name: 'User Management',
		path: '/admin/dashboard/users',
		icon: CiUser
	},
	{ name: 'Chat', path: '/dashboard/guests', icon: CiUser },
	{ name: 'Settings', path: '/dashboard/settings', icon: CiSettings }
];
