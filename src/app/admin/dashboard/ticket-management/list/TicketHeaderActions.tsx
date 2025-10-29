"use client";

import React, { FC, useState } from "react";
import { TICKET_STATUS } from "@/app/shared/enums/enums";
import {
  TicketFilterQuery,
  TicketQueryprops,
} from "@/app/shared/features/ticket-feat/model/ticket.model";
import { ticketListFilterData } from "@/app/shared/features/ticket-feat/data/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const TicketHeaderActions: FC<TicketQueryprops> = ({
  handleFilter,
  summary,
}) => {
  const [query, setQuery] = useState<TicketFilterQuery | null>({
    status: TICKET_STATUS.pending,
  });

  async function handleClick(query: TicketFilterQuery | null) {
    setQuery(query);
    handleFilter?.(query);
  }

  return (
    <>
      <Tabs
        value={query?.status ?? TICKET_STATUS.all}
        onValueChange={(val) =>
          handleClick(
            val === TICKET_STATUS.all ? null : { status: val as TICKET_STATUS }
          )
        }
        className="w-auto"
      >
        <TabsList className="bg-muted p-1 rounded-full shadow-sm">
          {ticketListFilterData.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-full text-xs flex justify-between py-1 data-[state=active]:bg-primary data-[state=active]:text-foreground transition-all"
            >
              {tab.label}
              {summary && summary[tab.value] !== undefined && (
                <Badge variant="secondary" className="rounded-full ml-1">
                  {summary[tab.value]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
};

export default TicketHeaderActions;
