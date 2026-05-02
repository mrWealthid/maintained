"use client";

import * as React from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import {
  parsePhoneNumberFromString,
  getCountryCallingCode,
  CountryCode,
} from "libphonenumber-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** ---- Countries + length hints (national digits only) ---- */
type CountryOption = { code: CountryCode; name: string };

const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "NG", name: "Nigeria" },
  { code: "DE", name: "Germany" },
];

/** Real example placeholders (formatted hints shown in the UI only). */
const EXAMPLE_PLACEHOLDERS: Partial<Record<CountryCode, string>> = {
  US: "202-555-0145",
  CA: "416-555-0123",
  GB: "020 7946 0018",
  NG: "0802 123 4567",
  DE: "030 1234567",
};

/** National digit constraints (exclude country code). */
const NATIONAL_LENGTH_HINTS: Partial<
  Record<CountryCode, { min: number; max: number }>
> = {
  US: { min: 10, max: 10 },
  CA: { min: 10, max: 10 },
  GB: { min: 9, max: 10 },
  NG: { min: 10, max: 11 },
  DE: { min: 5, max: 13 },
};

function codeToFlagEmoji(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}

/** ---- Props ---- */
export type InternationalPhoneFieldProps<
  TFieldValues extends FieldValues = any,
> = {
  /** RHF field that stores DIGITS-ONLY (e.g., "3362103489") */
  name: string;
  control: Control<TFieldValues, any>;
  label?: string;
  allowedCountries?: readonly CountryCode[];
  defaultCountry?: CountryCode;
  /** You can override or add examples per country here; otherwise we use EXAMPLE_PLACEHOLDERS. */
  placeholderByCountry?: Partial<Record<CountryCode, string>>;
  disabled?: boolean;
  description?: string;
  className?: string;

  showFlags?: boolean; // default true
  enforceDigitHints?: boolean; // default true

  /** Bubble country to parent so you can compose E.164 on submit */
  onCountryChange?: (country: CountryCode) => void;
};

export function InternationalPhoneField<
  TFieldValues extends FieldValues = any,
>({
  name,
  control,
  label = "Phone number",
  allowedCountries = ["US"],
  defaultCountry = "US",
  placeholderByCountry,
  disabled,
  description,
  className,
  showFlags = true,
  enforceDigitHints = true,
  onCountryChange,
}: InternationalPhoneFieldProps<TFieldValues>) {
  const inputId = React.useId();
  const options = React.useMemo(
    () => COUNTRY_OPTIONS.filter((o) => allowedCountries.includes(o.code)),
    [allowedCountries]
  );

  return (
    <Controller
      control={control}
      name={name as Path<TFieldValues>}
      render={({ field, fieldState }) => (
        <PhoneInputControl
          field={field}
          fieldState={fieldState}
          options={options}
          defaultCountry={(options[0]?.code ?? defaultCountry) as CountryCode}
          placeholderByCountry={placeholderByCountry}
          disabled={disabled}
          label={label}
          description={description}
          className={className}
          inputId={inputId}
          name={name}
          showFlags={showFlags}
          enforceDigitHints={enforceDigitHints}
          onCountryChange={onCountryChange}
        />
      )}
    />
  );
}

/** ---- Inner control: hooks live here ---- */
type PhoneInputControlProps = {
  field: {
    name: string;
    value: unknown; // stores DIGITS (not E.164)
    onChange: (v: any) => void;
    onBlur: () => void;
    ref: (el: any) => void;
  };
  fieldState: { error?: { message?: string } | undefined };
  options: CountryOption[];
  defaultCountry: CountryCode;
  placeholderByCountry?: Partial<Record<CountryCode, string>>;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  inputId: string;
  name: string;
  showFlags: boolean;
  enforceDigitHints: boolean;
  onCountryChange?: (c: CountryCode) => void;
};

function PhoneInputControl({
  field,
  fieldState,
  options,
  defaultCountry,
  placeholderByCountry,
  disabled,
  label,
  description,
  className,
  inputId,
  name,
  showFlags,
  enforceDigitHints,
  onCountryChange,
}: PhoneInputControlProps) {
  const [country, setCountry] = React.useState<CountryCode>(defaultCountry);
  const [digits, setDigits] = React.useState<string>(""); // national digits ONLY
  const [open, setOpen] = React.useState(false);

  // Sync from external value (supports edit population from digits OR E.164)
  React.useEffect(() => {
    const v = field.value;
    if (typeof v !== "string" || !v) {
      setDigits("");
      return;
    }
    if (v.startsWith("+")) {
      const parsed = parsePhoneNumberFromString(v);
      if (parsed?.country) setCountry(parsed.country as CountryCode);
      setDigits(String(parsed?.nationalNumber ?? "").replace(/\D/g, ""));
    } else {
      setDigits(v.replace(/\D/g, "")); // keep only digits
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value]);

  const limits = NATIONAL_LENGTH_HINTS[country];
  const dial = `+${getCountryCallingCode(country)}`;

  // Real example placeholder per country with overrides
  const placeholder = React.useMemo(() => {
    if (placeholderByCountry?.[country]) return placeholderByCountry[country]!;
    if (EXAMPLE_PLACEHOLDERS[country]) return EXAMPLE_PLACEHOLDERS[country]!;
    // fallback to length hint if no example
    if (limits) {
      if (limits.min === limits.max) return "#".repeat(limits.max);
      return `${"#".repeat(limits.min)}–${"#".repeat(limits.max)}`;
    }
    return "digits only";
  }, [country, limits, placeholderByCountry]);

  const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let next = e.target.value.replace(/\D/g, "");
    if (enforceDigitHints && limits?.max) next = next.slice(0, limits.max);
    setDigits(next);
    field.onChange(next); // <-- store DIGITS in RHF, no formatting
  };

  const handleBlur = () => {
    field.onBlur(); // no formatting on blur
  };

  const selectCountry = (c: CountryCode) => {
    setCountry(c);
    onCountryChange?.(c);
    setOpen(false);
    // trim digits if new country has smaller max
    const newLimits = NATIONAL_LENGTH_HINTS[c];
    const trimmed = newLimits?.max ? digits.slice(0, newLimits.max) : digits;
    if (trimmed !== digits) {
      setDigits(trimmed);
      field.onChange(trimmed);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block mb-1 text-sm font-medium">
          {label}
        </label>
      )}

      <div className="flex">
        {/* Left: country picker (joined with input) */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "inline-flex items-center gap-2  h-fit rounded-r-none border-r-0",
                "min-w-26 justify-between"
              )}
              aria-label="Select country"
            >
              <span className="flex items-center gap-2 truncate">
                {showFlags && (
                  <span className="text-base">{codeToFlagEmoji(country)}</span>
                )}
                <span className="truncate">
                  {options.find((o) => o.code === country)?.name ?? country}
                </span>
                <span className="text-muted-foreground">({dial})</span>
              </span>
              <ChevronsUpDown className="h-4 w-4 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-88" align="start">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="max-h-72">
                  {options.map((opt) => {
                    const value = opt.code;
                    const dialCode = `+${getCountryCallingCode(opt.code)}`;
                    const isActive = country === opt.code;
                    return (
                      <CommandItem
                        key={value}
                        value={`${opt.name} ${value} ${dialCode}`}
                        onSelect={() => selectCountry(value)}
                        className="gap-2"
                      >
                        <Check
                          className={cn(
                            "h-4 w-4",
                            isActive ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {showFlags && (
                          <span className="text-base">
                            {codeToFlagEmoji(opt.code)}
                          </span>
                        )}
                        <span className="flex-1 truncate">{opt.name}</span>
                        <span className="text-muted-foreground">
                          {dialCode}
                        </span>
                      </CommandItem>
                    );
                  })}
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Right: plain digits input (joined) */}
        <Input
          id={inputId}
          ref={field.ref}
          name={field.name}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          disabled={disabled}
          placeholder={placeholder} // <-- REAL EXAMPLE per country
          value={digits}
          onChange={handleDigitsChange}
          onBlur={handleBlur}
          aria-invalid={!!fieldState.error}
          aria-describedby={fieldState.error ? `${name}-error` : undefined}
          className={cn(
            "rounded-l-none border-l-0",
            fieldState.error && "border-destructive/40 focus-visible:ring-red-500"
          )}
          maxLength={enforceDigitHints && limits?.max ? limits.max : undefined}
        />
      </div>

      {description && !fieldState.error && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}

      {fieldState.error && (
        <p
          id={`${name}-error`}
          className="mt-1 text-xs text-destructive"
          aria-live="polite"
        >
          {fieldState.error.message}
        </p>
      )}
    </div>
  );
}
