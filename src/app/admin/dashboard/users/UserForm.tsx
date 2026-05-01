"use client";
import React, { FC, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useCreateUser } from "./hooks/userHooks";
import { ROLES } from "@/shared/enums/enums";
import { ManageUserForm, ManageUserFormProps } from "@/shared/model/model";
import { useAppContext } from "@/shared/contexts/AppContext";

// shadcn/ui
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Keep your existing ButtonComponent for actions
import ButtonComponent from "@/shared/components/form-elements/Button";
import { DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import ErrorList from "@/components/ui/ErrorList";
import {
  fetchProperties,
  fetchUnits,
} from "@/features/onboarding-feat/service/onboarding-service";
import {
  useFetchProperties,
  useFetchUnits,
} from "@/features/onboarding-feat/hooks/onboardingHooks";

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

// Clickable badge multi-select ----------------------
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
                "focus:outline-none focus:ring-1  focus:ring-offset-2",
                isOn
                  ? " bg-button-primary hover:bg-button-accent text-button-primary-foreground "
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

const UserForm: FC<ManageUserFormProps> = ({
  user,
  membership,
  onCloseModal,
  successCallback,
  errorCallback,
}) => {
  const isEditing = !!user?.id;

  const { user: me } = useAppContext();
  const businessId = (membership as any)?.business ?? me?.currentBusiness?.id;

  const { control, register, handleSubmit, watch, formState, setValue } =
    useForm<ManageUserForm>({
      mode: "onChange",
      defaultValues: isEditing
        ? { ...user, ...membership }
        : { ...(membership as any) },
    });

  const currentRole = watch("role");
  const selectedPropertyId = watch("propertyId");

  // React Query: list properties for business (only when inviting a USER)
  const { data: properties, isFetchingProperties } = useFetchProperties();

  useFetchProperties();

  // React Query: list units for the chosen property
  const { units, isFetchingUnits } = useFetchUnits(selectedPropertyId);

  let propertyPlaceholder = "No properties found";
  if (isFetchingProperties) {
    propertyPlaceholder = "Loading properties...";
  } else if (properties?.data.length) {
    propertyPlaceholder = "Select property";
  }

  let unitPlaceholder = "Select property first";
  if (isFetchingUnits) {
    unitPlaceholder = "Loading units...";
  } else if (selectedPropertyId) {
    unitPlaceholder = units?.length ? "Select unit" : "No units found";
  }

  const { errors, isSubmitting, isValid, isDirty } = formState;
  const { isCreating, createUser, createUserError } = useCreateUser(
    isEditing,
    onCloseModal,
    user?.id
  );

  function onSubmit(data: ManageUserForm) {
    const payload: ManageUserForm = {
      ...data,
      ...(data.role === ROLES.technician ? {} : { specialties: [] as any }),
      ...(data.role === ROLES.user
        ? {
            business: businessId,
            propertyId: data.propertyId,
            unitId: data.unitId,
          }
        : {}),
    } as ManageUserForm;

    createUser(payload, {
      onSuccess: (user) => successCallback?.(user),
      onError: (err) => errorCallback?.(err),
    });
  }

  function onError(err: unknown) {
    console.log(err);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="flex flex-1 items-center"
      >
        <section className="flex-col flex gap-4 w-full">
          {createUserError ? <ErrorList error={createUserError} /> : null}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Enter Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter Full Name"
                {...register("name", { required: "This field is required" })}
              />
              {errors.name?.message && (
                <p className="text-sm text-destructive">
                  {String(errors.name.message)}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="johndoe@gmail.com"
                {...register("email", {
                  required: "This field is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email?.message && (
                <p className="text-sm text-destructive">
                  {String(errors.email.message)}
                </p>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Controller
              name="role"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <Select
                  value={String(field.value ?? "")}
                  onValueChange={(val) => {
                    field.onChange(val as ManageUserForm["role"]);
                    if (val !== ROLES.technician)
                      setValue("specialties" as any, []);
                    if (val !== ROLES.user) {
                      // clear tenant location if switching away from USER
                      setValue("propertyId" as any, undefined, {
                        shouldValidate: true,
                      });
                      setValue("unitId" as any, undefined, {
                        shouldValidate: true,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ROLES.user}>{ROLES.user}</SelectItem>
                    <SelectItem value={ROLES.admin}>{ROLES.admin}</SelectItem>
                    <SelectItem value={ROLES.technician}>
                      {ROLES.technician}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role?.message && (
              <p className="text-sm text-destructive">
                {String(errors.role.message)}
              </p>
            )}
          </div>

          {/* Specialties as clickable badges (Technician only) */}
          {watch("role") === ROLES.technician && (
            <Controller
              name="specialties"
              control={control}
              rules={{
                validate: (arr) =>
                  (Array.isArray(arr) && arr.length > 0) ||
                  "Select at least one specialty",
              }}
              render={({ field }) => (
                <SpecialtyBadges
                  value={(field.value as unknown as string[]) ?? []}
                  onChange={field.onChange as (next: string[]) => void}
                  error={errors.specialties?.message as string}
                />
              )}
            />
          )}

          {/* NEW — Tenant location (Property + Unit) */}
          {currentRole === ROLES.user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Property</Label>
                <Controller
                  name="propertyId"
                  control={control}
                  rules={{
                    validate: (v) =>
                      currentRole === ROLES.user
                        ? !!v || "Property is required"
                        : true,
                  }}
                  render={({ field }) => (
                    <Select
                      value={(field.value as any) ?? ""}
                      onValueChange={(val) => {
                        field.onChange(val);
                        // clear unit when property changes
                        setValue("unitId" as any, undefined, {
                          shouldValidate: true,
                        });
                      }}
                      disabled={!businessId || isFetchingProperties}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={propertyPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {properties?.data.map((p) => (
                          <SelectItem key={p._id} value={p._id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.propertyId && (
                  <p className="text-sm text-destructive">
                    {String((errors as any).propertyId?.message)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Unit</Label>
                <Controller
                  name="unitId"
                  control={control}
                  rules={{
                    validate: (v) =>
                      currentRole === ROLES.user
                        ? !!v || "Unit is required"
                        : true,
                  }}
                  render={({ field }) => (
                    <Select
                      value={(field.value as any) ?? ""}
                      onValueChange={field.onChange}
                      disabled={!selectedPropertyId || isFetchingUnits}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={unitPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {units?.map((u) => (
                          <SelectItem key={u._id} value={u._id}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unitId && (
                  <p className="text-sm text-destructive">
                    {String((errors as any).unitId?.message)}
                  </p>
                )}
              </div>
            </div>
          )}

          <Separator />
          <DialogFooter>
            <section className="flex justify-end gap-3">
              <ButtonComponent
                type="reset"
                handleClick={() => onCloseModal?.()}
                styles="rounded-3xl"
                btnText={"Cancel"}
              />

              <ButtonComponent
                type="submit"
                styles="rounded-3xl"
                disabled={!isValid || isSubmitting || !isDirty}
                loading={isCreating}
                btnText={`${isEditing ? "Update User" : "Create User"}`}
              />
            </section>
          </DialogFooter>
        </section>
      </form>
    </div>
  );
};

export default UserForm;
