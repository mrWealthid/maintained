"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home, MailPlus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetFooter,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import { usePropertyList } from "@/features/properties/hooks/use-properties";
import { useUnitList } from "@/features/units/hooks/use-units";
import { tenantInviteFormSchema, type TenantInviteFormValues } from "../models/tenant-form.model";
import { useInviteTenant } from "../hooks/use-tenants";

export function InviteTenantSheet({
  open,
  onOpenChange,
  trigger,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
}) {
  const inviteMutation = useInviteTenant();
  const form = useForm<TenantInviteFormValues>({
    resolver: zodResolver(tenantInviteFormSchema) as never,
    defaultValues: {
      name: "",
      email: "",
      property: "",
      unit: "",
      accessibleUnits: [],
    },
    mode: "onChange",
  });
  const property = form.watch("property");
  const propertiesQuery = usePropertyList({ page: 1, limit: 100 });
  const unitsQuery = useUnitList({
    page: 1,
    limit: 100,
    property: property || undefined,
  });
  const properties = propertiesQuery.data?.data ?? [];
  const units = unitsQuery.data?.data ?? [];

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [form, open]);

  async function onSubmit(values: TenantInviteFormValues) {
    await inviteMutation.mutateAsync(values);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <AppSheetContent side="right" className="sm:max-w-xl">
        <AppSheetHeader
          title="Invite tenant"
          description="Tie the resident to a workspace property and unit."
          icon={MailPlus}
        />
        <Form {...form} schema={tenantInviteFormSchema}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit((values: TenantInviteFormValues) =>
              void onSubmit(values),
            )}
          >
            <AppSheetBody>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jordan Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tenant@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="property"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select
                      value={field.value}
                      disabled={propertiesQuery.isLoading}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("unit", "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((item: { _id?: string; id?: string; name: string }) => (
                          <SelectItem key={item._id ?? item.id} value={(item._id ?? item.id) as string}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      value={field.value}
                      disabled={!property || unitsQuery.isLoading}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={property ? "Select unit" : "Select property first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((item: { _id?: string; id?: string; label: string; tenantActive?: boolean }) => (
                          <SelectItem
                            key={item._id ?? item.id}
                            value={(item._id ?? item.id) as string}
                            disabled={item.tenantActive}
                          >
                            {item.label}
                            {item.tenantActive ? " (occupied)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Home className="mt-0.5 size-4 shrink-0" />
                  <p>
                    Tenant access is scoped to this workspace and unit. They can raise and track maintenance tickets for their residence.
                  </p>
                </div>
              </div>
            </AppSheetBody>
            <AppSheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={inviteMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Sending..." : "Send invite"}
              </Button>
            </AppSheetFooter>
          </form>
        </Form>
      </AppSheetContent>
    </Sheet>
  );
}
