"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MailPlus, ShieldCheck, User, Wallet } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ErrorList from "@/components/ui/ErrorList";
import AppPageHeader from "@/shared/components/app-header/AppPageHeader";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import { WORKSPACE_ROLE } from "@/shared/auth/roles";
import {
  TeamInvitePayloadSchema,
  type TeamInvitePayload,
} from "../models/team.model";
import { useInviteTeamMember, useTeamOverview } from "../hooks/use-team";
import TeamList from "./TeamList";

export default function TeamManagementPageClient() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const overviewQuery = useTeamOverview();
  const inviteMutation = useInviteTeamMember();

  const form = useForm<TeamInvitePayload>({
    resolver: zodResolver(TeamInvitePayloadSchema),
    defaultValues: {
      name: "",
      email: "",
      role: WORKSPACE_ROLE.member,
    },
    mode: "onChange",
  });

  const meta = overviewQuery.data?.meta;
  const roleOptions = [
    {
      value: WORKSPACE_ROLE.member,
      label: "Member",
      description:
        "Read-only access — view tickets and properties without administrative controls.",
      icon: User,
    },
    {
      value: WORKSPACE_ROLE.maintenance_coordinator,
      label: "Maintenance Coordinator",
      description:
        "Triages tickets and assigns technicians. No billing access.",
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

  useEffect(() => {
    if (!meta) return;
    form.setValue("role", meta.defaultRoleForNewMembers);
  }, [form, meta]);

  async function onInviteSubmit(values: TeamInvitePayload) {
    await inviteMutation.mutateAsync(values);
    form.reset({
      name: "",
      email: "",
      role: meta?.defaultRoleForNewMembers ?? WORKSPACE_ROLE.member,
    });
    setInviteOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <AppPageHeader name="Team Management" />
          <p className="text-sm text-muted-foreground">
            Invite workspace members, assign roles, and manage team lifecycle.
          </p>
        </div>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <MailPlus className="mr-2 size-4" />
              Invite Team Member
            </Button>
          </DialogTrigger>
          <AppDialogContent>
            <AppDialogHeader
              title="Invite team member"
              description="Send an onboarding invite to a new workspace member."
              icon={MailPlus}
            />

            <Form {...form} schema={TeamInvitePayloadSchema}>
              <form
                className="space-y-0"
                onSubmit={form.handleSubmit(
                  (values) => void onInviteSubmit(values),
                )}
              >
                <AppDialogBody>
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
                            className="grid gap-3 sm:grid-cols-2"
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
                </AppDialogBody>

                <AppDialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInviteOpen(false)}
                    disabled={inviteMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviteMutation.isPending}>
                    {inviteMutation.isPending ? "Sending..." : "Send invite"}
                  </Button>
                </AppDialogFooter>
              </form>
            </Form>
          </AppDialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace members</CardTitle>
          <CardDescription>
            {meta?.businessName
              ? `${meta.businessName} team roster`
              : "Team roster"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ErrorList error={overviewQuery.error} title="Team load error" />
          <TeamList inviteAllowed={meta?.allowTeamInvitations ?? true} />
        </CardContent>
      </Card>
    </div>
  );
}
