import React, { FC, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  MailCheck,
  Building2,
  ListPlus,
  Users,
  UserPlus,
  CheckCircle2,
  Loader2,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddressSchema } from "@/lib/validation/address";
import AddressField from "../../components/address/AddressField";
import { useCreateProperty } from "../hooks/onboardingHooks";
import { OnboardingPropWrapper } from "../model/model";
import { PROPERTY_TYPES } from "../data/data";

// Map Preview using iframe to avoid DOM manipulation issues
const MapPreview: FC<{
  lat: number | null;
  lng: number | null;
  address: string;
}> = ({ lat, lng, address }) => {
  if (!lat || !lng) {
    return (
      <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Select an address to see map preview</p>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}&center=${lat},${lng}&zoom=15&maptype=roadmap`;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>Location Preview</span>
      </div>
      <div className="h-48 w-full rounded-lg border overflow-hidden">
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

const PropertyForm: FC<OnboardingPropWrapper<{ businessId: string }>> = ({
  businessId,
  successCallback,
  errorCallback,
  onCloseModal,
}) => {
  const propertySchema = z.object({
    type: z.enum(PROPERTY_TYPES as any),
    name: z.string().min(2, "Name required"),
    address: AddressSchema,
  });

  type PropertyFormValues = z.infer<typeof propertySchema>;

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    mode: "onChange",
    defaultValues: {
      address: {
        line1: "",
        line2: "",
        city: "",
        postalCode: "",
        lat: null,
        lng: null,
        placeId: "",
      },
    },
  });

  const {
    formState: { errors, isValid },
    watch,
  } = form;

  // Watch address values for map preview
  const address = watch("address");
  const showMapPreview = address?.lat && address?.lng;

  function formatSingleLineAddress(a: z.infer<typeof AddressSchema>) {
    const cityStateZip = [a.city, a.state, a.postalCode]
      .filter(Boolean)
      .join(" ");
    return [a.line1, cityStateZip].filter(Boolean).join(", ");
  }

  const { createProperty, isCreating } = useCreateProperty(false);

  async function onSubmit(values: PropertyFormValues) {
    const { address, type, name } = values;
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
    try {
      createProperty(
        {
          address: addressStructured,
          type: type,
          name: name,
          propertyAddress: formatSingleLineAddress(address),
        },
        {
          onSuccess: () => successCallback?.(),
          onError: (err) => errorCallback?.(err),
        }
      );
    } catch (e: any) {
      toast("Failed to create property", { description: e.message });
    }
  }

  function onError(err: any) {
    console.log(err);
  }

  return (
    <div className="h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Add New Property</h1>
              <p className="text-muted-foreground">
                Create your first property to get started
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            {/* Property Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Property Type
              </Label>
              <Select onValueChange={(v) => form.setValue("type", v as any)}>
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
              {errors.type && (
                <p className="text-xs text-destructive">
                  {errors.type.message as string}
                </p>
              )}
            </div>

            {/* Property Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Property Name
              </Label>
              <Input
                {...form.register("name")}
                placeholder="e.g., 2333 Chestnut Street Apartments"
                className="h-11"
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message as string}
                </p>
              )}
            </div>

            {/* Address Section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Property Address</Label>
              <AddressField
                namePrefix="address"
                proximity={{ lng: -79.792, lat: 36.0726 }}
              />

              {/* Map Preview */}
              {address.lat && address.lng && (
                <div className="mt-4">
                  <MapPreview
                    lat={address.lat}
                    lng={address.lng}
                    address={formatSingleLineAddress(address)}
                  />
                </div>
              )}
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
                disabled={!isValid || isCreating}
                className="px-8"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Property
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
