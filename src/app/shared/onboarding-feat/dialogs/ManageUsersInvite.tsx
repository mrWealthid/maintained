import MultipleUserForm from "@/app/admin/dashboard/users/MultipleUserForm";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export function ManageUsersInviteDialog({
  trigger,
  onInvited,
}: {
  trigger: React.ReactNode;
  onInvited?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-screen h-screen max-w-none max-h-none rounded-none border-0 p-0">
        <DialogHeader>
          <DialogTitle>Invite multiple users</DialogTitle>
        </DialogHeader>
        <MultipleUserForm
          successCallback={() => {
            setOpen(false); // close only on success
            onInvited?.(); // refresh checklist/counters
          }}
          onCloseModal={() => {
            setOpen(false);
          }} // still allow manual cancel to close
          errorCallback={(e) => {
            // optional: toast with your existing system
            // toast.error(getErrorMessage(e));
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
