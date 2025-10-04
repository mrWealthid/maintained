"use client";
import React, { FC, useState } from "react";
import { TECHNICIAN_RESPONSE } from "@/app/shared/enums/enums";
import {
  TicketFilterQuery,
  TicketQueryprops,
} from "@/app/shared/features/ticket-feat/model/ticket.model";
import { technicianListFilter } from "@/app/shared/features/ticket-feat/data/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
const TicketHeaderActions: FC<TicketQueryprops<TECHNICIAN_RESPONSE>> = ({
  handleFilter,
}) => {
  const [query, setQuery] =
    useState<TicketFilterQuery<TECHNICIAN_RESPONSE> | null>({
      status: TECHNICIAN_RESPONSE.pending,
    });

  async function handleClick(
    query: TicketFilterQuery<TECHNICIAN_RESPONSE> | null
  ) {
    setQuery(query);
    handleFilter?.(query);
  }

  return (
    <>
      <Tabs
        value={query?.status ?? TECHNICIAN_RESPONSE.all}
        onValueChange={(val) =>
          handleClick(
            val === TECHNICIAN_RESPONSE.all
              ? null
              : { status: val as TECHNICIAN_RESPONSE }
          )
        }
        className="w-auto"
      >
        <TabsList className="bg-muted p-1 rounded-full shadow-sm space-x-1">
          {technicianListFilter.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-full text-xs px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-foreground transition-all"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
};

export default TicketHeaderActions;
