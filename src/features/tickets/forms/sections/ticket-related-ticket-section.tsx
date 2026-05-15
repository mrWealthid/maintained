"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Link2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import { FORM_CONTROL_CLASS } from "@/shared/components/form-elements/form-control-styles";
import type { Ticket } from "@/shared/model/model";
import { fetchTicketList } from "../../services/ticket-service";
import type { TicketCreateFormValues } from "../../models/ticket-form.model";
import { TicketFormSectionCard } from "./ticket-form-section-card";

export function TicketRelatedTicketSection({
  disabled,
  currentTicketId,
}: {
  disabled?: boolean;
  currentTicketId?: string;
}) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<TicketCreateFormValues>();
  const relatedTicketId = watch("relatedTo");
  const [isConnected, setIsConnected] = useState(Boolean(relatedTicketId));

  const ticketsQuery = useQuery({
    queryKey: ["tickets", "related-ticket-options"],
    queryFn: () => fetchTicketList({ page: 1, limit: 50, search: {} }),
    enabled: isConnected,
  });

  const ticketOptions = useMemo(() => {
    return (ticketsQuery.data?.data ?? []).filter(
      (ticket) => ticket.id !== currentTicketId,
    );
  }, [currentTicketId, ticketsQuery.data?.data]);

  useEffect(() => {
    setIsConnected(Boolean(relatedTicketId));
  }, [relatedTicketId]);

  function handleConnectedChange(checked: boolean | "indeterminate") {
    const nextChecked = checked === true;
    setIsConnected(nextChecked);

    if (!nextChecked) {
      setValue("relatedTo", "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }

  return (
    <TicketFormSectionCard
      step={3}
      icon={<Link2 className="h-4 w-4" />}
      title="Related Ticket"
      subtitle="Connect this repair to an earlier maintenance request when needed"
    >
      <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
        <Checkbox
          id="repair-related-to-ticket"
          checked={isConnected}
          disabled={disabled}
          onCheckedChange={handleConnectedChange}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label
            htmlFor="repair-related-to-ticket"
            className="cursor-pointer text-sm font-medium"
          >
            This repair is connected to a previously raised ticket
          </Label>
          <p className="text-xs text-muted-foreground">
            Select the previous ticket so the repair history stays linked.
          </p>
        </div>
      </div>

      {isConnected ? (
        <div className="space-y-1.5">
          <Label htmlFor="relatedTo" required>
            Previous Ticket
          </Label>
          <Controller
            name="relatedTo"
            control={control}
            rules={{
              validate: (value) =>
                !isConnected || Boolean(value) || "Select the related ticket",
            }}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                disabled={disabled || ticketsQuery.isLoading}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="relatedTo" className={FORM_CONTROL_CLASS}>
                  <SelectValue
                    placeholder={
                      ticketsQuery.isLoading
                        ? "Loading previous tickets..."
                        : "Select the previous ticket"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {ticketOptions.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      {formatTicketOption(ticket)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {ticketOptions.length === 0 && !ticketsQuery.isLoading ? (
            <p className="text-xs text-muted-foreground">
              No previous tickets are available to link.
            </p>
          ) : null}
          {errors.relatedTo?.message ? (
            <ErrorMessage errorMsg={errors.relatedTo.message.toString()} />
          ) : null}
        </div>
      ) : null}
    </TicketFormSectionCard>
  );
}

function formatTicketOption(ticket: Ticket) {
  const location = [ticket.propertyName, ticket.unitLabel]
    .filter(Boolean)
    .join(" / ");
  const created = ticket.createdAt
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(ticket.createdAt))
    : "";

  return [ticket.title, location, created].filter(Boolean).join(" - ");
}
