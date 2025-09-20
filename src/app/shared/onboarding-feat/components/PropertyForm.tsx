import React, { FC, useState } from "react";
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
import { AddressSchema } from "@/lib/validation/address";
import AddressField from "../../components/address/AddressField";
import { useCreateProperty } from "../hooks/onboardingHooks";
import { OnboardingPropWrapper } from "../model/model";
import { PROPERTY_TYPES } from "../data/data";

const PropertyForm: FC<OnboardingPropWrapper<{ businessId: string }>> = ({
  businessId,
  successCallback,
  errorCallback,
  onCloseModal,
}) => {
  const propertySchema = z.object({
    // businessId: z.string().min(1),
    type: z.enum(PROPERTY_TYPES as any),
    name: z.string().min(2, "Name required"),
    address: AddressSchema,
  });

  type PropertyFormValues = z.infer<typeof propertySchema>;

  // const [submitting, setSubmitting] = useState(false);
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
  } = form;

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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="grid gap-3"
      >
        <div className="grid gap-2">
          <Label>Type</Label>
          <Select onValueChange={(v) => form.setValue("type", v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="e.g., 2333 Chestnut Street"
          />
        </div>

        <div className="grid gap-2">
          <div className="">
            <p className="text-xs text-muted-foreground mb-2">Address (US)</p>
            <AddressField
              namePrefix="address"
              proximity={{ lng: -79.792, lat: 36.0726 }} // optional bias
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onCloseModal?.()}
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button type="submit" variant={"outline"} disabled={!isValid}>
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default PropertyForm;
