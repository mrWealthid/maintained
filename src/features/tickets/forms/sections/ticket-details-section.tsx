"use client";

import { useFormContext } from "react-hook-form";
import { FileText } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import type { Category } from "@/shared/model/model";
import type { TicketCreateFormValues } from "../../models/ticket-form.model";
import { CategoryCombobox } from "./ticket-form-comboboxes";
import { TicketFormSectionCard } from "./ticket-form-section-card";

export function TicketDetailsSection({
  disabled,
  initialCategory,
}: {
  disabled?: boolean;
  initialCategory?: Category;
}) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<TicketCreateFormValues>();

  return (
    <TicketFormSectionCard
      step={1}
      icon={<FileText className="h-4 w-4" />}
      title="Ticket Details"
      subtitle="Provide a clear title and description of the issue"
    >
      <div className="space-y-1.5">
        <Label htmlFor="title" required>
          Title
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="e.g. Leaking faucet in master bathroom"
          disabled={disabled}
          aria-invalid={!!errors.title}
          className="h-10 rounded-xl"
          {...register("title", { required: "This field is required" })}
        />
        {errors.title?.message ? (
          <ErrorMessage errorMsg={errors.title.message.toString()} />
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" required>
          Description
        </Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Describe the issue in detail: when it started, severity, hazards..."
          disabled={disabled}
          aria-invalid={!!errors.description}
          className="rounded-xl"
          {...register("description", { required: "This field is required" })}
        />
        {errors.description?.message ? (
          <ErrorMessage errorMsg={errors.description.message.toString()} />
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category-combobox" required>
          Category
        </Label>
        <CategoryCombobox
          initialCategory={initialCategory}
          disabled={disabled}
          onChange={(category) =>
            setValue("category", category.id, {
              shouldDirty: true,
              shouldValidate: true,
              shouldTouch: true,
            })
          }
        />
        <input
          type="hidden"
          id="category"
          {...register("category", { required: "This field is required" })}
        />
        {errors.category?.message ? (
          <ErrorMessage errorMsg={errors.category.message.toString()} />
        ) : null}
      </div>
    </TicketFormSectionCard>
  );
}
