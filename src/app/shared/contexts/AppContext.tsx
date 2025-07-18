'use client';
import { createContext, useContext } from 'react';
import { ROLES } from '../enums/enums';
import { User } from '../model/model';
import { useProfile } from '../components/profile/hooks/useProfile';

interface AppContextType {
	user: User | undefined;
	isLoading: boolean;
	error: any;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useAppContext must be used within AppProvider');
	}
	return context;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const { data: user, isLoading, error } = useProfile<User>();

	// if (isLoading) {
	// 	return <div>Loading user...</div>; // Or a skeleton component
	// }

	// if (error) {
	// 	return <div>Error loading user</div>; // Or handle as needed
	// }

	return (
		<AppContext.Provider value={{ user, isLoading, error }}>
			{children}
		</AppContext.Provider>
	);
};
