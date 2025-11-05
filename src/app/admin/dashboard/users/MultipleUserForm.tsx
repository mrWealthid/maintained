"use client";
import React, { FC, useMemo } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { Plus, Users, Loader2, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCreateMultipleUsers } from "./hooks/userHooks";
import { ROLES } from "@/shared/enums/enums";
import { useAppContext } from "@/shared/contexts/AppContext";
import { CreateMultipleUsersPayload } from "@/shared/model/model";
import { useFetchProperties } from "@/features/onboarding-feat/hooks/onboardingHooks";
import SingleForm from "./SingleForm";

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

// Clickable badge multi-select for specialties
export const SpecialtyBadges: FC<{
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

  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  });

  const { createMultipleUsers, isCreating } = useCreateMultipleUsers(false);

  const { data: properties, isFetchingProperties } = useFetchProperties();

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

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            {/* Users List */}
            <div className="space-y-6">
              {fields.map((field, index) => {
                return (
                  <div
                    key={field.id}
                    className="border rounded-lg p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        User {index + 1}
                      </h3>
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
                    <SingleForm
                      field={field}
                      index={index}
                      properties={properties?.data!}
                      isFetchingProperties={isFetchingProperties}
                    />
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
        </FormProvider>
      </div>
    </div>
  );
};

export default MultipleUserForm;
