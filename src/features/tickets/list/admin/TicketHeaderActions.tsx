"use client";

import React, { FC, useState } from "react";
import { TICKET_STATUS } from "@/shared/enums/enums";
import {
  TicketFilterQuery,
  TicketQueryprops,
} from "@/features/tickets/models/ticket.model";
import { ticketListFilterData } from "@/features/tickets/data/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DateFilterMenu from "@/shared/components/date-filter-menu/DateFilterMenu";
import { ACTIVITY_LIST_DATE_PRESET_OPTIONS } from "@/shared/data/list-date-filter.data";
import type { ListDateFilterQuery } from "@/shared/model/list-date-filter.model";

const TicketHeaderActions: FC<TicketQueryprops> = ({ onFilter }) => {
  const [query, setQuery] = useState<TicketFilterQuery | null>({
    status: TICKET_STATUS.pending,
  });

  function applyQueryPatch(patch: TicketFilterQuery | null) {
    setQuery(patch);
    onFilter?.(patch);
  }

  function handleStatusTab(val: string) {
    applyQueryPatch(
      val === TICKET_STATUS.all
        ? null
        : { ...(query ?? {}), status: val as TICKET_STATUS },
    );
  }

  function handleDateRangeFilter(range: ListDateFilterQuery | null) {
    applyQueryPatch({
      ...(query ?? {}),
      dateFilter: range?.dateFilter ?? undefined,
      startDate: range?.startDate ?? undefined,
      endDate: range?.endDate ?? undefined,
    } as TicketFilterQuery);
  }

  return (
    <div className="flex w-full flex-col gap-2 text-xs text-muted-foreground xl:w-auto xl:flex-row xl:items-center">
      <Tabs
        value={query?.status ?? TICKET_STATUS.all}
        onValueChange={handleStatusTab}
        className="w-full xl:w-auto"
      >
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-full border border-border/70 bg-secondary p-1 shadow-none sm:w-auto xl:h-8">
          {ticketListFilterData.map((tab) => (
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
