"use client";

import { useState } from "react";
import TicketList from "./list/TicketList";
import ToggleView from "@/app/shared/components/toggle-views/ToggleView";
import TransitionReveal from "@/app/shared/components/animation/TransitionReveal";
import TicketComponent from "@/app/shared/features/ticket-feat/pages/TicketComponent";

export default function Home() {
  const [isList, setIsList] = useState(true);
  function handleChangeView(val: boolean) {
    setIsList(val);
  }
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="title"> All Requests </h1>
      </div>

      <div className="flex items-center justify-end gap-2">
        <ToggleView isList={isList} handleChangeView={handleChangeView} />
      </div>
      {isList ? (
        <TransitionReveal keyId="list">
          <TicketList />
        </TransitionReveal>
      ) : (
        <TransitionReveal keyId="tile">
          <TicketComponent />
        </TransitionReveal>
      )}
    </div>
  );
}
