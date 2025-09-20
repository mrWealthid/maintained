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
import { useAppContext } from "../contexts/AppContext";
import { useLogout } from "@/app/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { OnboardingChecklistContent } from "./Onboarding-Checklist";
import { ChecklistState } from "./model/model";

interface OnboardingModalProps {
  emailVerified: boolean;
  isOpen: boolean;
  onClose?: () => void;
  checklistData?: ChecklistState;
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
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent
        className="w-screen h-screen max-w-none max-h-none rounded-none border-0 p-8"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between p-4">
            <DialogTitle className="text-lg font-semibold">
              Getting Started - {user?.currentBusiness?.name || "Your Business"}
            </DialogTitle>
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
        </DialogHeader>

        <div className="pt-16 h-full overflow-y-auto">
          <OnboardingChecklistContent
            emailVerified={emailVerified}
            onCompleted={onClose}
            checklistData={checklistData}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
