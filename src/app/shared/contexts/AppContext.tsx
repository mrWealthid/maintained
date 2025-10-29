"use client";
import { createContext, useContext, useEffect, useMemo } from "react";
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

  {
    const memoizedValue = useMemo(() => {
      const membership = getMembershipForBusiness(
        user!,
        user?.currentBusiness.id!
      )!;
      return {
        user,
        isLoading,
        error,
        role: membership?.role,
        isCreator: membership?.isCreator,
      };
    }, [user, isLoading, error]);

    return (
      <AppContext.Provider value={memoizedValue}>
        {children}
      </AppContext.Provider>
    );
  }
};
