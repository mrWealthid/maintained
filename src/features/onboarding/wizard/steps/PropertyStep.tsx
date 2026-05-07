"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Home, Loader2, MapPin, Train } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddressSchema } from "@/lib/validation/address";
import AddressField from "@/shared/components/address/AddressField";
import { useCreateProperty } from "@/features/onboarding/hooks/onboardingHooks";
import { PROPERTY_TYPES } from "@/features/onboarding/data/data";

const propertySchema = z.object({
  type: z.enum(PROPERTY_TYPES as unknown as [string, ...string[]]),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  address: AddressSchema,
});

type PropertyFormValues = z.infer<typeof propertySchema>;

const TYPE_OPTIONS: Array<{
  value: (typeof PROPERTY_TYPES)[number];
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: "HOUSE",
    label: "Single home",
    description: "One dwelling, one address. Auto-creates a default unit.",
    icon: Home,
  },
  {
    value: "BUILDING",
    label: "Building",
    description: "Multiple units inside one address.",
    icon: Building2,
  },
  {
    value: "STATION",
    label: "Station",
    description: "Bays, suites or commercial spaces.",
    icon: Train,
  },
];

type Props = {
  onCreated: (property: {
    id: string;
    name: string;
    type: (typeof PROPERTY_TYPES)[number];
  }) => void;
};

export default function PropertyStep({ onCreated }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema) as never,
    mode: "onChange",
    defaultValues: {
      type: undefined,
      name: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        postalCode: "",
        lat: null,
        lng: null,
        placeId: "",
      } as never,
    },
  });

  const {
    formState: { errors, isValid },
    register,
    setValue,
    watch,
  } = form;

  const selectedType = watch("type");

  const { createProperty, isCreating } = useCreateProperty(false);

  const onSubmit = (values: PropertyFormValues) => {
    const a = values.address;
    createProperty(
      {
        type: values.type,
        name: values.name,
        address: {
          line1: a.line1,
          line2: a.line2 || "",
          city: a.city,
          state: a.state,
          postalCode: a.postalCode,
          countryCode: a.countryCode,
          country: a.country,
          placeId: a.placeId,
          lat: a.lat ?? null,
          lng: a.lng ?? null,
        },
        propertyAddress: [a.line1, a.city, a.state, a.postalCode]
          .filter(Boolean)
          .join(", "),
      },
      {
        onSuccess: (response: { data?: { id?: string; _id?: string } }) => {
          const created = response?.data;
          const id = created?.id ?? created?._id;
          if (!id) {
            toast.error("Property created but no id returned. Refresh to continue.");
            return;
          }
          onCreated({
            id,
            name: values.name,
            type: values.type as (typeof PROPERTY_TYPES)[number],
          });
        },
        onError: (err: Error) => toast.error(err.message),
      },
    );
  };

  return (
    <section aria-labelledby="property-step-heading" className="space-y-6">
      <header className="space-y-1">
        <h2
          id="property-step-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-semibold focus:outline-none"
        >
          Add your first property
        </h2>
        <p className="text-sm text-muted-foreground">
          What you add here is what tenants and tickets will be tied to. You can add more in Settings later.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Property type</legend>
            <div role="radiogroup" aria-label="Property type" className="grid gap-3 sm:grid-cols-3">
              {TYPE_OPTIONS.map(({ value, label, description, icon: Icon }) => {
                const isSelected = selectedType === value;
                return (
                  <button
                    type="button"
                    key={value}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() =>
                      setValue("type", value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border bg-card p-4 text-left transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border/70 hover:border-border",
                    )}
                  >
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">
                      {description}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.type ? (
              <p className="text-xs text-destructive" role="alert">
                {errors.type.message as string}
              </p>
            ) : null}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="property-name">
              Property name<span aria-hidden="true" className="ml-0.5 text-destructive">*</span>
            </Label>
            <Input
              id="property-name"
              {...register("name")}
              placeholder="e.g. 2333 Chestnut Street"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "property-name-error" : undefined}
              className="h-11"
            />
            {errors.name ? (
              <p id="property-name-error" className="text-xs text-destructive" role="alert">
                {errors.name.message as string}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              Address
            </Label>
            <AddressField namePrefix="address" />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isValid || isCreating}
              className="px-8"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save and continue"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
