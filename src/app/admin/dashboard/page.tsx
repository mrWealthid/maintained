"use client";
import { useMemo } from "react";
import OnboardingModal from "@/app/shared/onboarding-feat/OnboardingModal";
import TicketComponent from "@/app/shared/ticket-feat/pages/TicketComponent";
import { useOnboardingChecklist } from "@/app/shared/onboarding-feat/hooks/onboardingHooks";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/app/shared/contexts/AppContext";

// Shimmer skeleton component with enhanced animation
const ShimmerSkeleton = ({
  className,
  ...props
}: React.ComponentProps<typeof Skeleton>) => (
  <div
    className={`relative overflow-hidden rounded-md bg-muted ${className}`}
    {...props}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  </div>
);

export default function Home() {
  const { data: checklistData, isFetchingChecklist } = useOnboardingChecklist();

  const { user, isCreator } = useAppContext();
  // Determine if onboarding is completed
  const isOnboardingCompleted = useMemo(() => {
    if (!checklistData) return false;

    const {
      emailVerified,
      propertiesCount,
      unitsCount,
      adminsCount,
      tenantsCount,
      techniciansCount,
    } = checklistData;

    return !!(
      (
        emailVerified &&
        propertiesCount > 0 &&
        unitsCount > 0 &&
        adminsCount > 0
      )
      // Removed tenant requirement - working with 4 steps
      // (tenantsCount > 0 || techniciansCount > 0)
    );
  }, [checklistData]);

  // Show loading state while fetching checklist data
  if (isFetchingChecklist) {
    return (
      <main className="flex gap-6 flex-col">
        <section className="flex w-full justify-between">
          <ShimmerSkeleton className="h-12 w-32 rounded-lg" />
        </section>

        {/* Onboarding Modal Skeleton */}
        <div className="w-full h-screen bg-card border rounded-lg overflow-hidden">
          {/* Modal Header Skeleton */}
          <div className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b p-4">
            <div className="flex items-center justify-between">
              <ShimmerSkeleton className="h-6 w-48" />
              <ShimmerSkeleton className="h-8 w-20" />
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Welcome Card Skeleton */}
            <div className="border rounded-lg p-6 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <ShimmerSkeleton className="h-7 w-64" />
                  <ShimmerSkeleton className="h-4 w-96" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center space-y-1">
                    <ShimmerSkeleton className="h-8 w-8 mx-auto" />
                    <ShimmerSkeleton className="h-3 w-16" />
                  </div>
                  <div className="w-32 space-y-1">
                    <div className="flex justify-between">
                      <ShimmerSkeleton className="h-3 w-12" />
                      <ShimmerSkeleton className="h-3 w-8" />
                    </div>
                    <ShimmerSkeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                <ShimmerSkeleton className="h-4 w-4" />
                <ShimmerSkeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Steps Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <ShimmerSkeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <ShimmerSkeleton className="h-5 w-32" />
                        <ShimmerSkeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <ShimmerSkeleton className="h-4 w-full" />
                      <ShimmerSkeleton className="h-4 w-3/4" />
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                          <ShimmerSkeleton className="h-3 w-3" />
                          <ShimmerSkeleton className="h-3 w-12" />
                        </div>
                        <div className="flex gap-2">
                          <ShimmerSkeleton className="h-8 w-24" />
                          <ShimmerSkeleton className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex gap-6 flex-col">
      <section className="flex w-full justify-between">
        <p className="border first-letter:text-blue-700 first-letter:text-xl border-gray-50 p-2 rounded-lg">
          Maintained
        </p>
      </section>

      {!isOnboardingCompleted && isCreator ? (
        <OnboardingModal
          emailVerified={true}
          isOpen={!isOnboardingCompleted}
          onClose={() => {}}
          checklistData={checklistData}
        />
      ) : (
        <TicketComponent />
      )}
    </main>
  );
}
