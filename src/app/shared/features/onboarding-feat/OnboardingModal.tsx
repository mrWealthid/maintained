"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAppContext } from "@/app/shared/contexts/AppContext";
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
      <DialogContent
        className="w-screen max-w-none h-full max-h-screen rounded-none border-0 p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between p-4">
            <DialogTitle className="text-lg font-semibold">
              Getting Started – {user?.currentBusiness?.name || "Your Business"}
            </DialogTitle>
            <div className="flex gap-2">
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
            </div>
          </div>
        </DialogHeader>

        <div className="pt-16 h-full overflow-y-auto">
          <OnboardingMultiStep
            emailVerified={emailVerified}
            checklistData={checklistData}
            onCloseModal={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
