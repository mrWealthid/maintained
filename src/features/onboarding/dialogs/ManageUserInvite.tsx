import UserForm from "@/features/team/forms/UserForm";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export function ManageUserInviteDialog({
  trigger,
  onInvited,
  forceRole,
}: {
  trigger: React.ReactNode;
  onInvited?: () => void;
  forceRole?: "USER" | "ADMIN" | "TECHNICIAN" | "OWNER";
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
        </DialogHeader>
        <UserForm
          successCallback={() => {
            setOpen(false);
            onInvited?.(); // <- optimistic
          }}
          onCloseModal={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
