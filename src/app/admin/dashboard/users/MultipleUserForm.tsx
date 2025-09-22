"use client";
import React, { FC, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCreateMultipleUsers } from "./hooks/userHooks";
import { ROLES } from "@/app/shared/enums/enums";

import { useAppContext } from "@/app/shared/contexts/AppContext";

// Keep your existing ButtonComponent for actions
import ButtonComponent from "@/app/shared/components/form-elements/Button";
import { CreateMultipleUsersPayload } from "@/app/shared/model/model";

// ----------------------
// Config
// ----------------------
const SPECIALTIES = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "HVAC",
  "Painter",
  "Locksmith",
  "Roofer",
  "Appliance Repair",
  "General Contractor",
  "Landscaper",
  "Pest Control",
] as const;

// React Query fetchers
async function fetchProperties(businessId: string) {
  const res = await fetch(`/api/properties?businessId=${businessId}`);
  if (!res.ok) throw new Error("Failed to load properties");
  const json = await res.json();
  return (json.data ?? []) as Array<{ _id: string; name: string }>;
}

async function fetchUnits(businessId: string, propertyId: string) {
  const res = await fetch(
    `/api/units?businessId=${businessId}&propertyId=${propertyId}`
  );
  if (!res.ok) throw new Error("Failed to load units");
  const json = await res.json();
  return (json.data ?? []) as Array<{
    _id: string;
    label: string;
    property: string;
  }>;
}

// Clickable badge multi-select for specialties
const SpecialtyBadges: FC<{
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  error?: string;
}> = ({ value = [], onChange, disabled, error }) => {
  const selected = useMemo(() => new Set(value), [value]);

  function toggle(item: string) {
    const next = new Set(selected);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    onChange(Array.from(next));
  }

  const selectedList = Array.from(selected);
  const collapsed = selectedList.length > 4;
  const visibleSelected = collapsed ? selectedList.slice(0, 3) : selectedList;
  const hiddenCount = collapsed ? selectedList.length - 3 : 0;

  return (
    <div className="w-full space-y-2">
      <Label>Specialties</Label>

      {/* Selection grid: clickable chips with a checkmark when selected */}
      <div className="flex flex-wrap gap-2">
        {SPECIALTIES.map((sp) => {
          const isOn = selected.has(sp);
          return (
            <button
              key={sp}
              type="button"
              disabled={disabled}
              onClick={() => toggle(sp)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(sp);
                }
              }}
              aria-pressed={isOn}
              aria-label={`${sp} ${isOn ? "selected" : "not selected"}`}
              className={[
                "inline-flex items-center gap-2 rounded-2xl border px-3 py-1 text-sm transition",
                "focus:outline-none focus:ring-1 focus:ring-offset-2",
                isOn
                  ? "bg-button-primary hover:bg-button-accent text-button-primary-foreground"
                  : "bg-background text-foreground border-muted",
                disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-sm",
              ].join(" ")}
            >
              {isOn ? (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground/20">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden>
                    <path
                      d="M20 6L9 17l-5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : null}
              <span>{sp}</span>
            </button>
          );
        })}
      </div>

      {/* Selected summary badges */}
      {!!selectedList.length && (
        <div
          className="flex flex-wrap items-center gap-2 pt-1"
          aria-live="polite"
        >
          <span className="text-sm font-semi">Selected:</span>
          {visibleSelected.map((sp) => (
            <Badge key={sp} variant="outline" className="rounded-xl pr-1">
              {sp}
              <button
                type="button"
                className="ml-1 grid h-5 w-5 place-items-center rounded-sm hover:bg-muted"
                onClick={() => toggle(sp)}
                aria-label={`Remove ${sp}`}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </Badge>
          ))}
          {collapsed && (
            <Badge variant="outline" className="rounded-xl">
              {selectedList.length} selected (+{hiddenCount} more)
            </Badge>
          )}
          {!collapsed && selectedList.length === 4 && (
            <Badge variant="outline" className="rounded-xl">
              4 selected
            </Badge>
          )}
        </div>
      )}

      {error ? (
        <p className="text-sm text-destructive" aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  );
};

interface MultipleUserFormProps {
  onCloseModal?: () => void;
  successCallback?: (result?: any) => void;
  errorCallback?: (err: unknown) => void;
}

const MultipleUserForm: FC<MultipleUserFormProps> = ({
  onCloseModal,
  successCallback,
  errorCallback,
}) => {
  const { user: me } = useAppContext();
  const businessId = me?.currentBusiness?.id;

  const form = useForm<CreateMultipleUsersPayload>({
    mode: "onChange",
    defaultValues: {
      users: [
        {
          name: "",
          email: "",
          role: ROLES.user,
          specialties: [],
          propertyId: "",
          unitId: "",
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
    name: "users",
  });

  const { createMultipleUsers, isCreating } = useCreateMultipleUsers(false);

  // Watch all users for property/unit dependencies
  const watchedUsers = watch("users");

  // React Query: list properties for business (only when inviting USERS)
  const { data: properties = [], isFetching: isPropsFetching } = useQuery({
    queryKey: ["properties", businessId],
    queryFn: () => fetchProperties(businessId as string),
    enabled: Boolean(businessId),
    staleTime: 5 * 60 * 1000,
  });

  // Get all unique property IDs that need units loaded
  const propertyIds = watchedUsers
    .filter((user) => user?.role === ROLES.user && user?.propertyId)
    .map((user) => user.propertyId)
    .filter(Boolean);

  // React Query: list units for all selected properties
  const { data: allUnits = [], isFetching: isUnitsFetching } = useQuery({
    queryKey: ["units", businessId, propertyIds],
    queryFn: async () => {
      const unitsPromises = propertyIds.map((propertyId) =>
        fetchUnits(businessId as string, propertyId as string)
      );
      const unitsArrays = await Promise.all(unitsPromises);
      return unitsArrays.flat();
    },
    enabled: Boolean(businessId && propertyIds.length > 0),
    staleTime: 5 * 60 * 1000,
  });

  function onSubmit(data: CreateMultipleUsersPayload) {
    createMultipleUsers(data, {
      onSuccess: (result) => successCallback?.(result),
      onError: (err) => errorCallback?.(err),
    });
  }

  function onError(err: unknown) {
    console.log(err);
  }

  const addUser = () => {
    append({
      name: "",
      email: "",
      role: ROLES.user,
      specialties: [],
      propertyId: "",
      unitId: "",
    });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 " />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Add Multiple Users</h1>
              <p className="text-muted-foreground">
                Invite multiple users to your business at once
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-6"
        >
          {/* Users List */}
          <div className="space-y-6">
            {fields.map((field, index) => {
              const currentUser = watchedUsers[index];
              const currentRole = currentUser?.role;

              // Filter units for the current user's selected property
              const units = allUnits.filter(
                (unit) => unit.property === currentUser?.propertyId
              );

              return (
                <div key={field.id} className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">User {index + 1}</h3>
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
                    {/* Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor={`users.${index}.name`}
                        className="text-sm font-medium"
                      >
                        Enter Name
                      </Label>
                      <Input
                        {...form.register(`users.${index}.name`, {
                          required: "This field is required",
                        })}
                        placeholder="Enter Full Name"
                        className="h-11"
                      />
                      {errors.users?.[index]?.name && (
                        <p className="text-xs text-destructive">
                          {errors.users[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label
                        htmlFor={`users.${index}.email`}
                        className="text-sm font-medium"
                      >
                        Email
                      </Label>
                      <Input
                        {...form.register(`users.${index}.email`, {
                          required: "This field is required",
                          pattern: {
                            value:
                              /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Invalid email address",
                          },
                        })}
                        placeholder="johndoe@gmail.com"
                        className="h-11"
                      />
                      {errors.users?.[index]?.email && (
                        <p className="text-xs text-destructive">
                          {errors.users[index]?.email?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Role</Label>
                    <Controller
                      name={`users.${index}.role`}
                      control={control}
                      rules={{ required: "This field is required" }}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(val) => {
                            field.onChange(val);
                            // Clear specialties if not technician
                            if (val !== ROLES.technician) {
                              form.setValue(
                                `users.${index}.specialties` as any,
                                []
                              );
                            }
                            // Clear property/unit if not user
                            if (val !== ROLES.user) {
                              form.setValue(
                                `users.${index}.propertyId` as any,
                                ""
                              );
                              form.setValue(`users.${index}.unitId` as any, "");
                            }
                          }}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ROLES.user}>
                              {ROLES.user}
                            </SelectItem>
                            <SelectItem value={ROLES.admin}>
                              {ROLES.admin}
                            </SelectItem>
                            <SelectItem value={ROLES.technician}>
                              {ROLES.technician}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.users?.[index]?.role && (
                      <p className="text-xs text-destructive">
                        {errors.users[index]?.role?.message}
                      </p>
                    )}
                  </div>

                  {/* Specialties as clickable badges (Technician only) */}
                  {currentRole === ROLES.technician && (
                    <Controller
                      name={`users.${index}.specialties`}
                      control={control}
                      rules={{
                        validate: (arr) =>
                          (Array.isArray(arr) && arr.length > 0) ||
                          "Select at least one specialty",
                      }}
                      render={({ field }) => (
                        <SpecialtyBadges
                          value={field.value ?? []}
                          onChange={field.onChange}
                          error={errors.users?.[index]?.specialties?.message}
                        />
                      )}
                    />
                  )}

                  {/* Property + Unit (User only) */}
                  {currentRole === ROLES.user && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Property</Label>
                        <Controller
                          name={`users.${index}.propertyId`}
                          control={control}
                          rules={{
                            validate: (v) =>
                              currentRole === ROLES.user
                                ? !!v || "Property is required"
                                : true,
                          }}
                          render={({ field }) => (
                            <Select
                              value={field.value ?? ""}
                              onValueChange={(val) => {
                                field.onChange(val);
                                // Clear unit when property changes
                                form.setValue(
                                  `users.${index}.unitId` as any,
                                  ""
                                );
                              }}
                              disabled={!businessId || isPropsFetching}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue
                                  placeholder={
                                    isPropsFetching
                                      ? "Loading properties..."
                                      : properties.length
                                        ? "Select property"
                                        : "No properties found"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {properties.map((p) => (
                                  <SelectItem key={p._id} value={p._id}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.users?.[index]?.propertyId && (
                          <p className="text-xs text-destructive">
                            {errors.users[index]?.propertyId?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Unit</Label>
                        <Controller
                          name={`users.${index}.unitId`}
                          control={control}
                          rules={{
                            validate: (v) =>
                              currentRole === ROLES.user
                                ? !!v || "Unit is required"
                                : true,
                          }}
                          render={({ field }) => (
                            <Select
                              value={field.value ?? ""}
                              onValueChange={field.onChange}
                              disabled={
                                !currentUser?.propertyId || isUnitsFetching
                              }
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue
                                  placeholder={
                                    isUnitsFetching
                                      ? "Loading units..."
                                      : currentUser?.propertyId
                                        ? units.length
                                          ? "Select unit"
                                          : "No units found"
                                        : "Select property first"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {units.map((u) => (
                                  <SelectItem key={u._id} value={u._id}>
                                    {u.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.users?.[index]?.unitId && (
                          <p className="text-xs text-destructive">
                            {errors.users[index]?.unitId?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add User Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={addUser}
              className="px-8"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another User
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
                  Creating {fields.length} User Invites...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create {fields.length} User Invites
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultipleUserForm;
