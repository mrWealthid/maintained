"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import {
  TICKET_PRIORITY,
  TICKET_PRIORITY_VALUES,
  type TicketPriority,
} from "../../models/ticket-priority.model";
import type { TicketCreateFormValues } from "../../models/ticket-form.model";

export function TicketPriorityField({ disabled }: { disabled?: boolean }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<TicketCreateFormValues>();

  return (
    <div className="space-y-1.5">
      <Label required>Priority</Label>
      <Controller
        name="priority"
        control={control}
        rules={{ required: "Priority is required" }}
        render={({ field }) => (
          <div
            role="radiogroup"
            aria-label="Priority"
            className="grid grid-cols-3 gap-2"
          >
            {TICKET_PRIORITY_VALUES.map((level) => (
              <button
                type="button"
                role="radio"
                aria-checked={field.value === level}
                key={level}
                onClick={() => field.onChange(level)}
                disabled={disabled}
                className={getPriorityButtonClass(level, field.value === level)}
              >
                {level.charAt(0) + level.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}
      />
      {errors.priority?.message ? (
        <ErrorMessage errorMsg={errors.priority.message.toString()} />
      ) : null}
    </div>
  );
}

function getPriorityButtonClass(level: TicketPriority, isSelected: boolean) {
  const base =
    "flex h-10 items-center justify-center rounded-xl border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  if (!isSelected) return cn(base, "border-border/70 hover:border-border");
  if (level === TICKET_PRIORITY.high) {
    return cn(base, "border-destructive bg-destructive/10 text-destructive");
  }
  if (level === TICKET_PRIORITY.medium) {
    return cn(
      base,
      "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    );
  }
  return cn(base, "border-primary bg-primary/10 text-primary");
}
