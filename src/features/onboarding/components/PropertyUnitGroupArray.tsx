"use client";
import * as React from "react";
import { useEffect, useMemo } from "react";
import {
  useWatch,
  useFieldArray,
  Controller,
  type UseFormReturn,
  type Path,
  type PathValue,
} from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Home, Clock } from "lucide-react";
import { useFetchProperties, useFetchUnits } from "../hooks/onboardingHooks";
import { Separator } from "@/components/ui/separator";
import { EditableUnitChip } from "./EditableUnitChip";
import { http } from "@/services/http";

export type NewUnitType = "apartment" | "room" | "suite";

export type UnitsFormValues = {
  propertyAccess: Array<{
    propertyId: string;
    units: string[]; // existing unit IDs (selected)
    newUnits: { label: string; type?: NewUnitType }[];
  }>;
};

export type PropertyListItem = {
  _id: string;
  name: string;
  addressLine?: string; // optional display string
  type?: string; // "residential" | "commercial" | etc. (optional)
};

export type UnitOption = { _id: string; label: string; property: string };

type ManageRowProps = {
  idx: number;
  businessId: string;
  form: UseFormReturn<UnitsFormValues>;
  property: PropertyListItem;
};

function ManageRow({ idx, businessId, form, property }: ManageRowProps) {
  const { control, setValue, register } = form;

  const propertyIdPath =
    `propertyAccess.${idx}.propertyId` as Path<UnitsFormValues>;
  const unitsPath = `propertyAccess.${idx}.units` as Path<UnitsFormValues>;
  const newUnitsPath =
    `propertyAccess.${idx}.newUnits` as Path<UnitsFormValues>;

  const propertyId = useWatch({ control, name: propertyIdPath }) as string;
  const selectedUnits = (useWatch({ control, name: unitsPath }) ??
    []) as string[];

  const { units = [], isFetchingUnits } = useFetchUnits(propertyId);

  const initializedRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    // if we already initialized for this property, bail
    if (initializedRef.current === propertyId) return;

    // when units arrive, set them if the form array is still empty
    if (units.length > 0) {
      const current = (form.getValues(unitsPath) as string[]) ?? [];
      if (current.length === 0) {
        form.setValue(
          unitsPath as any,
          units.map((u) => u._id),
          { shouldDirty: true, shouldValidate: true }
        );
      }
      initializedRef.current = propertyId; // mark initialized
    }
  }, [units, propertyId, form, unitsPath]);

  // Nested field-array for inline new unit inputs
  const {
    fields: newUnitFields,
    append: appendNewUnit,
    remove: removeNewUnit,
  } = useFieldArray({
    control,
    name: newUnitsPath as any,
  });

  const toggleUnit = (unitId: string) => {
    const next = new Set(selectedUnits);
    next.has(unitId) ? next.delete(unitId) : next.add(unitId);
    setValue(
      unitsPath,
      Array.from(next) as PathValue<UnitsFormValues, typeof unitsPath>,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{property.name}</CardTitle>
            {property.addressLine ? (
              <p className="text-sm text-muted-foreground">
                {property.addressLine}
              </p>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Existing Units */}
        <div>
          <ExistingUnitComponent
            units={units}
            isFetchingUnits={isFetchingUnits}
            propertyId={propertyId}
            businessId={businessId}
            toggleUnit={toggleUnit}
            selectedUnits={selectedUnits}
          />
        </div>
        <Separator />

        {/* Inline NEW units */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-3">
              <Label className="text-sm font-medium">New Units</Label>
              <Badge variant="outline" className="text-xs">
                {newUnitFields.length}
              </Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendNewUnit({ label: "", type: "apartment" })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add unit
            </Button>
          </div>

          {newUnitFields.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Use “Add unit” to create new unit labels for this property.
            </p>
          ) : (
            <div className="grid gap-2">
              {newUnitFields.map((nf, i) => {
                const labelPath =
                  `propertyAccess.${idx}.newUnits.${i}.label` as Path<UnitsFormValues>;
                const typePath =
                  `propertyAccess.${idx}.newUnits.${i}.type` as Path<UnitsFormValues>;
                return (
                  <div
                    key={nf.id}
                    className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg"
                  >
                    <Input
                      placeholder="e.g., Apt 3A, Suite 201"
                      {...register(labelPath as any, {
                        required: "Unit label is required",
                        minLength: {
                          value: 1,
                          message: "Unit label is required",
                        },
                      })}
                      className="flex-1"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeNewUnit(i)}
                      aria-label="Remove new unit input"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            New units will be created for this property on submit.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ExistingUnitComponent({
  propertyId,
  businessId,
  selectedUnits,
  toggleUnit,
  units,
  isFetchingUnits,
}: {
  propertyId: string;
  businessId: string;
  selectedUnits: string[];
  toggleUnit: (unitId: string) => void;
  units: UnitOption[];
  isFetchingUnits: boolean;
}) {
  let unitsContent = units.map((unit) => (
    <EditableUnitChip
      key={unit._id}
      unit={unit}
      selected={selectedUnits.includes(unit._id)}
      onToggle={toggleUnit}
      businessId={businessId}
      propertyId={propertyId}
    />
  ));

  if (isFetchingUnits) {
    unitsContent = [
      <span key="loading" className="text-sm text-muted-foreground">
        Loading…
      </span>,
    ];
  } else if (units.length === 0) {
    unitsContent = [
      <span key="empty" className="text-sm text-muted-foreground">
        No units found
      </span>,
    ];
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Existing Units</Label>
        <Badge variant="secondary" className="text-xs">
          {isFetchingUnits ? "…" : units.length}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">{unitsContent}</div>
    </div>
  );
}
// ---- Parent: renders all selected properties (from form.propertyAccess[]) ---
type Props = {
  form: UseFormReturn<UnitsFormValues>;
  businessId: string;
  properties: PropertyListItem[];
};

export function PropertyUnitGroupsFieldArray({
  form,
  businessId,
  properties,
}: Props) {
  const { control, setValue } = form;

  // Selected groups (already chosen in the Select step)
  const groups = useWatch({
    control,
    name: "propertyAccess",
  }) as UnitsFormValues["propertyAccess"];

  // index by id for fast lookup
  const byId = useMemo(() => {
    const m = new Map<string, PropertyListItem>();
    properties.forEach((p) => m.set(p._id, p));
    return m;
  }, [properties]);

  if (!groups?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No properties selected yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {groups.map((g, idx) => {
        const prop = byId.get(g.propertyId);

        if (!prop) return null;
        return (
          <ManageRow
            key={g.propertyId}
            idx={idx}
            businessId={businessId}
            form={form}
            property={prop}
          />
        );
      })}
    </div>
  );
}
