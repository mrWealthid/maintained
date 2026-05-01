"use client";
import React, { FC, useState } from "react";
import { INVITE_STATUS } from "@/shared/enums/enums";
import { UserFilterQuery, UserQueryprops } from "@/shared/model/model";
import { userListFilter } from "../data/user.data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserHeaderActions: FC<UserQueryprops> = ({ onFilter }) => {
  const [query, setQuery] = useState<UserFilterQuery | null>({
    status: INVITE_STATUS.invited,
  });

  async function handleClick(query: UserFilterQuery | null) {
    setQuery(query);
    onFilter?.(query);
  }

  return (
    <>
      <Tabs
        value={query?.status ?? INVITE_STATUS.all}
        onValueChange={(val) =>
          handleClick(
            val === INVITE_STATUS.all ? null : { status: val as INVITE_STATUS }
          )
        }
        className="w-auto"
      >
        <TabsList className="bg-muted p-1 rounded-full shadow-sm space-x-1">
          {userListFilter.map((tab) => (
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

      {/*
			<select
				id="sort"
				name="sort"
				title="sortdropdown"
				className="text-xs font-light text-foreground focus-within:ring-0 focus-within:border-none border border-border bg-muted/40 rounded">
				<option value="">Sort By Amount(Highest)</option>
				<option value="">Sort By Amount(Lowest)</option>
				<option value="">Sort By Date(Recent)</option>
				<option value="">Sort By Date(Lowest)</option>
			</select> */}
    </>
  );
};

export default UserHeaderActions;
