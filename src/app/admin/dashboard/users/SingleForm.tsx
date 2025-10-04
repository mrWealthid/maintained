import { ROLES } from "@/app/shared/enums/enums";
import { CreateMultipleUsersPayload } from "@/app/shared/model/model";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import {
  Controller,
  useFormContext,
  type FieldArrayWithId,
} from "react-hook-form";
import { SpecialtyBadges } from "./MultipleUserForm";
import { Property } from "@/app/shared/features/onboarding-feat/model/model";
import { useFetchUnits } from "@/app/shared/features/onboarding-feat/hooks/onboardingHooks";

const SingleForm = ({
  field,
  index,
  properties,
  isFetchingProperties,
}: {
  field: FieldArrayWithId<CreateMultipleUsersPayload, "users", "id">;
  index: number;
  properties: Property[];
  isFetchingProperties: boolean;
}) => {
  const form = useFormContext<CreateMultipleUsersPayload>();
  const {
    control,
    watch,
    formState: { errors },
  } = form;

  const watchedUsers = watch("users");
  const currentUser = watchedUsers[index];

  const { units, isFetchingUnits } = useFetchUnits(currentUser.propertyId);

  return (
    <div key={field.id} className="border rounded-lg p-6 space-y-4">
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
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
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
                  form.setValue(`users.${index}.specialties` as any, []);
                }
                // Clear property/unit if not user
                if (val !== ROLES.user) {
                  form.setValue(`users.${index}.propertyId` as any, "");
                  form.setValue(`users.${index}.unitId` as any, "");
                }
              }}
            >
              <SelectTrigger className="h-11">
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
        {errors.users?.[index]?.role && (
          <p className="text-xs text-destructive">
            {errors.users[index]?.role?.message}
          </p>
        )}
      </div>

      {/* Specialties as clickable badges (Technician only) */}
      {currentUser.role === ROLES.technician && (
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
      {currentUser.role === ROLES.user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Property</Label>
            <Controller
              name={`users.${index}.propertyId`}
              control={control}
              rules={{
                validate: (v) =>
                  currentUser.role === ROLES.user
                    ? !!v || "Property is required"
                    : true,
              }}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) => {
                    field.onChange(val);
                    // Clear unit when property changes
                    form.setValue(`users.${index}.unitId` as any, "");
                  }}
                  disabled={isFetchingProperties}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue
                      placeholder={
                        isFetchingProperties
                          ? "Loading properties..."
                          : properties?.length
                            ? "Select property"
                            : "No properties found"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {properties?.map((p) => (
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
                  currentUser.role === ROLES.user
                    ? !!v || "Unit is required"
                    : true,
              }}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={!currentUser?.propertyId || isFetchingUnits}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue
                      placeholder={
                        isFetchingUnits
                          ? "Loading units..."
                          : currentUser?.propertyId
                            ? units?.length
                              ? "Select unit"
                              : "No units found"
                            : "Select property first"
                      }
                    />
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
};

export default SingleForm;
