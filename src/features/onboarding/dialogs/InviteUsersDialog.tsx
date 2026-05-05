import InviteUsersForm from "@/features/team/forms/InviteUsersForm";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import { useState } from "react";

export function InviteUsersDialog({
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
      <AppDialogContent className="h-[100dvh] max-h-[100dvh] w-screen max-w-none rounded-none border-0 sm:max-h-[100dvh] sm:max-w-none">
        <AppDialogHeader
          title="Invite Multiple Users"
          description="Invite multiple users to this workspace from one flow."
          icon={Users}
        />
        <AppDialogBody>
          <InviteUsersForm
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
        </AppDialogBody>
      </AppDialogContent>
    </Dialog>
  );
}
