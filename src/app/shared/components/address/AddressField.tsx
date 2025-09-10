"use client";
import { useFormContext, Controller } from "react-hook-form";

import { US_STATES } from "@/lib/validation/address";
import { Input } from "@/components/ui/input";
import ErrorMessage from "../form-elements/ErrorMessage";

// ✅ shadcn Select pieces:
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import AddressAutocomplete from "./AddressAutoComplete"; // ✅ match the file/component name
import type { ParsedAddress } from "@/utils/helpers";

type Props = {
  namePrefix?: string; // e.g., "address"
  proximity?: { lng: number; lat: number };
  className?: string;
};

const path = (prefix: string | undefined, key: string) =>
  prefix ? `${prefix}.${key}` : key;

export default function AddressField({
  namePrefix = "address",
  proximity,
  className,
}: Props) {
  const {
    watch,
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  const onSelect = (addr: ParsedAddress) => {
    setValue(path(namePrefix, "line1"), addr.line1, { shouldValidate: true });
    setValue(path(namePrefix, "city"), addr.city, { shouldValidate: true });
    setValue(path(namePrefix, "state"), addr.state as any, {
      shouldValidate: true,
    });
    setValue(path(namePrefix, "postalCode"), addr.postalCode, {
      shouldValidate: true,
    });
    setValue(path(namePrefix, "country"), "United States", {
      shouldValidate: true,
    });
    setValue(path(namePrefix, "lat"), addr.lat ?? null);
    setValue(path(namePrefix, "lng"), addr.lng ?? null);
    setValue(path(namePrefix, "placeId"), addr.placeId, {
      shouldValidate: true,
    });
  };

  const errs = (errors?.[namePrefix] as any) ?? {};

  function formatSingleLine(a: any) {
    if (!a) return "";
    const cityStateZip = [a.city, a.state, a.postalCode]
      .filter(Boolean)
      .join(" ");
    return [a.line1, cityStateZip].filter(Boolean).join(", ");
  }

  const currentAddr = watch(namePrefix as any); // the object under "address"

  return (
    <div className={className}>
      <AddressAutocomplete
        onSelect={onSelect}
        proximity={proximity}
        initialQuery={formatSingleLine(currentAddr)} // 👈 prefill the input on edit
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-5">
        {/* line1 */}
        <Controller
          control={control}
          name={path(namePrefix, "line1")}
          render={({ field }) => (
            <div>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Address line 1"
              />
              {errs.line1 && <ErrorMessage errorMsg={errs?.line1?.message} />}
            </div>
          )}
        />

        {/* line2 */}
        <Controller
          control={control}
          name={path(namePrefix, "line2")}
          render={({ field }) => (
            <div>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Apt, suite, unit (optional)"
              />
            </div>
          )}
        />

        {/* city */}
        <Controller
          control={control}
          name={path(namePrefix, "city")}
          render={({ field }) => (
            <div>
              <Input {...field} placeholder="City" />

              {errs.city && <ErrorMessage errorMsg={errs?.city?.message} />}
            </div>
          )}
        />

        {/* state (shadcn Select) */}
        <Controller
          control={control}
          name={path(namePrefix, "state")}
          render={({ field }) => (
            <div>
              <Select
                onValueChange={field.onChange} // ✅ RHF wiring
                value={field.value} // ✅ controlled value
                defaultValue={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errs.state && <ErrorMessage errorMsg={errs?.state?.message} />}
            </div>
          )}
        />

        {/* postalCode */}
        <Controller
          control={control}
          name={path(namePrefix, "postalCode")}
          render={({ field }) => (
            <div>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="ZIP CODE"
              />
              {errs?.postalCode && (
                <ErrorMessage errorMsg={errs?.postalCode?.message} />
              )}
            </div>
          )}
        />

        {/* country (read-only) */}
        <Controller
          control={control}
          name={path(namePrefix, "country")}
          render={({ field }) => (
            <div>
              <Input {...field} value={field.value ?? ""} readOnly />
            </div>
          )}
        />
      </div>

      {/* hidden/readonly meta */}
      <div className="grid grid-cols-3 gap-3 mt-5 ">
        <Controller
          name={path(namePrefix, "lat")}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              readOnly
              placeholder="lat"
            />
          )}
        />
        <Controller
          name={path(namePrefix, "lng")}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              readOnly
              placeholder="lng"
            />
          )}
        />
        <Controller
          name={path(namePrefix, "placeId")}
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
      </div>
    </div>
  );
}
