"use client";
import * as React from "react";
import { FC, useMemo, useState } from "react";
import { z } from "zod";
import {
  useForm,
  useFieldArray,
  useWatch,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Building2, Home, Check, MapPin } from "lucide-react";

import { OnboardingPropWrapper } from "../model/model";
import {
  useCreatePropertyUnit,
  useFetchProperties,
} from "../hooks/onboardingHooks";
import {
  PropertyUnitGroupsFieldArray,
  type UnitsFormValues as ManageValues,
} from "./PropertyUnitGroupArray";

// ---- Zod + Types -----------------------------------------------------------
const newUnitSchema = z.object({
  label: z.string().min(1, "Unit label is required"),
  // type is optional; add enum if you need:
  // type: z.enum(["apartment","room","suite"]).optional(),
});

const formSchema = z.object({
  propertyAccess: z
    .array(
      z.object({
        propertyId: z.string().min(1),
        units: z.array(z.string()).default([]), // existing unit IDs
        newUnits: z.array(newUnitSchema).default([]),
      })
    )
    .min(1, "Select at least one property"),
});

export type UnitsFormValues = z.infer<typeof formSchema>;

// ---- Component -------------------------------------------------------------
type Step = "select" | "manage" | "review";

const UnitForm: FC<OnboardingPropWrapper<{ businessId: string }>> = ({
  businessId,
  successCallback,
  errorCallback,
}) => {
  const [step, setStep] = useState<Step>("select");

  const form = useForm<UnitsFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { propertyAccess: [] },
    mode: "onChange",
  });

  const { control } = form;

  // field array to manage propertyAccess selections
  const { fields, append, remove } = useFieldArray({
    control,
    name: "propertyAccess",
  });

  const groups = useWatch({
    control,
    name: "propertyAccess",
  }) as UnitsFormValues["propertyAccess"];

  const selectedIds = useMemo(
    () => new Set(groups.map((g) => g.propertyId)),
    [groups]
  );

  // fetch all properties for grid selection
  const { data: properties, isFetchingProperties } = useFetchProperties();

  const toggleProperty = (propertyId: string) => {
    const existingIdx = groups.findIndex((g) => g.propertyId === propertyId);
    if (existingIdx >= 0) {
      remove(existingIdx);
    } else {
      append({ propertyId, units: [], newUnits: [] });
    }
  };

  const { createUnit, isCreating } = useCreatePropertyUnit(false);

  async function onSubmit(values: UnitsFormValues) {
    try {
      const payload = {
        businessId,
        properties: values.propertyAccess.map((g) => ({
          propertyId: g.propertyId,
          unitIds: g.units,
          newUnitLabels: g.newUnits.map((n) => n.label),
        })),
      };
      createUnit(payload);
      successCallback?.();
    } catch (err) {
      errorCallback?.(err);
    }
  }

  function onError(err: any) {
    console.log(err);
  }

  // ---- Render --------------------------------------------------------------
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header + Step pills */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Property Units Setup</h1>
            <p className="text-muted-foreground">
              Configure units for your properties
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          {(["select", "manage", "review"] as Step[]).map((s, i) => {
            const active = step === s;
            return (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    active
                      ? "bg-button-primary text-button-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-current" />
                  {s === "select"
                    ? "Select Properties"
                    : s === "manage"
                      ? "Manage Units"
                      : "Review & Submit"}
                </div>
                {i < 2 && <div className="w-8 h-px bg-border" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step: SELECT */}
      {step === "select" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Select Properties</h2>
              <p className="text-muted-foreground">
                Choose which properties to configure
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {selectedIds.size} selected
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties?.data.map((property) => {
              const selected = selectedIds.has(property._id);
              return (
                <Card
                  key={property._id}
                  className={`cursor-pointer bg-card transition-all hover:shadow-lg ${
                    selected ? "ring-2 ring-primary " : "hover:bg-accent/50"
                  }`}
                  onClick={() => toggleProperty(property._id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">
                          {property.name}
                        </CardTitle>
                      </div>
                      {selected && (
                        <div className="p-1  bg-button-primary rounded-full">
                          <Check className="h-3 w-3 text-secondary" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {property.address.line1 ?? "—"}
                    </div>
                    <div className="flex items-center justify-between">
                      {property.type ? (
                        <Badge variant="outline" className="capitalize">
                          {property.type}
                        </Badge>
                      ) : (
                        <span />
                      )}
                      <div className="text-sm text-muted-foreground">
                        {/* Optional: fetch and show count here if your API returns it */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button
              variant={"outline"}
              onClick={() => setStep("manage")}
              disabled={selectedIds.size === 0}
              className="px-8"
            >
              Continue to Unit Management
            </Button>
          </div>
        </div>
      )}

      {/* Step: MANAGE */}
      {step === "manage" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Manage Units</h2>
              <p className="text-muted-foreground">
                View existing units and add new ones
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep("select")}>
                Back
              </Button>
              <Button variant={"outline"} onClick={() => setStep("review")}>
                Review Changes
              </Button>
            </div>
          </div>

          {/* This renders cards & inline inputs for each selected property */}
          <PropertyUnitGroupsFieldArray
            form={form as UseFormReturn<ManageValues>}
            businessId={businessId}
            properties={properties?.data!}
          />
        </div>
      )}

      {/* Step: REVIEW + SUBMIT */}
      {step === "review" && (
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-6"
          noValidate
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Review & Submit</h2>
              <p className="text-muted-foreground">
                Review your configuration before submitting
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep("manage")}>
                Back to Edit
              </Button>
              <Button
                variant={"outline"}
                type="submit"
                className="px-8"
                // disabled={!form.formState.isValid || isCreating}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Simple review summary using current form values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {selectedIds.size}
                </div>
                <div className="text-sm text-muted-foreground">
                  Properties Selected
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">
                  {groups.reduce((sum, g) => sum + g.units.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Existing Units Selected
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {groups.reduce((sum, g) => sum + g.newUnits.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  New Units to Create
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Optional: detailed per-property review list (similar to your mock) */}
        </form>
      )}
    </div>
  );
};

export default UnitForm;
