"use client";
import { useCallback, useState } from "react";
import TicketList from "./list/TicketList";
import ToggleView from "@/shared/components/toggle-views/ToggleView";
import TransitionReveal from "@/shared/components/animation/TransitionReveal";
import TicketComponent from "@/features/ticket-feat/pages/TicketComponent";

export default function Home() {
  const [isList, setIsList] = useState(true);
  const handleChangeView = useCallback((val: boolean) => {
    setIsList(val);
  }, []);
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="title"> All Requests </h1>
      </div>

      <div className="flex items-center justify-end gap-2">
        <ToggleView isList={isList} onChangeView={handleChangeView} />
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
