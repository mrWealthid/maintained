"use client";

import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Decline Maintenance Ticket</DialogTitle>
          <DialogDescription>The request will be declined.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextInput
            name="reason"
            placeholder="Kindly describe"
            label="reason"
            required
            error={errors?.reason?.message?.toString()}
          >
            <textarea
              className="input-style"
              {...register("reason", { required: "This field is required" })}
              disabled={isSubmitting}
              id="reason"
              cols={40}
              rows={4}
            />
          </TextInput>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting || !isDirty || isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 size-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
