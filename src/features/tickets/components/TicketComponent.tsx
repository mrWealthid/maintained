"use client";
import React, { FC, useCallback, useState } from "react";
import TicketCard from "./TicketCard";
import { TICKET_STATUS } from "@/shared/enums/enums";
import { Ticket } from "@/shared/model/model";
import { ticketListFilterData } from "../data/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Search from "@/shared/components/search/Search";
import { useDebounce } from "@uidotdev/usehooks";
import Empty from "@/shared/components/empty/Empty";
import AnimatedBorderWrapper from "@/shared/components/animation/AnimatedBorder";
import TicketCardLoader from "./TicketCardLoader";
import { useFetchTickets } from "../hooks/ticketHooks";

const TicketComponent: FC = () => {
  const [status, setStatus] = useState<TICKET_STATUS>(TICKET_STATUS.pending);
  const [search, setSearch] = useState<string>("");

  const debouncedSearchTerm = useDebounce(search, 1000);

  const { isLoading, error, data, totalRecords, results, isRefetching } =
    useFetchTickets<Ticket>(status, { title: debouncedSearchTerm });

  const handleSelectedValue = useCallback(
    (val: TICKET_STATUS) => setStatus(val),
    [setStatus]
  );
  const handleSearchValue = useCallback(
    (val: string) => setSearch(val),
    [setSearch]
  );

  return (
    <section>
      <div className="flex flex-col md:flex-row overflow-x-auto gap-2   mb-3 md:justify-between flex-wrap  md:items-center">
        <Search placeHolder="Enter title" onSearch={handleSearchValue} />

        <Tabs
          value={status}
          onValueChange={(val) => handleSelectedValue(val as TICKET_STATUS)}
          className="w-full xl:w-auto"
        >
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border border-border/60 bg-muted/70 p-1 shadow-sm sm:w-auto">
            {ticketListFilterData.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="justify-start gap-3 rounded-full px-3 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading && (
        <section className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <AnimatedBorderWrapper key={i} loading={isLoading}>
              <TicketCardLoader key={i} />
            </AnimatedBorderWrapper>
          ))}
        </section>
      )}

      {data && data?.length > 0 && (
        <section className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2">
          {data?.map((ticket: Ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </section>
      )}
      {data?.length === 0 && !isLoading && <Empty />}
    </section>
  );
};

export default TicketComponent;
