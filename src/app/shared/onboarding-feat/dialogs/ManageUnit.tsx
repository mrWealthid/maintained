import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
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
      <DialogContent className="left-0 top-0 -translate-x-0 -translate-y-0 w-screen h-[100dvh] max-w-none rounded-none p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add units</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <UnitForm
            businessId={businessId}
            successCallback={() => {
              setOpen(false);
              onAdded?.(); // <- optimistic
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
