'use client';
import { createContext, useContext, useEffect } from 'react';
import { ROLES } from '../enums/enums';
import { User } from '../model/model';
import { useProfile } from '../components/profile/hooks/useProfile';
import { useRouter } from 'next/navigation';

interface AppContextType {
	user: User | undefined;
	isLoading: boolean;
	error: any;
	role: ROLES | undefined;
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
	const router = useRouter();

	function getUserRoleForCurrentBusiness(
		user: User | undefined
	): ROLES | undefined {
		const membership = user?.memberships.find((m) => {
			const businessId =
				typeof m.business === 'string' ? m.business : m.business.id;
			const currentBusinessId =
				typeof user.currentBusiness === 'string'
					? user.currentBusiness
					: user.currentBusiness.id;

			return businessId === currentBusinessId;
		});

		return membership?.role;
	}
	// if (isLoading) {
	// 	return <div>Loading user...</div>; // Or a skeleton component
	// }

	// if (error) {
	// 	return <div>Error loading user</div>; // Or handle as needed
	// }

	// useEffect(() => {
	// 	if (!isLoading && user) {
	// 		const role = getUserRoleForCurrentBusiness(user);

	// 		if (role === 'TECHNICIAN') router.push('/technician/dashboard');
	// 		else if (role === 'ADMIN') router.push('/admin/dashboard');
	// 		else if (role === 'USER') router.push('/dashboard');
	// 	}
	// }, [user, isLoading, router]);

	return (
		<AppContext.Provider
			value={{
				user,
				isLoading,
				error,
				role: getUserRoleForCurrentBusiness(user)
			}}>
			{children}
		</AppContext.Provider>
	);
};
