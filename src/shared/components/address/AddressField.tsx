"use client";

import { useMemo, useState } from "react";
import {
  useFormContext,
  Controller,
  FieldValues,
  FieldErrors,
  Path,
} from "react-hook-form";

import {
  COUNTRY_OPTIONS,
  countryNameFromCode,
  AddressFormValues,
} from "@/lib/validation/address";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFieldRequired } from "@/components/ui/form";
import ErrorMessage from "../form-elements/ErrorMessage";
import { cn } from "@/lib/utils";
import {
  Search,
  Building2,
  Globe,
  MapPinned,
  Hash,
  Navigation,
} from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import AddressAutocomplete from "./AddressAutoComplete";
import {
  formatSingleLineAddress,
  getPostalCodeDescription,
  getPostalCodePlaceholder,
  getSubdivisionDescription,
  getSubdivisionLabel,
  getSubdivisionOptions,
  getSubdivisionPlaceholder,
} from "@/shared/helper/address.helper";
import type {
  AddressFormData,
  ParsedAddress,
} from "@/shared/model/address.model";

type Props = {
  namePrefix?: string;
  proximity?: { lng: number; lat: number };
  className?: string;
};

const path = (prefix: string | undefined, key: string): string =>
  prefix ? `${prefix}.${key}` : key;

export default function AddressField<
  TFieldValues extends FieldValues = FieldValues
>({ namePrefix = "address", proximity, className }: Props) {
  const {
    watch,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const [manualMode, setManualMode] = useState(false);
  const line1Required = useFieldRequired(path(namePrefix, "line1"));
  const countryCodeRequired = useFieldRequired(path(namePrefix, "countryCode"));
  const stateRequired = useFieldRequired(path(namePrefix, "state"));
  const cityRequired = useFieldRequired(path(namePrefix, "city"));
  const postalCodeRequired = useFieldRequired(path(namePrefix, "postalCode"));

  // Type-safe error access
  const addressErrors =
    (errors[namePrefix as Path<TFieldValues>] as
      | FieldErrors<AddressFormValues>
      | undefined) ?? {};

  const currentAddr = watch(namePrefix as Path<TFieldValues>) as
    | AddressFormData
    | undefined;

  const countryCode =
    (watch(path(namePrefix, "countryCode") as Path<TFieldValues>) as
      | "US"
      | "CA"
      | "GB"
      | "NG"
      | "DE"
      | undefined) ?? "US";

  const subdivisions = useMemo(
    () => getSubdivisionOptions(countryCode),
    [countryCode]
  );

  const onSelect = (
    addr: ParsedAddress & { countryCode?: string; country?: string }
  ) => {
    // Google selection -> force google source
    setValue(
      path(namePrefix, "source") as Path<TFieldValues>,
      "google" as unknown as Parameters<typeof setValue>[1],
      { shouldValidate: true }
    );

    // Prefer countryCode from parsed google place; fallback to current selection
    const cc = (addr.countryCode ?? countryCode) as
      | "US"
      | "CA"
      | "GB"
      | "NG"
      | "DE";
    setValue(
      path(namePrefix, "countryCode") as Path<TFieldValues>,
      cc as unknown as Parameters<typeof setValue>[1],
      { shouldValidate: true }
    );
    setValue(
      path(namePrefix, "country") as Path<TFieldValues>,
      (addr.country ?? countryNameFromCode(cc)) as unknown as Parameters<
        typeof setValue
      >[1],
      {
        shouldValidate: true,
      }
    );

    setValue(
      path(namePrefix, "line1") as Path<TFieldValues>,
      addr.line1 as unknown as Parameters<typeof setValue>[1],
      { shouldValidate: true }
    );
    setValue(
      path(namePrefix, "city") as Path<TFieldValues>,
      addr.city as unknown as Parameters<typeof setValue>[1],
      { shouldValidate: true }
    );
    setValue(
      path(namePrefix, "state") as Path<TFieldValues>,
      addr.state as unknown as Parameters<typeof setValue>[1],
      { shouldValidate: true }
    );
    setValue(
      path(namePrefix, "postalCode") as Path<TFieldValues>,
      addr.postalCode as unknown as Parameters<typeof setValue>[1],
      {
        shouldValidate: true,
      }
    );

    setValue(
      path(namePrefix, "lat") as Path<TFieldValues>,
      (addr.lat ?? null) as unknown as Parameters<typeof setValue>[1],
      { shouldValidate: true }
    );
    setValue(
      path(namePrefix, "lng") as Path<TFieldValues>,
      (addr.lng ?? null) as unknown as Parameters<typeof setValue>[1],
      { shouldValidate: true }
    );

    setValue(
      path(namePrefix, "placeId") as Path<TFieldValues>,
      (addr.placeId ?? "") as unknown as Parameters<typeof setValue>[1],
      {
        shouldValidate: true,
      }
    );
  };

  const switchToManual = () => {
    setManualMode(true);
    setValue(
      path(namePrefix, "source") as Path<TFieldValues>,
      "manual" as unknown as Parameters<typeof setValue>[1],
      { shouldValidate: true }
    );

    // Manual mode: placeId is not required; clear it so schema passes
    setValue(
      path(namePrefix, "placeId") as Path<TFieldValues>,
      "" as unknown as Parameters<typeof setValue>[1],
      {
        shouldValidate: true,
      }
    );
  };

  const switchToSearch = () => {
    setManualMode(false);
    // Search mode does not necessarily mean “google” until user selects;
    // leave source as-is; it will become google onSelect.
  };

  return (
    <div className={cn("w-full space-y-8", className)}>
      {/* Header Section */}
      <div className="space-y-4">
        {/* <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h3 className=" font-semibold">Address Information</h3>
        </div> */}
        <p className="text-sm text-muted-foreground">
          Choose to search for your address automatically or enter it manually.
        </p>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
          <Button
            type="button"
            variant={!manualMode ? "default" : "ghost"}
            size="sm"
            onClick={switchToSearch}
            className={cn("gap-2", !manualMode && "shadow-xs")}
          >
            <Search className="h-4 w-4" />
            Search Address
          </Button>
          <Button
            type="button"
            variant={manualMode ? "default" : "ghost"}
            size="sm"
            onClick={switchToManual}
            className={cn("gap-2", manualMode && "shadow-xs")}
          >
            <MapPinned className="h-4 w-4" />
            Enter Manually
          </Button>
        </div>
      </div>

      {/* Address Search */}
      {!manualMode && (
        <div className="space-y-2">
          <Label htmlFor="address-search" className="text-sm font-medium">
            Search for your address
          </Label>
          <p className="text-xs text-muted-foreground">
            Start typing your address and select from the suggestions
          </p>
          <AddressAutocomplete
            onSelect={onSelect}
            proximity={proximity}
            initialQuery={formatSingleLineAddress(currentAddr)}
            countryCode={countryCode as "US" | "CA" | "GB" | "NG" | "DE"}
            placeholder="Start typing your address..."
            className="w-full"
          />
        </div>
      )}

      {/* Address Fields */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Street Address
          </h4>
          <p className="text-xs text-muted-foreground">
            Enter the street address details
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.65fr)]">
          <Controller
            control={control}
            name={path(namePrefix, "line1") as Path<TFieldValues>}
            render={({ field }) => (
              <div className="space-y-2 w-full">
                <Label
                  htmlFor={path(namePrefix, "line1")}
                  className="text-sm font-medium"
                  required={line1Required}
                >
                  Street Address
                </Label>
                <Input
                  id={path(namePrefix, "line1")}
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g., 123 Main Street"
                  className={cn(
                    "w-full",
                    addressErrors.line1 && "border-destructive"
                  )}
                  aria-invalid={!!addressErrors.line1}
                  aria-describedby={
                    addressErrors.line1
                      ? `${namePrefix}-line1-error`
                      : `${namePrefix}-line1-description`
                  }
                />
                {!addressErrors.line1 && (
                  <p
                    id={`${namePrefix}-line1-description`}
                    className="text-xs text-muted-foreground"
                  >
                    Enter the street number and name
                  </p>
                )}
                {addressErrors.line1 && (
                  <ErrorMessage
                    errorMsg={
                      addressErrors.line1?.message ?? "Invalid address line 1"
                    }
                  />
                )}
              </div>
            )}
          />

          <Controller
            control={control}
            name={path(namePrefix, "line2") as Path<TFieldValues>}
            render={({ field }) => (
              <div className="space-y-2 w-full">
                <Label
                  htmlFor={path(namePrefix, "line2")}
                  className="text-sm font-medium"
                >
                  Apartment, Suite, Unit
                </Label>
                <Input
                  id={path(namePrefix, "line2")}
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g., Apt 4B"
                  className="w-full"
                  aria-describedby={`${namePrefix}-line2-description`}
                />
                <p
                  id={`${namePrefix}-line2-description`}
                  className="text-xs text-muted-foreground"
                >
                  Optional extra address detail
                </p>
              </div>
            )}
          />
        </div>
      </div>

      {/* Location Details */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Location Details
          </h4>
          <p className="text-xs text-muted-foreground">
            City, state, and postal information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country */}
          <Controller
            control={control}
            name={path(namePrefix, "countryCode") as Path<TFieldValues>}
            render={({ field }) => (
              <div className="space-y-2 w-full">
                <Label
                  htmlFor={path(namePrefix, "countryCode")}
                  className="text-sm font-medium"
                  required={countryCodeRequired}
                >
                  Country
                </Label>
                <Select
                  value={(field.value as string) ?? "US"}
                  onValueChange={(v: string) => {
                    field.onChange(v);
                    const countryName = countryNameFromCode(
                      v as "US" | "CA" | "GB" | "NG" | "DE"
                    );
                    setValue(
                      path(namePrefix, "country") as Path<TFieldValues>,
                      countryName as unknown as Parameters<typeof setValue>[1],
                      {
                        shouldValidate: true,
                      }
                    );
                    // clear state when changing country
                    setValue(
                      path(namePrefix, "state") as Path<TFieldValues>,
                      "" as unknown as Parameters<typeof setValue>[1],
                      {
                        shouldValidate: true,
                      }
                    );
                  }}
                >
                  <SelectTrigger
                    id={path(namePrefix, "countryCode")}
                    className={cn(
                      "w-full",
                      addressErrors.countryCode && "border-destructive"
                    )}
                    aria-invalid={!!addressErrors.countryCode}
                    aria-describedby={
                      addressErrors.countryCode
                        ? `${namePrefix}-countryCode-error`
                        : `${namePrefix}-countryCode-description`
                    }
                  >
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!addressErrors.countryCode && (
                  <p
                    id={`${namePrefix}-countryCode-description`}
                    className="text-xs text-muted-foreground"
                  >
                    Select your country
                  </p>
                )}
                {addressErrors.countryCode && (
                  <ErrorMessage
                    errorMsg={
                      addressErrors.countryCode?.message ?? "Invalid country"
                    }
                  />
                )}
              </div>
            )}
          />
          {/* State/Province */}
          <Controller
            control={control}
            name={path(namePrefix, "state") as Path<TFieldValues>}
            render={({ field }) => (
              <div className="space-y-2 w-full">
                <Label
                  htmlFor={path(namePrefix, "state")}
                  className="text-sm font-medium"
                  required={stateRequired}
                >
                  {getSubdivisionLabel(countryCode)}
                </Label>
                {subdivisions ? (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={path(namePrefix, "state")}
                      className={cn(
                        "w-full",
                        addressErrors.state && "border-destructive"
                      )}
                      aria-invalid={!!addressErrors.state}
                      aria-describedby={
                        addressErrors.state
                          ? `${namePrefix}-state-error`
                          : `${namePrefix}-state-description`
                      }
                    >
                      <SelectValue
                        placeholder={getSubdivisionPlaceholder(countryCode)}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {subdivisions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={path(namePrefix, "state")}
                    {...field}
                    value={field.value ?? ""}
                    placeholder="e.g., Greater London, Yorkshire"
                    className={cn(
                      "w-full",
                      addressErrors.state && "border-destructive"
                    )}
                    aria-invalid={!!addressErrors.state}
                    aria-describedby={
                      addressErrors.state
                        ? `${namePrefix}-state-error`
                        : `${namePrefix}-state-description`
                    }
                  />
                )}
                {!addressErrors.state && (
                  <p
                    id={`${namePrefix}-state-description`}
                    className="text-xs text-muted-foreground"
                  >
                    {getSubdivisionDescription(countryCode)}
                  </p>
                )}
                {addressErrors.state && (
                  <ErrorMessage
                    errorMsg={addressErrors.state?.message ?? "Invalid state"}
                  />
                )}
              </div>
            )}
          />

          {/* city */}
          <Controller
            control={control}
            name={path(namePrefix, "city") as Path<TFieldValues>}
            render={({ field }) => (
              <div className="space-y-2 w-full">
                <Label
                  htmlFor={path(namePrefix, "city")}
                  className="text-sm font-medium"
                  required={cityRequired}
                >
                  City
                </Label>
                <Input
                  id={path(namePrefix, "city")}
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g., New York, Los Angeles"
                  className={cn(
                    "w-full",
                    addressErrors.city && "border-destructive"
                  )}
                  aria-invalid={!!addressErrors.city}
                  aria-describedby={
                    addressErrors.city
                      ? `${namePrefix}-city-error`
                      : `${namePrefix}-city-description`
                  }
                />
                {!addressErrors.city && (
                  <p
                    id={`${namePrefix}-city-description`}
                    className="text-xs text-muted-foreground"
                  >
                    Enter the city name
                  </p>
                )}
                {addressErrors.city && (
                  <ErrorMessage
                    errorMsg={addressErrors.city?.message ?? "Invalid city"}
                  />
                )}
              </div>
            )}
          />

          {/* postalCode */}
          <Controller
            control={control}
            name={path(namePrefix, "postalCode") as Path<TFieldValues>}
            render={({ field }) => (
              <div className="space-y-2 w-full">
                <Label
                  htmlFor={path(namePrefix, "postalCode")}
                  className="text-sm font-medium flex items-center gap-1"
                  required={postalCodeRequired}
                >
                  <Hash className="h-3 w-3" />
                  Postal Code
                </Label>
                <Input
                  id={path(namePrefix, "postalCode")}
                  {...field}
                  value={field.value ?? ""}
                  placeholder={getPostalCodePlaceholder(countryCode)}
                  className={cn(
                    "w-full",
                    addressErrors.postalCode && "border-destructive"
                  )}
                  aria-invalid={!!addressErrors.postalCode}
                  aria-describedby={
                    addressErrors.postalCode
                      ? `${namePrefix}-postalCode-error`
                      : `${namePrefix}-postalCode-description`
                  }
                />
                {!addressErrors.postalCode && (
                  <p
                    id={`${namePrefix}-postalCode-description`}
                    className="text-xs text-muted-foreground"
                  >
                    {getPostalCodeDescription(countryCode)}
                  </p>
                )}
                {addressErrors.postalCode && (
                  <ErrorMessage
                    errorMsg={
                      addressErrors.postalCode?.message ?? "Invalid postal code"
                    }
                  />
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* Coordinates Section - Only shown in manual mode */}
      {manualMode && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Navigation className="h-4 w-4 text-muted-foreground" />
              Geographic Coordinates
            </h4>
            <p className="text-xs text-muted-foreground">
              Optional - Enter latitude and longitude for precise location
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Latitude */}
            <Controller
              name={path(namePrefix, "lat") as Path<TFieldValues>}
              control={control}
              render={({ field }) => (
                <div className="space-y-2 w-full">
                  <Label
                    htmlFor={path(namePrefix, "lat")}
                    className="text-sm font-medium"
                  >
                    Latitude
                  </Label>
                  <Input
                    id={path(namePrefix, "lat")}
                    {...field}
                    value={field.value ?? ""}
                    placeholder="e.g., 40.7128"
                    inputMode="decimal"
                    type="number"
                    step="any"
                    className="w-full"
                    aria-describedby={`${namePrefix}-lat-description`}
                  />
                  <p
                    id={`${namePrefix}-lat-description`}
                    className="text-xs text-muted-foreground"
                  >
                    Enter latitude in decimal degrees (-90 to 90)
                  </p>
                </div>
              )}
            />

            {/* Longitude */}
            <Controller
              name={path(namePrefix, "lng") as Path<TFieldValues>}
              control={control}
              render={({ field }) => (
                <div className="space-y-2 w-full">
                  <Label
                    htmlFor={path(namePrefix, "lng")}
                    className="text-sm font-medium"
                  >
                    Longitude
                  </Label>
                  <Input
                    id={path(namePrefix, "lng")}
                    {...field}
                    value={field.value ?? ""}
                    placeholder="e.g., -74.0060"
                    inputMode="decimal"
                    type="number"
                    step="any"
                    className="w-full"
                    aria-describedby={`${namePrefix}-lng-description`}
                  />
                  <p
                    id={`${namePrefix}-lng-description`}
                    className="text-xs text-muted-foreground"
                  >
                    Enter longitude in decimal degrees (-180 to 180)
                  </p>
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* Hidden fields */}
      <div className="hidden">
        {/* country derived/stored */}
        <Controller
          control={control}
          name={path(namePrefix, "country") as Path<TFieldValues>}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? countryNameFromCode(countryCode)}
              readOnly
            />
          )}
        />

        {/* placeId */}
        <Controller
          name={path(namePrefix, "placeId") as Path<TFieldValues>}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              readOnly
              placeholder="placeId"
            />
          )}
        />

        {/* source */}
        <Controller
          name={path(namePrefix, "source") as Path<TFieldValues>}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? "manual"}
              readOnly
              placeholder="source"
            />
          )}
        />
      </div>
    </div>
  );
}
