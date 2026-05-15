"use client";

import * as React from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import {
  parsePhoneNumberFromString,
  getCountryCallingCode,
  CountryCode,
} from "libphonenumber-js";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFieldRequired } from "@/components/ui/form";
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
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
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
  TFieldValues extends FieldValues = FieldValues,
> = {
  /** RHF field that stores DIGITS-ONLY (e.g., "3362103489") */
  name: string;
  control: Control<TFieldValues>;
  label?: React.ReactNode;
  required?: boolean;
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
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  label = "Phone number",
  required,
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
  const inferredRequired = useFieldRequired(name);
  const isRequired = required ?? inferredRequired ?? false;
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
          required={isRequired}
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
    onChange: (v: string) => void;
    onBlur: () => void;
    ref: (el: HTMLInputElement | null) => void;
  };
  fieldState: { error?: { message?: string } | undefined };
  options: CountryOption[];
  defaultCountry: CountryCode;
  placeholderByCountry?: Partial<Record<CountryCode, string>>;
  disabled?: boolean;
  label?: React.ReactNode;
  required: boolean;
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
  required,
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

  const fieldName = React.useMemo(() => field.name, [field.name]);
  const fieldRefCallback = React.useCallback(
    (el: HTMLInputElement | null) => {
      field.ref(el);
    },
    [field],
  );

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

  const hasError = !!fieldState.error;
  let describedBy: string | undefined;
  if (hasError) {
    describedBy = `${name}-error`;
  } else if (description) {
    describedBy = `${name}-description`;
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <Label
          htmlFor={inputId}
          required={required}
          className={cn(
            "block text-sm font-medium leading-none",
            hasError ? "text-destructive" : "text-foreground",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {label}
        </Label>
      )}

      <div
        className={cn(
          "relative flex rounded-md border border-input bg-background shadow-xs transition-colors",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          hasError && "border-destructive",
        )}
      >
        {/* Left: country picker (joined with input) */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "border-input data-placeholder:text-muted-foreground",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
                "h-9 min-w-[120px] rounded-r-none border-r border-input bg-transparent px-3 py-1 dark:bg-input/30",
                "flex items-center justify-between gap-2 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                hasError && "border-destructive",
                open && "bg-muted",
              )}
              aria-label="Select country"
              aria-expanded={open}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                {showFlags && (
                  <span className="shrink-0 text-base leading-none">
                    {codeToFlagEmoji(country)}
                  </span>
                )}
                <span className="hidden min-w-0 truncate text-sm font-medium sm:inline">
                  {options.find((o) => o.code === country)?.name ?? country}
                </span>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {dial}
                </span>
              </span>
              <ChevronsUpDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground opacity-50 transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[280px] p-0"
            align="start"
            sideOffset={4}
          >
            <Command className="rounded-lg">
              <CommandInput placeholder="Search country..." className="h-9" />
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No country found.
              </CommandEmpty>
              <CommandGroup>
                <ScrollArea className="max-h-[300px]">
                  <div className="p-1">
                    {options.map((opt) => {
                      const value = opt.code;
                      const dialCode = `+${getCountryCallingCode(opt.code)}`;
                      const isActive = country === opt.code;
                      return (
                        <CommandItem
                          key={value}
                          value={`${opt.name} ${value} ${dialCode}`}
                          onSelect={() => selectCountry(value)}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5",
                            "transition-colors duration-150",
                            isActive && "bg-muted text-foreground",
                          )}
                        >
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0 transition-opacity duration-200",
                              isActive ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {showFlags && (
                            <span className="shrink-0 text-lg leading-none">
                              {codeToFlagEmoji(opt.code)}
                            </span>
                          )}
                          <span className="flex-1 truncate text-sm font-medium">
                            {opt.name}
                          </span>
                          <span className="shrink-0 text-xs font-medium text-muted-foreground">
                            {dialCode}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Right: plain digits input (joined) */}
        <div className="relative flex-1">
          <Input
            id={inputId}
            ref={fieldRefCallback}
            name={fieldName}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            disabled={disabled}
            placeholder={placeholder}
            value={digits}
            onChange={handleDigitsChange}
            onBlur={handleBlur}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className={cn(
              "h-9 rounded-l-none border-0 border-l border-input bg-transparent pl-3 shadow-none",
              "focus-visible:border-l-ring focus-visible:ring-0",
              hasError && "border-l-destructive",
            )}
            maxLength={
              enforceDigitHints && limits?.max ? limits.max : undefined
            }
          />
        </div>
      </div>

      {description && !hasError && (
        <p
          id={`${name}-description`}
          className="text-xs leading-relaxed text-muted-foreground"
        >
          {description}
        </p>
      )}

      {hasError && fieldState.error?.message && (
        <div
          id={`${name}-error`}
          role="alert"
          aria-live="polite"
        >
          <ErrorMessage errorMsg={fieldState.error.message} />
        </div>
      )}
    </div>
  );
}
