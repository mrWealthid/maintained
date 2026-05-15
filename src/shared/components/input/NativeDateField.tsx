"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Matcher } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import { FORM_CONTROL_TRANSPARENT_CLASS } from "@/shared/components/form-elements/form-control-styles";

type NativeDateFieldProps = Omit<React.ComponentProps<"input">, "type"> & {
  wrapperClassName?: string;
  placeholder?: string;
  errorMessage?: string;
};

const DATE_DISPLAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "numeric",
  day: "numeric",
  year: "numeric",
});

function parseDateValue(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  return parseISO(`${value}T00:00:00`);
}

function formatDateLabel(value?: string) {
  const parsedDate = parseDateValue(value);
  if (!parsedDate) return "";
  return DATE_DISPLAY_FORMATTER.format(parsedDate);
}

const NativeDateField = forwardRef<HTMLInputElement, NativeDateFieldProps>(
  (
    {
      className,
      wrapperClassName,
      disabled,
      value,
      defaultValue,
      placeholder = "Select date",
      errorMessage,
      onChange,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);
    const fallbackId = useId();
    const resolvedId = props.id ?? fallbackId;
    const isControlled = typeof value === "string";
    const [internalValue, setInternalValue] = useState(
      typeof defaultValue === "string" ? defaultValue : "",
    );
    const [open, setOpen] = useState(false);

    const resolvedValue = isControlled ? value : internalValue;
    const label = formatDateLabel(resolvedValue);

    const selectedDate = useMemo(
      () => parseDateValue(resolvedValue),
      [resolvedValue],
    );

    const minDate = useMemo(
      () => parseDateValue(typeof props.min === "string" ? props.min : undefined),
      [props.min],
    );

    const maxDate = useMemo(
      () => parseDateValue(typeof props.max === "string" ? props.max : undefined),
      [props.max],
    );

    const startMonth = useMemo(
      () => minDate ?? new Date(new Date().getFullYear() - 50, 0, 1),
      [minDate],
    );

    const endMonth = useMemo(
      () => maxDate ?? new Date(new Date().getFullYear() + 50, 11, 31),
      [maxDate],
    );

    const disabledMatchers = useMemo<Matcher[] | undefined>(() => {
      const matchers: Matcher[] = [];

      if (minDate) matchers.push({ before: minDate });
      if (maxDate) matchers.push({ after: maxDate });

      return matchers.length ? matchers : undefined;
    }, [maxDate, minDate]);

    useEffect(() => {
      if (!hiddenInputRef.current) return;
      hiddenInputRef.current.value = resolvedValue ?? "";
    }, [resolvedValue]);

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        hiddenInputRef.current = node;

        if (typeof ref === "function") {
          ref(node);
          return;
        }

        if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const emitChange = useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setInternalValue(nextValue);
        }

        const node = hiddenInputRef.current;
        if (!node) return;

        node.value = nextValue;
        onChange?.({
          target: node,
          currentTarget: node,
        } as React.ChangeEvent<HTMLInputElement>);
      },
      [isControlled, onChange],
    );

    const emitBlur = useCallback(() => {
      const node = hiddenInputRef.current;
      if (!node) return;

      onBlur?.({
        target: node,
        currentTarget: node,
      } as React.FocusEvent<HTMLInputElement>);
    }, [onBlur]);

    const defaultMonth = selectedDate ?? minDate ?? maxDate;

    return (
      <div className={cn("w-full min-w-0", wrapperClassName)}>
        <Popover
          open={open}
          onOpenChange={(nextOpen) => {
            if (disabled && nextOpen) return;
            setOpen(nextOpen);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              id={resolvedId}
              disabled={disabled}
              aria-invalid={props["aria-invalid"]}
              className={cn(
                FORM_CONTROL_TRANSPARENT_CLASS,
                "justify-start font-normal hover:bg-transparent dark:hover:bg-input/30",
                !label && "text-muted-foreground",
                className,
              )}
            >
              <span className="truncate">{label || placeholder}</span>
              <CalendarDays className="ml-auto size-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              defaultMonth={defaultMonth}
              startMonth={startMonth}
              endMonth={endMonth}
              captionLayout="dropdown"
              disabled={disabledMatchers}
              onSelect={(date) => {
                if (!date) return;

                emitChange(format(date, "yyyy-MM-dd"));
                emitBlur();
                setOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <input
          {...props}
          id={`${resolvedId}-value`}
          ref={setRefs}
          type="hidden"
          disabled={disabled}
          value={resolvedValue}
          defaultValue={undefined}
          onChange={onChange}
          onBlur={onBlur}
        />

        {errorMessage ? (
          <div className="mt-2">
            <ErrorMessage errorMsg={errorMessage} />
          </div>
        ) : null}
      </div>
    );
  },
);

NativeDateField.displayName = "NativeDateField";

export default NativeDateField;
