"use client";
import React, { FC } from "react";
import { TICKET_STATUS } from "@/app/shared/enums/enums";
import { ButtonGroupTabsProps } from "@/app/shared/model/model";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FilterTabs: FC<ButtonGroupTabsProps<TICKET_STATUS>> = ({
  onSelectValue,
  status,
  data,
}) => {
  return (
    <section className="flex flex-1 ml-5 justify-end">
      <Tabs
        value={status}
        onValueChange={(val) => onSelectValue(val as TICKET_STATUS)}
        className="w-auto"
      >
        <TabsList className="bg-muted p-1 rounded-full shadow-sm space-x-1">
          {data.map((tab) => (
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
    </section>
  );
};

export default React.memo(FilterTabs);
