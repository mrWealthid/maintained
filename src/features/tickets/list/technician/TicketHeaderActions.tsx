"use client";
import { FC, useState } from "react";
import { TECHNICIAN_RESPONSE } from "@/shared/enums/enums";
import {
  TicketFilterQuery,
  TicketQueryprops,
} from "@/features/tickets/models/ticket.model";
import { technicianListFilter } from "@/features/tickets/data/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DateFilterMenu from "@/shared/components/date-filter-menu/DateFilterMenu";
import { ACTIVITY_LIST_DATE_PRESET_OPTIONS } from "@/shared/data/list-date-filter.data";
import type { ListDateFilterQuery } from "@/shared/model/list-date-filter.model";

const TicketHeaderActions: FC<TicketQueryprops<TECHNICIAN_RESPONSE>> = ({
  onFilter,
}) => {
  const [status, setStatus] =
    useState<TECHNICIAN_RESPONSE>(TECHNICIAN_RESPONSE.all);

  function applyQueryPatch(patch: TicketFilterQuery<TECHNICIAN_RESPONSE>) {
    onFilter?.(patch);
  }

  function handleStatusTab(val: string) {
    const nextStatus = val as TECHNICIAN_RESPONSE;
    setStatus(nextStatus);
    applyQueryPatch({
      status:
        nextStatus === TECHNICIAN_RESPONSE.all ? undefined : nextStatus,
    });
  }

  function handleDateRangeFilter(range: ListDateFilterQuery | null) {
    applyQueryPatch({
      dateFilter: range?.dateFilter ?? undefined,
      startDate: range?.startDate ?? undefined,
      endDate: range?.endDate ?? undefined,
    } as TicketFilterQuery<TECHNICIAN_RESPONSE>);
  }

  return (
    <div className="flex w-full flex-col gap-2 text-xs text-muted-foreground xl:w-auto xl:flex-row xl:items-center">
      <Tabs
        value={status}
        onValueChange={handleStatusTab}
        className="w-full xl:w-auto"
      >
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border border-border/60 bg-muted/70 p-1 shadow-sm xl:h-8 xl:w-auto xl:flex-nowrap">
          {technicianListFilter.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="min-w-0 rounded-full px-3 py-1.5 text-[11px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground xl:py-1"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex w-full flex-nowrap items-center justify-end gap-2 overflow-x-auto pb-1 xl:w-auto xl:overflow-visible xl:pb-0">
        <DateFilterMenu
          onFilter={handleDateRangeFilter}
          triggerClassName="w-auto shrink-0"
          presetOptions={ACTIVITY_LIST_DATE_PRESET_OPTIONS}
        />
      </div>
    </div>
  );
};

export default TicketHeaderActions;
