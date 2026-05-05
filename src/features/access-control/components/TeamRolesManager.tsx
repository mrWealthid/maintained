"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ErrorList from "@/components/ui/ErrorList";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetFooter,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import {
  formatWorkspaceRoleLabel,
  WORKSPACE_ROLE,
} from "@/shared/auth/roles";
import {
  WorkspaceRoleDefinitionPayloadSchema,
  type TeamWorkspaceRoleDefinition,
  type WorkspaceRoleDefinitionPayload,
} from "../models/access-control.model";
import {
  useArchiveWorkspaceRole,
  useCreateWorkspaceRole,
  useUpdateWorkspaceRole,
  useWorkspaceRoles,
} from "../hooks/use-access-control";
import AccessControlPageSkeleton from "./AccessControlPageSkeleton";

function getLegacyRoleIcon(role: TeamWorkspaceRoleDefinition["legacyRole"]) {
  if (role === WORKSPACE_ROLE.property_manager) return ShieldCheck;
  if (role === WORKSPACE_ROLE.accountant) return Wallet;
  return UserRound;
}

const EMPTY_ROLE_VALUES: WorkspaceRoleDefinitionPayload = {
  name: "",
  description: "",
  legacyRole: WORKSPACE_ROLE.member,
  permissions: [],
};

export default function TeamRolesManager() {
  const rolesQuery = useWorkspaceRoles();
  const createRole = useCreateWorkspaceRole();
  const updateRole = useUpdateWorkspaceRole();
  const archiveRole = useArchiveWorkspaceRole();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [archiveRoleId, setArchiveRoleId] = useState<string | null>(null);

  const roles = rolesQuery.data?.roles ?? [];
  const editingRole =
    roles.find((role) => role.id === editingRoleId) ?? null;
  const archiveTarget = roles.find((role) => role.id === archiveRoleId) ?? null;
  const permissionCatalog = rolesQuery.data?.permissionCatalog ?? [];

  const form = useForm<WorkspaceRoleDefinitionPayload>({
    resolver: zodResolver(WorkspaceRoleDefinitionPayloadSchema) as never,
    defaultValues: EMPTY_ROLE_VALUES,
    mode: "onChange",
  });

  useEffect(() => {
    if (!dialogOpen) {
      form.reset(EMPTY_ROLE_VALUES);
      return;
    }
    if (!editingRole) {
      form.reset(EMPTY_ROLE_VALUES);
      return;
    }
    form.reset({
      name: editingRole.name,
      description: editingRole.description,
      legacyRole: editingRole.legacyRole,
      permissions: editingRole.permissions,
    });
  }, [dialogOpen, editingRole, form]);

  const selectedPermissions = useWatch({
    control: form.control,
    name: "permissions",
  });
  const selectedPermissionSet = useMemo(
    () => new Set(selectedPermissions ?? []),
    [selectedPermissions],
  );
  const isSaving = createRole.isPending || updateRole.isPending;
  const showSkeleton = !rolesQuery.data && rolesQuery.isLoading;

  if (showSkeleton) return <AccessControlPageSkeleton />;

  let submitLabel = "Create role";
  if (editingRole) submitLabel = "Save role";
  if (isSaving) submitLabel = "Saving...";

  async function onSubmit(values: WorkspaceRoleDefinitionPayload) {
    if (editingRole) {
      await updateRole.mutateAsync({ id: editingRole.id, payload: values });
    } else {
      await createRole.mutateAsync(values);
    }
    setDialogOpen(false);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Workspace roles</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create custom access patterns and refine permissions for your
              workspace roles.
            </p>
          </div>

          <Sheet
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingRoleId(null);
            }}
          >
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingRoleId(null)}
              >
                <Plus className="mr-2 size-4" />
                Create role
              </Button>
            </SheetTrigger>

            <AppSheetContent
              side="right"
              className="w-full sm:w-[60vw]! sm:min-w-[760px] sm:max-w-none!"
            >
              <AppSheetHeader
                title={
                  editingRole
                    ? `Edit ${editingRole.name}`
                    : "Create workspace role"
                }
                description={
                  editingRole
                    ? "Adjust the permissions and behavior for this workspace role."
                    : "Create a reusable workspace role with a precise permission mix."
                }
                icon={editingRole ? Pencil : Plus}
              />

              <Form {...form} schema={WorkspaceRoleDefinitionPayloadSchema}>
                <form
                  className="flex h-full min-h-0 flex-col"
                  onSubmit={form.handleSubmit((values) =>
                    void onSubmit(values as WorkspaceRoleDefinitionPayload),
                  )}
                >
                  <AppSheetBody padded={false}>
                    <ScrollArea className="min-h-0 flex-1">
                      <div className="space-y-6 p-6">
                        <ErrorList
                          error={createRole.error || updateRole.error}
                          title={
                            editingRole
                              ? "Role update failed"
                              : "Role creation failed"
                          }
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role name</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={editingRole?.isSystem}
                                    placeholder="Field Operations Lead"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="legacyRole"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fallback role</FormLabel>
                                <FormControl>
                                  <select
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={editingRole?.isSystem}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                  >
                                    <option value={WORKSPACE_ROLE.member}>
                                      Member
                                    </option>
                                    <option value={WORKSPACE_ROLE.maintenance_coordinator}>
                                      Maintenance Coordinator
                                    </option>
                                    <option value={WORKSPACE_ROLE.accountant}>
                                      Accountant
                                    </option>
                                    <option value={WORKSPACE_ROLE.property_manager}>
                                      Property Manager
                                    </option>
                                  </select>
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                  Used for badges and team safety checks.
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  rows={3}
                                  placeholder="Explain what this role is intended to manage."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-medium text-foreground">
                              Permission matrix
                            </h3>
                            <Badge variant="plain">
                              {selectedPermissionSet.size} selected
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Dependencies are added automatically when a permission
                            requires another one.
                          </p>

                          <div className="space-y-5 rounded-xl border p-4">
                            {permissionCatalog.map((section) => (
                              <div key={section.id} className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <h4 className="text-sm font-medium text-foreground">
                                      {section.title}
                                    </h4>
                                    <p className="text-xs capitalize text-muted-foreground">
                                      {section.scope} access
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const current = new Set(
                                          form.getValues("permissions"),
                                        );
                                        const sectionKeys = section.permissions.map(
                                          (permission) => permission.key,
                                        );
                                        const allSelected = sectionKeys.every(
                                          (key) => current.has(key),
                                        );

                                        if (allSelected) {
                                          sectionKeys.forEach((key) =>
                                            current.delete(key),
                                          );
                                        } else {
                                          sectionKeys.forEach((key) =>
                                            current.add(key),
                                          );
                                        }

                                        form.setValue(
                                          "permissions",
                                          Array.from(current),
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        );
                                      }}
                                    >
                                      {section.permissions.every((permission) =>
                                        selectedPermissionSet.has(permission.key),
                                      )
                                        ? "Clear all"
                                        : "Select all"}
                                    </Button>
                                    <Badge variant="outline">
                                      {
                                        section.permissions.filter((permission) =>
                                          selectedPermissionSet.has(permission.key),
                                        ).length
                                      }
                                      /{section.permissions.length}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                  {section.permissions.map((permission) => {
                                    const checked = selectedPermissionSet.has(
                                      permission.key,
                                    );

                                    return (
                                      <label
                                        key={permission.key}
                                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 p-3 hover:bg-muted/40"
                                      >
                                        <Checkbox
                                          checked={checked}
                                          onCheckedChange={(nextChecked) => {
                                            const current = new Set(
                                              form.getValues("permissions"),
                                            );
                                            if (nextChecked) {
                                              current.add(permission.key);
                                            } else {
                                              current.delete(permission.key);
                                            }
                                            form.setValue(
                                              "permissions",
                                              Array.from(current),
                                              {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              },
                                            );
                                          }}
                                        />
                                        <div className="min-w-0 flex-1 space-y-1">
                                          <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="space-y-0.5">
                                              <span className="text-sm font-medium text-foreground">
                                                {permission.label}
                                              </span>
                                              <p className="truncate text-[11px] text-muted-foreground">
                                                {permission.key}
                                              </p>
                                            </div>
                                            <Badge
                                              variant="outline"
                                              className="capitalize"
                                            >
                                              {permission.riskLevel}
                                            </Badge>
                                          </div>
                                          <p className="text-xs leading-relaxed text-muted-foreground">
                                            {permission.description}
                                          </p>
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </AppSheetBody>

                  <AppSheetFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {submitLabel}
                    </Button>
                  </AppSheetFooter>
                </form>
              </Form>
            </AppSheetContent>
          </Sheet>
        </CardHeader>

        <CardContent className="space-y-4">
          <ErrorList error={rolesQuery.error} title="Role load error" />

          <div className="grid gap-4 lg:grid-cols-2">
            {roles.map((role) => {
              const RoleIcon = getLegacyRoleIcon(role.legacyRole);
              return (
                <div
                  key={role.id}
                  className="rounded-2xl border border-border/70 bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <RoleIcon className="size-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">
                            {role.name}
                          </h3>
                          <Badge variant="outline">
                            {formatWorkspaceRoleLabel(role.legacyRole)}
                          </Badge>
                          <Badge variant="plain">
                            {role.isSystem ? "System" : "Custom"}
                          </Badge>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {role.description || "No description added yet."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!role.locked ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingRoleId(role.id);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </Button>
                      ) : null}

                      {!role.locked && !role.isSystem ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setArchiveRoleId(role.id)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Archive
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{role.permissions.length} permissions</span>
                    <span>{role.memberCount} assigned members</span>
                    <span>{role.key}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ActionConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(open) => {
          if (!open) setArchiveRoleId(null);
        }}
        title={
          archiveTarget
            ? `Archive ${archiveTarget.name}?`
            : "Archive workspace role?"
        }
        description={
          archiveTarget
            ? `The ${archiveTarget.name} role will stop being available for new assignments.`
            : "Archive this workspace role."
        }
        confirmLabel={archiveRole.isPending ? "Archiving..." : "Archive role"}
        variant="destructive"
        icon={Trash2}
        isLoading={archiveRole.isPending}
        onConfirm={async () => {
          if (!archiveTarget) return;
          await archiveRole.mutateAsync(archiveTarget.id);
          setArchiveRoleId(null);
        }}
      />
    </>
  );
}
