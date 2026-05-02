"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DayPicker,
  type DropdownProps,
  getDefaultClassNames,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const calendarPlainTone =
  "[&>button]:bg-primary [&>button]:text-primary-foreground hover:[&>button]:bg-primary/90 focus:[&>button]:bg-primary/90 dark:[&>button]:bg-white dark:[&>button]:text-black dark:hover:[&>button]:bg-white/90 dark:focus:[&>button]:bg-white/90";

const calendarPlainToneSoft =
  "[&>button]:border [&>button]:border-primary/30 [&>button]:bg-primary/10 [&>button]:text-primary dark:[&>button]:border-white/20 dark:[&>button]:bg-white/10 dark:[&>button]:text-white";

const calendarDisabledTone =
  "[&>button]:cursor-not-allowed [&>button]:border-transparent [&>button]:bg-muted/40 [&>button]:text-muted-foreground [&>button]:opacity-60 [&>button]:line-through hover:[&>button]:bg-muted/40 dark:[&>button]:bg-muted/25 dark:[&>button]:text-muted-foreground/80 dark:hover:[&>button]:bg-muted/25";

function CalendarDropdown({
  className,
  disabled,
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
}: DropdownProps) {
  return (
    <Select
      value={value !== undefined ? String(value) : undefined}
      disabled={disabled}
      onValueChange={(nextValue) => {
        onChange?.({
          target: { value: nextValue },
          currentTarget: { value: nextValue },
        } as React.ChangeEvent<HTMLSelectElement>);
      }}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          "h-8 w-fit gap-1 border-0 bg-transparent px-2 text-sm shadow-none focus:ring-0",
          className
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent branch>
        {options?.map((option) => (
          <SelectItem
            key={String(option.value)}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 sm:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1", defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-8 bg-transparent p-0 opacity-80 hover:opacity-100 aria-disabled:pointer-events-none aria-disabled:opacity-40",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-8 bg-transparent p-0 opacity-80 hover:opacity-100 aria-disabled:pointer-events-none aria-disabled:opacity-40",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "relative mx-10 flex h-8 items-center justify-center",
          defaultClassNames.month_caption
        ),
        dropdowns: cn("flex items-center gap-1.5", defaultClassNames.dropdowns),
        caption_label: cn(
          "select-none font-medium",
          props.captionLayout === "label"
            ? "text-sm"
            : "flex h-8 items-center rounded-md pl-2 pr-1 text-sm",
          defaultClassNames.caption_label
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "w-9 text-[0.8rem] font-normal text-muted-foreground",
          defaultClassNames.weekday
        ),
        weeks: cn(defaultClassNames.weeks),
        week: cn("mt-2 flex w-max", defaultClassNames.week),
        day: cn(
          "relative size-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
          defaultClassNames.day
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100",
          defaultClassNames.day_button
        ),
        selected: cn(
          calendarPlainTone,
          defaultClassNames.selected
        ),
        today: cn(calendarPlainToneSoft, defaultClassNames.today),
        outside: cn("text-muted-foreground opacity-50", defaultClassNames.outside),
        disabled: cn(calendarDisabledTone, defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", className)} {...iconProps} />
          ) : (
            <ChevronRight className={cn("size-4", className)} {...iconProps} />
          ),
        Dropdown: CalendarDropdown,
        ...components,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
