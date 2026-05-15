"use client";

import { Controller, useFormContext } from "react-hook-form";

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
import { usePropertyList } from "@/features/properties/hooks/use-properties";
import { useUnitList } from "@/features/units/hooks/use-units";
import type { Property } from "@/features/properties/services/property-service";
import type { Unit } from "@/features/units/services/unit-service";
import type { TicketCreateFormValues } from "../../models/ticket-form.model";

export function TicketPropertyUnitFields({ disabled }: { disabled?: boolean }) {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<TicketCreateFormValues>();
  const selectedPropertyId = watch("property");
  const propertiesQuery = usePropertyList({ page: 1, limit: 100 });
  const unitsQuery = useUnitList({
    page: 1,
    limit: 100,
    property: selectedPropertyId || undefined,
  });
  const properties: Property[] = propertiesQuery.data?.data ?? [];
  const units: Unit[] = unitsQuery.data?.data ?? [];

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="property" required>
          Property
        </Label>
        <Controller
          name="property"
          control={control}
          rules={{ required: "Property is required" }}
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              disabled={disabled || propertiesQuery.isLoading}
              onValueChange={(value) => {
                field.onChange(value);
                setValue("unit", "", {
                  shouldDirty: true,
                  shouldValidate: true,
                  shouldTouch: true,
                });
              }}
            >
              <SelectTrigger id="property" className={FORM_CONTROL_CLASS}>
                <SelectValue
                  placeholder={
                    propertiesQuery.isLoading
                      ? "Loading properties..."
                      : "Select a property"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property._id} value={property._id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.property?.message ? (
          <ErrorMessage errorMsg={errors.property.message.toString()} />
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="unit" required>
          Unit
        </Label>
        <Controller
          name="unit"
          control={control}
          rules={{ required: "Unit is required" }}
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              disabled={disabled || !selectedPropertyId || unitsQuery.isLoading}
              onValueChange={field.onChange}
            >
              <SelectTrigger id="unit" className={FORM_CONTROL_CLASS}>
                <SelectValue
                  placeholder={
                    !selectedPropertyId
                      ? "Select a property first"
                      : unitsQuery.isLoading
                        ? "Loading units..."
                        : "Select a unit"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit._id} value={unit._id}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.unit?.message ? (
          <ErrorMessage errorMsg={errors.unit.message.toString()} />
        ) : null}
      </div>
    </>
  );
}
