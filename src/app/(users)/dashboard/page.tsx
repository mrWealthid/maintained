"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import OnboardingModal from "@/features/onboarding/OnboardingModal";
import TicketComponent from "@/features/tickets/components/TicketComponent";
import { useAppContext } from "@/shared/contexts/AppContext";
import { useOnboardingChecklist } from "@/features/onboarding/hooks/onboardingHooks";

export default function Home() {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const { data: checklistData, isFetchingChecklist } = useOnboardingChecklist();
  const { user } = useAppContext();
  const isWorkspaceOwner = user.isWorkspaceOwner === true;

  const isOnboardingCompleted = useMemo(() => {
    if (!checklistData) return false;
    const {
      emailVerified,
      propertiesCount,
      unitsCount,
      adminsCount,
      techniciansCount,
    } = checklistData;
    const teamCount = (adminsCount ?? 0) + (techniciansCount ?? 0);
    return Boolean(
      emailVerified &&
        (propertiesCount ?? 0) > 0 &&
        (unitsCount ?? 0) > 0 &&
        teamCount > 1
    );
  }, [checklistData]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const prevCompletedRef = useRef(false);

  useEffect(() => {
    if (isFetchingChecklist || !isWorkspaceOwner) return;

    if (isDashboard && isOnboardingCompleted) {
      setShowOnboarding(false);
      prevCompletedRef.current = true;
      return;
    }

    if (!isOnboardingCompleted) {
      setShowOnboarding(true);
    } else if (!prevCompletedRef.current) {
      setShowOnboarding(true);
    }

    prevCompletedRef.current = isOnboardingCompleted;
  }, [isFetchingChecklist, isWorkspaceOwner, isDashboard, isOnboardingCompleted]);

  return (
    <main className="flex gap-6 flex-col">
      {isWorkspaceOwner && showOnboarding ? (
        <OnboardingModal
          emailVerified={Boolean(checklistData?.emailVerified)}
          isOpen
          onClose={() => setShowOnboarding(false)}
          checklistData={checklistData}
        />
      ) : (
        <TicketComponent />
      )}
    </main>
  );
}
