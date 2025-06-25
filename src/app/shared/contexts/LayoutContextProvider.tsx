'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useProfile } from '../components/profile/hooks/useProfile';
import { User } from '../model/model';

interface LayoutContextType {
	width: number;
	updateWidth: (width: number) => void;
	data: User | undefined;
	isLoading: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({
	children
}) => {
	const [width, setWidth] = useState(256);

	const { data, isLoading, error } = useProfile<User>();

	function updateWidth(width: number) {
		setWidth(width);
	}

	return (
		<LayoutContext.Provider
			value={{
				width,
				updateWidth,
				data,
				isLoading
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
	const { width } = useLayoutContext();

	return (
		<section
			className={`${width === 256 ? 'sm:ml-[256px]' : 'sm:ml-[65px]'} flex transition duration-500 flex-col dashboard-body gap-6`}>
			{children}
		</section>
	);
}
