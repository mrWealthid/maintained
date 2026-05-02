"use client";
import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClipboardList, LogOut } from "lucide-react";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import { useAppContext } from "@/shared/contexts/AppContext";
import { useLogout } from "@/app/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ChecklistState } from "./model/model";
import { ThemeToggle } from "@/components/Theme-Toggle";
import { OnboardingMultiStep } from "./OnboardingMultiStep";

interface OnboardingModalProps {
  emailVerified: boolean;
  isOpen: boolean;
  onClose?: () => void;
  checklistData?: ChecklistState; // pass fresh counters here so auto-advance works
}

export default function OnboardingModal({
  emailVerified,
  isOpen,
  onClose,
  checklistData,
}: OnboardingModalProps) {
  const { user } = useAppContext();
  const router = useRouter();
  const { isLoading: isLoggingOut, logOut } = useLogout(router);

  const handleLogout = () => {
    logOut();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <AppDialogContent
        className="h-[100dvh] max-h-[100dvh] w-screen max-w-none rounded-none border-0 sm:max-h-[100dvh] sm:max-w-none"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AppDialogHeader
          title={`Getting Started - ${user?.currentBusiness?.name || "Your Business"}`}
          description="Complete the required setup steps for this workspace."
          icon={ClipboardList}
          actions={
            <>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </>
          }
        />

        <AppDialogBody className="p-0">
          <OnboardingMultiStep
            emailVerified={emailVerified}
            checklistData={checklistData}
            onCloseModal={onClose}
          />
        </AppDialogBody>
      </AppDialogContent>
    </Dialog>
  );
}
