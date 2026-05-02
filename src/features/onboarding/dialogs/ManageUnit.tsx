import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DoorOpen } from "lucide-react";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import { useState } from "react";
import UnitForm from "../components/UnitForm";

export function ManageUnitDialog({
  businessId,
  trigger,
  onAdded,
}: {
  businessId: string;
  trigger: React.ReactNode;
  onAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <AppDialogContent className="h-[100dvh] max-h-[100dvh] w-screen max-w-none rounded-none border-0 sm:max-h-[100dvh] sm:max-w-none">
        <AppDialogHeader
          title="Add Units"
          description="Configure units for this workspace."
          icon={DoorOpen}
        />
        <AppDialogBody>
          <UnitForm
            businessId={businessId}
            successCallback={() => {
              setOpen(false);
              onAdded?.(); // <- optimistic
            }}
          />
        </AppDialogBody>
      </AppDialogContent>
    </Dialog>
  );
}
