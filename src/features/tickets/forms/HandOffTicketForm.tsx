"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Check, ChevronDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PopoverTrigger,
  Popover,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import {
  useFetchAdmins,
  useHandOffTicket,
} from "@/features/tickets/hooks/ticketHooks";
import type { handOffTicketFormProps } from "@/features/tickets/models/ticket.model";
import type { User } from "@/shared/model/model";

type Props = Pick<handOffTicketFormProps, "ticket"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function HandOffTicketForm({ ticket, open, onOpenChange }: Props) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { handleSubmit, control, formState, reset } = useForm<{
    actionedBy: string;
  }>({
    mode: "all",
    defaultValues: { actionedBy: "" },
  });

  const { isSubmitting, isValid, isDirty } = formState;
  const { isUpdating, handleHandleOffTicket } = useHandOffTicket(
    ticket.id,
    () => {
      reset();
      onOpenChange(false);
    },
  );

  const { data: admins } = useFetchAdmins<User>();

  async function onSubmit(data: { actionedBy: string }) {
    handleHandleOffTicket(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hand-off Ticket</DialogTitle>
          <DialogDescription>
            Reassign this ticket to another admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="actionedBy"
            render={({ field }) => {
              const selectedValue = field.value;
              return (
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      type="button"
                    >
                      {selectedValue
                        ? admins?.find((u) => u.id === selectedValue)?.name
                        : "Select Admin"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search admins..." />
                      <CommandEmpty>No admin found.</CommandEmpty>
                      <CommandGroup>
                        {admins?.map((u) => (
                          <CommandItem
                            key={u.id}
                            onSelect={() => {
                              field.onChange(u.id);
                              setPopoverOpen(false);
                            }}
                          >
                            <span className="mr-2">
                              {selectedValue === u.id && (
                                <Check className="h-4 w-4" />
                              )}
                            </span>
                            {u.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              );
            }}
          />

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
              disabled={!isValid || isSubmitting || !isDirty || isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 size-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
