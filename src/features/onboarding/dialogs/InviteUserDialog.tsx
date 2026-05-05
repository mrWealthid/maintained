import InviteUserForm from "@/features/team/forms/InviteUserForm";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import { useState } from "react";

export function InviteUserDialog({
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
      <AppDialogContent className="sm:max-w-lg">
        <AppDialogHeader
          title="Invite User"
          description="Invite a user to this workspace."
          icon={UserPlus}
        />
        <AppDialogBody>
          <InviteUserForm
            successCallback={() => {
              setOpen(false);
              onInvited?.(); // <- optimistic
            }}
            onCloseModal={() => setOpen(false)}
          />
        </AppDialogBody>
      </AppDialogContent>
    </Dialog>
  );
}
