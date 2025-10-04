"use client";

import React, { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Building2 } from "lucide-react";
import { Property } from "../service/property-service";
import { PROPERTY_TYPES } from "@/app/shared/features/onboarding-feat/data/data";
import AddressField from "@/app/shared/components/address/AddressField";
import { AddressSchema } from "@/lib/validation/address";

const propertySchema = z.object({
  name: z.string().min(2, "Property name is required"),
  type: z.enum(PROPERTY_TYPES as any, {
    required_error: "Property type is required",
  }),
  address: AddressSchema,
  code: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: PropertyFormValues) => void;
  isLoading?: boolean;
}

const PropertyForm: FC<PropertyFormProps> = ({
  property,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: property?.name ?? "",
      type: property?.type ?? undefined,
      address: property?.address ?? {
        line1: "",
        line2: "",
        city: "",
        postalCode: "",
        country: "United States",
        lat: null,
        lng: null,
        placeId: "",
        state: "NC",
      },
      code: property?.code || "",
    },
  });
  // const form = useForm<PropertyFormValues>({
  //   resolver: zodResolver(propertySchema),
  //   mode: "onChange",
  //   defaultValues: {
  //     address: {
  //       line1: "",
  //       line2: "",
  //       city: "",
  //       postalCode: "",
  //       lat: null,
  //       lng: null,
  //       placeId: "",
  //     },
  //   },
  // });
  return (
    <div className="flex items-center justify-center">
      <div className=" w-full max-w-6xl space-y-6 ">
        <div className="flex items-center  gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {property ? "Edit Property" : "Add Property"}
            </h2>
            <p className="text-muted-foreground">
              {property
                ? "Update property information"
                : "Add a new property to your portfolio"}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Property Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 2333 Chestnut Street Apartments"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Property Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {type.replaceAll("_", " ")}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Property Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Code (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., APT-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Property Address</Label>
              <AddressField
                namePrefix="address"
                proximity={{ lng: -79.792, lat: 36.0726 }}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="submit"
                disabled={!form.formState.isValid || isLoading}
                className="px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {property ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    {property ? "Update Property" : "Create Property"}
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

export default PropertyForm;
