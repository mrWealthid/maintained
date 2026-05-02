"use client";

import { useMemo, useState } from "react";
import { CalendarRange, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import NativeDateField from "@/shared/components/input/NativeDateField";
import {
  ACTIVITY_LIST_DATE_PRESET_OPTIONS,
  LIST_DATE_FILTER_LABELS,
} from "@/shared/data/list-date-filter.data";
import {
  LIST_DATE_FILTER,
  type ListDateFilter,
  type ListDateFilterQuery,
} from "@/shared/model/list-date-filter.model";
import {
  buildCustomListDateFilterQuery,
  buildListDateFilterQuery,
} from "@/lib/date/list-date-filter";
import { cn } from "@/lib/utils";

interface DateFilterMenuProps {
  onFilter: (range: ListDateFilterQuery | null) => void;
  presetOptions?: readonly ListDateFilter[];
  triggerClassName?: string;
  value?: ListDateFilter;
  triggerLabel?: string;
}

export default function DateFilterMenu({
  onFilter,
  presetOptions = ACTIVITY_LIST_DATE_PRESET_OPTIONS,
  triggerClassName,
  value,
  triggerLabel,
}: DateFilterMenuProps) {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [internalActiveFilter, setInternalActiveFilter] =
    useState<ListDateFilter>(value ?? LIST_DATE_FILTER.ALL);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const activeFilter = value ?? internalActiveFilter;

  const handleCustomApply = () => {
    if (!startDate || !endDate) return;
    if (new Date(startDate) > new Date(endDate)) return;

    setInternalActiveFilter(LIST_DATE_FILTER.CUSTOM);
    onFilter(buildCustomListDateFilterQuery({ startDate, endDate }));

    setOpen(false);
    setShowCustom(false);
  };

  const handleClear = () => {
    setInternalActiveFilter(LIST_DATE_FILTER.ALL);
    onFilter(null);

    setShowCustom(false);
    setStartDate("");
    setEndDate("");
    setOpen(false);
  };

  const label = useMemo(() => {
    if (triggerLabel) {
      return triggerLabel;
    }

    return LIST_DATE_FILTER_LABELS[activeFilter] ?? "Date Filter";
  }, [activeFilter, triggerLabel]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between border xl:w-auto",
            triggerClassName,
          )}
        >
          <span className="truncate text-left">{label}</span>
          <CalendarRange size={16} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {!showCustom ? (
          <>
            {presetOptions
              .filter((preset) => preset !== LIST_DATE_FILTER.CUSTOM)
              .map((preset) => (
                <DropdownMenuItem
                  key={preset}
                  onClick={() => {
                    setInternalActiveFilter(preset);
                    onFilter(buildListDateFilterQuery(preset));
                    setOpen(false);
                    setShowCustom(false);
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  {LIST_DATE_FILTER_LABELS[preset]}
                </DropdownMenuItem>
              ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setShowCustom(true);
              }}
            >
              Custom Date Range
            </DropdownMenuItem>
          </>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Custom Date Range
              </span>
              <button
                type="button"
                onClick={() => setShowCustom(false)}
                className="p-0.5 hover:bg-muted rounded-md transition-colors"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label
                  className="text-xs font-medium text-foreground"
                  htmlFor="list-date-filter-start"
                >
                  Start Date
                </Label>
                <NativeDateField
                  id="list-date-filter-start"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="From date"
                />
              </div>

              <div className="flex items-center justify-center h-6">
                <div className="w-0.5 h-full bg-border/50" />
              </div>

              <div className="space-y-1.5">
                <Label
                  className="text-xs font-medium text-foreground"
                  htmlFor="list-date-filter-end"
                >
                  End Date
                </Label>
                <NativeDateField
                  id="list-date-filter-end"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="To date"
                />
              </div>
            </div>

            {startDate && endDate && (
              <div className="rounded-md bg-primary/5 border border-primary/20 px-2.5 py-1.5">
                <p className="text-xs text-foreground/70">
                  <span className="font-medium text-foreground">
                    {startDate}
                  </span>
                  {" - "}
                  <span className="font-medium text-foreground">{endDate}</span>
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={handleCustomApply}
                size="sm"
                variant="default"
                className="flex-1"
                disabled={
                  !startDate ||
                  !endDate ||
                  new Date(startDate) > new Date(endDate)
                }
              >
                Apply
              </Button>

              <Button
                type="button"
                onClick={handleClear}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
