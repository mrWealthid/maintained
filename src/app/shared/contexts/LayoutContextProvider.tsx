'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useProfile } from '../components/profile/hooks/useProfile';
import { User } from '../model/model';
import { useResponsiveSidebarMargin } from '../hooks/useResponsiveMargin';

interface LayoutContextType {
	width: number;
	updateWidth: (width: number) => void;
	updateIsCollapsed: (val: boolean) => void;
	data: User | undefined;
	isLoading: boolean;
	isCollapsed: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({
	children
}) => {
	const [width, setWidth] = useState(256);
	const [isCollapsed, setIsCollapsed] = useState(false);

	const { data, isLoading, error } = useProfile<User>();

	function updateWidth(width: number) {
		setWidth(width);
	}
	// function updateIsCollapsed(val: boolean) {
	// 	setIsCollapsed((prev) => {
	// 		const newValue = !prev;
	// 		setWidth(newValue ? 65 : 256); // use new value

	// 		return newValue;
	// 	});
	// }
	function updateIsCollapsed(val: boolean) {
		setIsCollapsed(val);
		setWidth(val ? 65 : 256);
	}

	return (
		<LayoutContext.Provider
			value={{
				width,
				updateWidth,
				updateIsCollapsed,
				data,
				isLoading,
				isCollapsed
			}}>
			{children}
		</LayoutContext.Provider>
	);
};

export const useLayoutContext = () => {
	const context = useContext(LayoutContext);
	if (!context)
		throw new Error(
			'useSidebarContext must be used within SidebarProvider'
		);
	return context;
};

export function LayoutBody({ children }: { children: ReactNode }) {
	const { isCollapsed } = useLayoutContext();

	const marginLeft = useResponsiveSidebarMargin(isCollapsed);
	return (
		<section
			style={{ marginLeft }}
			className=' flex flex-col dashboard-body lg:overflow-x-hidden gap-6'>
			{children}
		</section>
	);
}
