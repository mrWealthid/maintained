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
import { Loader2, Home, Building2 } from "lucide-react";
import { Unit } from "../service/unit-service";
import { useFetchProperties } from "../hooks/propertyHooks";
import { Property } from "../service/property-service";

const unitSchema = z.object({
  label: z.string().min(1, "Unit label is required"),
  propertyId: z.string().min(1, "Property is required"),
  floor: z.string().optional(),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface UnitFormProps {
  unit?: Unit;
  onSubmit: (data: UnitFormValues) => void;
  isLoading?: boolean;
}

const UnitForm: FC<UnitFormProps> = ({ unit, onSubmit, isLoading = false }) => {
  const { data: propertiesData } = useFetchProperties();
  const properties = propertiesData?.data || [];

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      label: unit?.label || "",
      propertyId: unit?.property?._id || "",
      floor: unit?.floor || "",
    },
  });

  return (
    <div className="flex items-center justify-center">
      <div className=" w-full max-w-6xl space-y-6 ">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {unit ? "Edit Unit" : "Add Unit"}
            </h2>
            <p className="text-muted-foreground">
              {unit
                ? "Update unit information"
                : "Add a new unit to a property"}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unit Label */}
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Label</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Apt 101, Unit A, Suite 200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Floor */}
              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 1st Floor, Ground Floor"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Property Selection */}
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties.map((property: Property) => (
                        <SelectItem key={property._id} value={property._id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{property.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {property.address?.line1},{" "}
                                {property.address?.city}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    {unit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Home className="h-4 w-4 mr-2" />
                    {unit ? "Update Unit" : "Create Unit"}
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

export default UnitForm;
