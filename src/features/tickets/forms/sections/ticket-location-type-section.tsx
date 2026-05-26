"use client";

import { useFormContext } from "react-hook-form";
import { MapPin } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import { FORM_CONTROL_CLASS } from "@/shared/components/form-elements/form-control-styles";
import type { TicketCreateFormValues } from "../../models/ticket-form.model";
import { TicketFormSectionCard } from "./ticket-form-section-card";
import { TicketPropertyUnitFields } from "./ticket-property-unit-fields";

export function TicketLocationTypeSection({
  disabled,
  showPropertyUnitFields = false,
}: {
  disabled?: boolean;
  showPropertyUnitFields?: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TicketCreateFormValues>();

  return (
    <TicketFormSectionCard
      step={2}
      icon={<MapPin className="h-4 w-4" />}
      title="Location"
      subtitle="Where the issue is located"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {showPropertyUnitFields ? (
          <TicketPropertyUnitFields disabled={disabled} />
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="area" required>
            Area
          </Label>
          <InputGroup className={FORM_CONTROL_CLASS}>
            <InputGroupAddon align="inline-start">
              <MapPin className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id="area"
              type="text"
              placeholder="e.g. Kitchen, Bedroom 2..."
              disabled={disabled}
              aria-invalid={!!errors.area}
              {...register("area", { required: "This field is required" })}
            />
          </InputGroup>
          {errors.area?.message ? (
            <ErrorMessage errorMsg={errors.area.message.toString()} />
          ) : null}
        </div>
      </div>
    </TicketFormSectionCard>
  );
}
