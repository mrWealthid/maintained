import {
  DialogContent,
  DialogTitle,
  Dialog,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
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
      <DialogContent className="w-screen h-screen max-w-none max-h-none rounded-none border-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add multiple properties</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <MultiplePropertyForm
            businessId={businessId}
            successCallback={() => {
              setOpen(false);
              onCreated?.(); // <- optimistic
            }}
            onCloseModal={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
