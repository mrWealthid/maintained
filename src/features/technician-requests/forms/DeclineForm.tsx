"use client";

import { useForm } from "react-hook-form";
import { Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import TextInput from "@/shared/components/form-elements/Text-Input";

import { TECHNICIAN_RESPONSE } from "@/shared/enums/enums";
import { useProcessTechnicianResponse } from "@/features/tickets/hooks/ticketHooks";
import type { DeclineTicketFormProps } from "@/features/tickets/models/ticket.model";

type Props = DeclineTicketFormProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DeclineForm({
  ticketRequest,
  open,
  onOpenChange,
}: Props) {
  const { register, handleSubmit, formState, reset } = useForm<{
    reason: string;
  }>({ mode: "all" });

  const { errors, isSubmitting, isValid, isDirty } = formState;
  const { isProcessing, processResponse } = useProcessTechnicianResponse(
    ticketRequest.id,
    () => {
      reset();
      onOpenChange(false);
    },
  );

  async function onSubmit(data: { reason: string }) {
    processResponse({ status: TECHNICIAN_RESPONSE.declined, ...data });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AppDialogContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <AppDialogHeader
            title="Decline Maintenance Ticket"
            description="The request will be declined and the requester notified."
            icon={XCircle}
            tone="destructive"
          />
          <AppDialogBody>
            <TextInput
              name="reason"
              placeholder="Kindly describe"
              label="Reason"
              required
              error={errors?.reason?.message?.toString()}
            >
              <textarea
                className="input-style"
                {...register("reason", { required: "This field is required" })}
                disabled={isSubmitting}
                id="reason"
                rows={4}
              />
            </TextInput>
          </AppDialogBody>
          <AppDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!isValid || isSubmitting || !isDirty || isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 size-4 animate-spin" />}
              Submit
            </Button>
          </AppDialogFooter>
        </form>
      </AppDialogContent>
    </Dialog>
  );
}
