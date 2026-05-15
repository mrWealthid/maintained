"use client";

import { forwardRef, useCallback, useId, useRef } from "react";
import { Clock3 } from "lucide-react";

import { cn } from "@/lib/utils";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import { FORM_CONTROL_CLASS } from "@/shared/components/form-elements/form-control-styles";

type NativeTimeFieldProps = Omit<
  React.ComponentProps<"input">,
  "type"
> & {
  wrapperClassName?: string;
  placeholder?: string;
  errorMessage?: string;
};

function formatTimeLabel(value?: string) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return "";
  }

  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;

  return `${normalizedHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

const NativeTimeField = forwardRef<HTMLInputElement, NativeTimeFieldProps>(
  (
    {
      className,
      wrapperClassName,
      disabled,
      value,
      defaultValue,
      placeholder = "Select time",
      errorMessage,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const fallbackId = useId();
    let resolvedValue = "";

    if (typeof value === "string") {
      resolvedValue = value;
    } else if (typeof defaultValue === "string") {
      resolvedValue = defaultValue;
    }

    const label = formatTimeLabel(resolvedValue);
    const resolvedId = props.id ?? fallbackId;

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;

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

    const openPicker = useCallback(() => {
      if (disabled) return;

      const node = inputRef.current;
      if (!node) return;

      node.focus();

      if ("showPicker" in node && typeof node.showPicker === "function") {
        node.showPicker();
      }
    }, [disabled]);

    return (
      <div className={cn("relative w-full min-w-0", wrapperClassName)}>
        <div
          aria-hidden="true"
          className={cn(
            FORM_CONTROL_CLASS,
            "flex min-w-0 items-center px-3 py-1 text-sm transition-[border-color,box-shadow]",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
            disabled ? "cursor-not-allowed opacity-50" : null,
            props["aria-invalid"]
              ? "border-destructive ring-destructive/20"
              : null,
            className,
          )}
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              label ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {label || placeholder}
          </span>
          <Clock3 className="ml-2 size-4 shrink-0 text-muted-foreground" />
        </div>

        <input
          {...props}
          id={resolvedId}
          ref={setRefs}
          type="time"
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onClick={props.onClick}
          onFocus={(event) => {
            props.onFocus?.(event);
            openPicker();
          }}
          className={cn(
            "absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0",
            disabled ? "cursor-not-allowed" : null,
          )}
        />

        {errorMessage ? <div className="mt-2"><ErrorMessage errorMsg={errorMessage} /></div> : null}
      </div>
    );
  },
);

NativeTimeField.displayName = "NativeTimeField";

export default NativeTimeField;
