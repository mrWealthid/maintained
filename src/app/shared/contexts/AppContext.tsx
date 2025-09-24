"use client";
import { createContext, useContext, useEffect } from "react";
import { ROLES } from "../enums/enums";
import { User } from "../model/model";
import { useProfile } from "../components/profile/hooks/useProfile";
import { useRouter } from "next/navigation";
import { getMembershipForBusiness } from "@/utils/helpers";

interface AppContextType {
  user: User | undefined;
  isLoading: boolean;
  error: any;
  role: ROLES;
  isCreator: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading, error } = useProfile<User>();

  // function getUserRoleForCurrentBusiness(
  // 	user: User | undefined
  // ): ROLES | undefined {
  // 	const membership = user?.memberships.find((m) => {
  // 		const businessId =
  // 			typeof m.business === 'string' ? m.business : m.business.id;
  // 		const currentBusinessId =
  // 			typeof user.currentBusiness === 'string'
  // 				? user.currentBusiness
  // 				: user.currentBusiness.id;

  // 		return businessId === currentBusinessId;
  // 	});

  // 	return membership?.role;
  // }

  {
    const membership = getMembershipForBusiness(
      user!,
      user?.currentBusiness.id!
    )!;

    return (
      <AppContext.Provider
        value={{
          user,
          isLoading,
          error,
          role: membership?.role,
          isCreator: membership?.isCreator,
        }}
      >
        {children}
      </AppContext.Provider>
    );
  }
};
