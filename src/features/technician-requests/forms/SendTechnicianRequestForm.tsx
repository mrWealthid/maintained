"use client";
import React, { FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ButtonComponent from "@/shared/components/form-elements/Button";
import {
  useFetchTechnicians,
  useFetchTicketDetails,
  useSendTechnicianRequest,
} from "@/features/tickets/hooks/ticketHooks";
import {
  SendTechnicianRequestFormControls,
  SendTechnicianRequestFormProps,
} from "@/features/tickets/models/ticket.model";
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
import { Check, ChevronDown, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns/format";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

const SendTechnicianRequestForm: FC<SendTechnicianRequestFormProps> = ({
  ticket,
  onCloseModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { handleSubmit, control, formState } =
    useForm<SendTechnicianRequestFormControls>({
      mode: "all",
      defaultValues: { technicianIds: [], expiresAt: undefined },
    });

  const { errors, isSubmitting, isValid, isDirty } = formState;
  const { isSending, handleSendTechnicianRequest } = useSendTechnicianRequest(
    ticket.id,
    onCloseModal
  );

  const { data: technicians } = useFetchTechnicians();

  const { isLoading, data: ticketDetails } = useFetchTicketDetails(ticket.id);

  async function onSubmit(data: SendTechnicianRequestFormControls) {
    handleSendTechnicianRequest(data);
  }

  function onError(err: unknown) {
    console.log(err);
  }

  function isTechnicianRequestSent(id: string) {
    return (
      ticketDetails?.requests?.some((r) => r.technician?.id === id) ?? false
    );
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className=" flex flex-1 items-center"
      >
        <section className="flex-col flex gap-2 w-full">
          <div className="w-full">
            <Controller
              control={control}
              name="technicianIds"
              render={({ field }) => {
                const selectedValues = field.value;

                return (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className=" w-full justify-between bg-transparent hover:bg-transparent"
                        type="button"
                      >
                        {selectedValues.length > 0
                          ? technicians
                              ?.filter((user) =>
                                selectedValues.includes(user.id)
                              )
                              .map((user) => (
                                <Badge
                                  key={user.id}
                                  variant="outline"
                                  className="rounded-xl pr-1 bg-button-primary hover:bg-button-accent text-button-primary-foreground"
                                >
                                  {user.name}
                                  <span
                                    className="  grid h-5 w-5 place-items-center rounded-sm hover:bg-muted"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      field.onChange(
                                        selectedValues.filter(
                                          (v) => v !== user.id
                                        )
                                      );
                                    }}
                                    aria-label={`Remove ${user.id}`}
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="h-3.5 w-3.5"
                                      aria-hidden
                                    >
                                      <path
                                        d="M18 6L6 18M6 6l12 12"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                  </span>
                                </Badge>
                              ))
                          : "Select technicians"}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      align="start"
                    >
                      <Command className="">
                        <CommandInput placeholder="Search technicians..." />
                        <CommandEmpty>No technician found.</CommandEmpty>
                        <CommandGroup>
                          {technicians?.map((user) => {
                            const isSelected = selectedValues.includes(user.id);
                            const isSent = isTechnicianRequestSent(user.id);
                            return (
                              <CommandItem
                                key={user.id}
                                // disabled={isSent}
                                onSelect={() => {
                                  if (isSelected) {
                                    field.onChange(
                                      selectedValues.filter(
                                        (v) => v !== user.id
                                      )
                                    );
                                  } else {
                                    field.onChange([
                                      ...selectedValues,
                                      user.id,
                                    ]);
                                  }
                                }}
                              >
                                <span className=" flex flex-col cursor-pointer w-full gap-1">
                                  <span className="flex gap-2 items-center">
                                    <span>
                                      {isSelected ? (
                                        <Check className="h-4 w-4" />
                                      ) : null}
                                    </span>
                                    {user.name}
                                    {isSent ? (
                                      <Badge variant="outline">Sent</Badge>
                                    ) : (
                                      ""
                                    )}
                                  </span>

                                  <span className="flex gap-1 flex-wrap">
                                    {user.membership?.specialties?.length! >
                                      0 &&
                                      user.membership?.specialties?.map(
                                        (speciality) => (
                                          <Badge
                                            key={speciality}
                                            variant={"secondary"}
                                          >
                                            {speciality}
                                          </Badge>
                                        )
                                      )}
                                  </span>
                                </span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                );
              }}
            />
          </div>

          <section className="flex flex-col gap-4">
            <div className="w-full flex flex-col gap-3">
              <Label htmlFor="date-picker" className="px-1">
                Deadline
              </Label>

              <Controller
                control={control}
                name="expiresAt"
                render={({ field }) => {
                  const hasValue = !!field.value;
                  return (
                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date-picker"
                          onClick={() => setIsOpen(true)}
                          className={` w-full bg-transparent hover:bg-transparent justify-between font-normal ${
                            hasValue
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {hasValue
                            ? format(field.value as Date, "PPP") // e.g., Jul 9, 2025
                            : "Select date"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            field.onChange(date);
                            setIsOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  );
                }}
              />
            </div>
          </section>
          <hr className="my-3" />
          <section className="flex justify-end  gap-4">
            <ButtonComponent
              type="reset"
              handleClick={() => onCloseModal?.()}
              styles="rounded-3xl"
              btnText={"Cancel"}
            ></ButtonComponent>

            <ButtonComponent
              type="submit"
              styles="rounded-3xl"
              disabled={!isValid || isSubmitting || !isDirty}
              loading={isSending}
              btnText={`Submit
                            `}
            ></ButtonComponent>
          </section>
        </section>
      </form>
    </div>
  );
};

export default SendTechnicianRequestForm;
