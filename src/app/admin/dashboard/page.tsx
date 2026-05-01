"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import OnboardingModal from "@/features/onboarding/OnboardingModal";
import TicketComponent from "@/features/tickets/components/TicketComponent";
import { useAppContext } from "@/shared/contexts/AppContext";
import { useOnboardingChecklist } from "@/features/onboarding/hooks/onboardingHooks";

export default function Home() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/admin/dashboard");

  const { data: checklistData, isFetchingChecklist } = useOnboardingChecklist();
  const { isCreator } = useAppContext();

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
    if (isFetchingChecklist || !isCreator) return;

    // If already on dashboard and completed → never show the modal here.
    if (isDashboard && isOnboardingCompleted) {
      setShowOnboarding(false);
      prevCompletedRef.current = true;
      return;
    }

    // Not completed → show modal
    if (!isOnboardingCompleted) {
      setShowOnboarding(true);
    } else if (!prevCompletedRef.current) {
      // Just transitioned to completed (and not on dashboard): show once for success-screen
      setShowOnboarding(true);
    }

    prevCompletedRef.current = isOnboardingCompleted;
  }, [isFetchingChecklist, isCreator, isDashboard, isOnboardingCompleted]);

  // ... keep your loading skeleton as-is

  return (
    <main className="flex gap-6 flex-col">
      {/* header omitted for brevity */}

      {isCreator && showOnboarding ? (
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
