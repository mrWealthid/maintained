import { Routes } from '@/app/shared/model/model';

export interface SidebarProps {
	routes: Routes[];
}

export enum SidebarPosition {
	right = 'right',
	left = 'left'
}
