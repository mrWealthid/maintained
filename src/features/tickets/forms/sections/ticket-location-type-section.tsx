"use client";

import { Controller, useFormContext } from "react-hook-form";
import { MapPin, Settings2 } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import { FORM_CONTROL_CLASS } from "@/shared/components/form-elements/form-control-styles";
import type { TicketType } from "@/shared/model/model";
import type { TicketCreateFormValues } from "../../models/ticket-form.model";
import { TicketTypeCombobox } from "./ticket-form-comboboxes";
import { TicketFormSectionCard } from "./ticket-form-section-card";
import { TicketPropertyUnitFields } from "./ticket-property-unit-fields";

export function TicketLocationTypeSection({
  disabled,
  ticketTypes,
  showPropertyUnitFields = false,
  showTicketTypeField = true,
}: {
  disabled?: boolean;
  ticketTypes: TicketType[];
  showPropertyUnitFields?: boolean;
  showTicketTypeField?: boolean;
}) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<TicketCreateFormValues>();
  const selectedTypeName = ticketTypes.find(
    (type) => type.id === watch("type"),
  )?.name;

  return (
    <TicketFormSectionCard
      step={2}
      icon={<MapPin className="h-4 w-4" />}
      title={showTicketTypeField ? "Location & Type" : "Location"}
      subtitle={
        showTicketTypeField
          ? "Where the issue is and what kind of service is needed"
          : "Where the issue is located"
      }
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

        {showTicketTypeField ? (
          <div className="space-y-1.5">
            <Label htmlFor="ticketType" required>
              Request Type
            </Label>
            <Controller
              name="type"
              control={control}
              rules={{ required: "Please select a ticket type" }}
              render={({ field }) => (
                <TicketTypeCombobox
                  value={field.value}
                  types={ticketTypes}
                  disabled={disabled}
                  onChange={(type) => field.onChange(type.id)}
                />
              )}
            />
            {errors.type?.message ? (
              <ErrorMessage errorMsg={errors.type.message.toString()} />
            ) : null}
          </div>
        ) : null}
      </div>

      {showTicketTypeField && selectedTypeName ? (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Settings2 className="h-3 w-3" />
            {selectedTypeName} request: a technician will be assigned after review
          </div>
        </div>
      ) : null}
    </TicketFormSectionCard>
  );
}
