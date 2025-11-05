"use client";
import React, { FC, useCallback, useState } from "react";
import TicketCard from "./TicketCard";
import { TICKET_STATUS } from "@/shared/enums/enums";
import { Ticket } from "@/shared/model/model";
import { ticketListFilterData } from "../data/data";
import FilterTabs from "@/shared/components/tabs/FilterTabs";
import Search from "@/shared/components/search/Search";
import { useDebounce } from "@uidotdev/usehooks";
import Empty from "@/shared/components/empty/Empty";
import AnimatedBorderWrapper from "@/shared/components/animation/AnimatedBorder";
import TicketCardLoader from "../loaders/TicketCardLoader";
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

        <FilterTabs
          status={status}
          onSelectValue={handleSelectedValue}
          data={ticketListFilterData}
        />
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
