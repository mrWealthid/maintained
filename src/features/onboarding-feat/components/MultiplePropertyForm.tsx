"use client";
import React, { FC, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Building2, Loader2, MapPin, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddressSchema } from "@/lib/validation/address";
import AddressField from "@/shared/components/address/AddressField";
import { useCreateMultipleProperties } from "../hooks/onboardingHooks";
import { OnboardingPropWrapper } from "../model/model";
import { PROPERTY_TYPES } from "../data/data";

const propertySchema = z.object({
  type: z.enum(PROPERTY_TYPES as any),
  name: z.string().min(2, "Name required"),
  address: AddressSchema,
});

const multiplePropertiesSchema = z.object({
  properties: z
    .array(propertySchema)
    .min(1, "At least one property is required"),
});

type MultiplePropertiesFormValues = z.infer<typeof multiplePropertiesSchema>;

// Map Preview using iframe to avoid DOM manipulation issues
const MapPreview: FC<{
  lat: number | null;
  lng: number | null;
  address: string;
}> = ({ lat, lng, address }) => {
  if (!lat || !lng) {
    return (
      <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-6 w-6 mx-auto mb-1" />
          <p className="text-xs">Select address to see preview</p>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}&center=${lat},${lng}&zoom=15&maptype=roadmap`;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" />
        <span>Location Preview</span>
      </div>
      <div className="h-32 w-full rounded-lg border overflow-hidden">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Property Location"
        />
      </div>
    </div>
  );
};

const MultiplePropertyForm: FC<
  OnboardingPropWrapper<{ businessId: string }>
> = ({ businessId, successCallback, errorCallback, onCloseModal }) => {
  const form = useForm<MultiplePropertiesFormValues>({
    resolver: zodResolver(multiplePropertiesSchema),
    mode: "onChange",
    defaultValues: {
      properties: [
        {
          name: "",
          type: undefined,
          address: {
            line1: "",
            line2: "",
            city: "",
            state: "CA",
            postalCode: "",
            country: "United States",
            lat: null,
            lng: null,
            placeId: "",
          },
        },
      ],
    },
  });

  const {
    control,
    watch,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "properties",
  });

  const { createMultipleProperties, isCreating } =
    useCreateMultipleProperties(false);

  function formatSingleLineAddress(a: z.infer<typeof AddressSchema>) {
    const cityStateZip = [a.city, a.state, a.postalCode]
      .filter(Boolean)
      .join(" ");
    return [a.line1, cityStateZip].filter(Boolean).join(", ");
  }

  async function onSubmit(values: MultiplePropertiesFormValues) {
    try {
      const propertiesData = values.properties.map(
        ({ address, type, name }) => {
          const addressStructured = {
            line1: address.line1,
            line2: address.line2 || "",
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: "United States",
            placeId: address.placeId,
            lat: address.lat ?? null,
            lng: address.lng ?? null,
          };

          return {
            address: addressStructured,
            type: type,
            name: name,
            propertyAddress: formatSingleLineAddress(address),
          };
        }
      );

      createMultipleProperties(
        { properties: propertiesData },
        {
          onSuccess: () => successCallback?.(),
          onError: (err) => errorCallback?.(err),
        }
      );
    } catch (e: any) {
      toast("Failed to create properties", { description: e.message });
    }
  }

  function onError(err: any) {
    console.log(err);
  }

  const addProperty = () => {
    append({
      name: "",
      type: undefined,
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "CA", // Default to a valid state abbreviation
        postalCode: "",
        country: "United States",
        lat: null,
        lng: null,
        placeId: "",
      },
    });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Add Multiple Properties</h1>
              <p className="text-muted-foreground">
                Create multiple properties at once
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            {/* Properties List */}
            <div className="space-y-6">
              {fields.map((field, index) => {
                const address = watch(`properties.${index}.address`);
                const showMapPreview = address?.lat && address?.lng;

                return (
                  <div
                    key={field.id}
                    className="border rounded-lg p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Property {index + 1}
                      </h3>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Property Type */}
                      <div className="space-y-2">
                        <Label
                          htmlFor={`properties.${index}.type`}
                          className="text-sm font-medium"
                        >
                          Property Type
                        </Label>
                        <Select
                          onValueChange={(v) =>
                            form.setValue(`properties.${index}.type`, v as any)
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Choose property type" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROPERTY_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  {t.replaceAll("_", " ")}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {typeof errors.properties?.[index]?.type === "object" &&
                          "message" in
                            (errors.properties?.[index]?.type ?? {}) && (
                            <p className="text-xs text-destructive">
                              {
                                (
                                  errors.properties?.[index]?.type as {
                                    message?: string;
                                  }
                                )?.message
                              }
                            </p>
                          )}
                      </div>

                      {/* Property Name */}
                      <div className="space-y-2">
                        <Label
                          htmlFor={`properties.${index}.name`}
                          className="text-sm font-medium"
                        >
                          Property Name
                        </Label>
                        <Input
                          {...form.register(`properties.${index}.name`)}
                          placeholder="e.g., 2333 Chestnut Street Apartments"
                          className="h-11"
                        />
                        {errors.properties?.[index]?.name && (
                          <p className="text-xs text-destructive">
                            {errors.properties[index]?.name?.message as string}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Property Address
                      </Label>
                      <AddressField
                        namePrefix={`properties.${index}.address`}
                        proximity={{ lng: -79.792, lat: 36.0726 }}
                      />

                      {/* Map Preview */}
                      {showMapPreview && (
                        <div className="mt-4">
                          <MapPreview
                            lat={address.lat ?? null}
                            lng={address.lng ?? null}
                            address={formatSingleLineAddress(address)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Property Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={addProperty}
                className="px-8"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Property
              </Button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-6">
              <Button
                onClick={() => onCloseModal?.()}
                type="button"
                variant="outline"
                className="px-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isValid || isCreating}
                className="px-8"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating {fields.length} Properties...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create {fields.length} Properties
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default MultiplePropertyForm;
