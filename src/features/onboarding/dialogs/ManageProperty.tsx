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
import PropertyForm from "../components/PropertyForm";
import { useState } from "react";

export function ManagePropertyDialog({
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
          title="Add Property"
          description="Add a property to this workspace."
          icon={Building2}
        />
        <AppDialogBody>
          <PropertyForm
            businessId={businessId}
            successCallback={() => {
              setOpen(false);
              onCreated?.(); // <- flips optimistic flag immediately
            }}
            onCloseModal={() => setOpen(false)}
          />
        </AppDialogBody>
      </AppDialogContent>
    </Dialog>
  );
}
