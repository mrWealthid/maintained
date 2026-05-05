"use client";

import { FC, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TEAM_LIST_STATUS_TABS } from "../data/list-data";
import { TEAM_MEMBER_STATUS } from "../models/team.model";

type TeamHeaderActionsProps = {
  onFilter?: (query: Record<string, string> | null) => void;
};

const TeamHeaderActions: FC<TeamHeaderActionsProps> = ({ onFilter }) => {
  const [status, setStatus] = useState<"all" | TEAM_MEMBER_STATUS>("all");

  function applyQueryPatch(patch: Record<string, string | undefined>) {
    onFilter?.(patch as Record<string, string>);
  }

  return (
    <div className="flex w-full flex-col gap-2 text-xs text-muted-foreground xl:w-auto xl:flex-row xl:items-center">
      <Tabs
        value={status}
        onValueChange={(value) => {
          const nextStatus = value as "all" | TEAM_MEMBER_STATUS;
          setStatus(nextStatus);
          applyQueryPatch({
            status: nextStatus === "all" ? "" : nextStatus,
          });
        }}
        className="w-full xl:w-auto"
      >
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border border-border/60 bg-muted/70 p-1 shadow-sm xl:h-8 xl:w-auto xl:flex-nowrap">
          {TEAM_LIST_STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="min-w-fit rounded-full px-3 py-1.5 text-[11px] transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground xl:py-1"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TeamHeaderActions;
