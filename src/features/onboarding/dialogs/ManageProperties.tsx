import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2 } from "lucide-react";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import { useState } from "react";
import MultiplePropertyForm from "../components/MultiplePropertyForm";

export function ManagePropertiesDialog({
  businessId,
  trigger,
  onCreated,
}: {
  businessId: string;
  trigger: React.ReactNode;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <AppDialogContent className="h-[100dvh] max-h-[100dvh] w-screen max-w-none rounded-none border-0 sm:max-h-[100dvh] sm:max-w-none">
        <AppDialogHeader
          title="Add Multiple Properties"
          description="Create multiple properties from a focused workspace."
          icon={Building2}
        />
        <AppDialogBody>
          <MultiplePropertyForm
            businessId={businessId}
            successCallback={() => {
              setOpen(false);
              onCreated?.(); // <- optimistic
            }}
            onCloseModal={() => setOpen(false)}
          />
        </AppDialogBody>
      </AppDialogContent>
    </Dialog>
  );
}
