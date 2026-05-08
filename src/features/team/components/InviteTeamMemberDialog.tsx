"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailPlus, ShieldCheck, User, Wallet, Wrench } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetFooter,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import { USER_TYPE, WORKSPACE_ROLE } from "@/shared/auth/roles";
import {
  TeamInvitePayloadSchema,
  type TeamInvitePayload,
  type TeamInviteRole,
} from "../models/team.model";
import { useInviteTeamMember } from "../hooks/use-team";

const roleOptions = [
  {
    value: WORKSPACE_ROLE.member,
    label: "Member",
    description:
      "Read-only access - view tickets and properties without administrative controls.",
    icon: User,
  },
  {
    value: USER_TYPE.technician,
    label: "Technician",
    description:
      "Service-provider access - can review assigned work, schedules, and quote requests.",
    icon: Wrench,
  },
  {
    value: WORKSPACE_ROLE.maintenance_coordinator,
    label: "Maintenance Coordinator",
    description: "Triages tickets and assigns technicians. No billing access.",
    icon: ShieldCheck,
  },
  {
    value: WORKSPACE_ROLE.accountant,
    label: "Accountant",
    description:
      "Financial reporting, invoicing, and payouts without team management.",
    icon: Wallet,
  },
  {
    value: WORKSPACE_ROLE.property_manager,
    label: "Property Manager",
    description:
      "Day-to-day administrator. Can manage properties, units, and the team.",
    icon: ShieldCheck,
  },
] as const;

export function InviteTeamMemberDialog({
  trigger,
  defaultRole = WORKSPACE_ROLE.member,
  onInvited,
}: {
  trigger: React.ReactNode;
  defaultRole?: TeamInviteRole;
  onInvited?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const inviteMutation = useInviteTeamMember();
  const form = useForm<TeamInvitePayload>({
    resolver: zodResolver(TeamInvitePayloadSchema),
    defaultValues: {
      name: "",
      email: "",
      role: defaultRole,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!open) return;
    form.setValue("role", defaultRole);
  }, [defaultRole, form, open]);

  async function onInviteSubmit(values: TeamInvitePayload) {
    await inviteMutation.mutateAsync(values);
    form.reset({
      name: "",
      email: "",
      role: defaultRole,
    });
    setOpen(false);
    onInvited?.();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <AppSheetContent side="right" className="sm:max-w-xl">
        <AppSheetHeader
          title="Invite team member"
          description="Send an onboarding invite to a new workspace member."
          icon={MailPlus}
        />

        <Form {...form} schema={TeamInvitePayloadSchema}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit((values) =>
              void onInviteSubmit(values),
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
                      <Input
                        type="email"
                        placeholder="jordan@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid gap-3"
                      >
                        {roleOptions.map((option) => {
                          const Icon = option.icon;
                          const isSelected = field.value === option.value;
                          return (
                            <label
                              key={option.value}
                              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-muted-foreground/30"
                              }`}
                            >
                              <RadioGroupItem
                                value={option.value}
                                className="mt-0.5"
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Icon className="size-4 text-primary" />
                                  <span className="font-medium text-foreground">
                                    {option.label}
                                  </span>
                                </div>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                  {option.description}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AppSheetBody>

            <AppSheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
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
