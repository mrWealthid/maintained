"use client";
import { useCallback, useState } from "react";
import AdminTicketList from "@/features/tickets/list/admin/TicketList";
import TechnicianTicketList from "@/features/tickets/list/technician/TicketList";
import ToggleView from "@/shared/components/toggle-views/ToggleView";
import TicketComponent from "@/features/tickets/components/TicketComponent";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppPageHeader from "@/shared/components/app-header/AppPageHeader";
import { useAppContext } from "@/shared/contexts/AppContext";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { ROLES } from "@/shared/enums/enums";
import CreateTicketSheet from "@/features/tickets/components/CreateTicketSheet";

export default function Home() {
  const [isList, setIsList] = useState(true);
  const [open, setOpen] = useState(false);
  const { user } = useAppContext();
  const canCreateTicket = useHasPermission(PERMISSION.TICKETS_CREATE);
  const isTechnician = user.role === ROLES.technician;
  const canSelectTicketLocation =
    user.role === ROLES.admin ||
    user.role === ROLES.owner ||
    user.role === ROLES.super_admin;

  const handleChangeView = useCallback((val: boolean) => {
    setIsList(val);
  }, []);

  const createTicketButton = canCreateTicket ? (
    <>
      <Button
        type="button"
        variant="outline"
        className="gap-1"
        onClick={() => setOpen(true)}
      >
        <PlusCircle className="h-[18px] w-[18px]" />
        Create Ticket
      </Button>
      <CreateTicketSheet
        open={open}
        onOpenChange={setOpen}
        showPropertyUnitFields={canSelectTicketLocation}
      />
    </>
  ) : null;

  return (
    <section className="flex  gap-6 flex-col ">
      <AppPageHeader
        title="Maintenance Requests"
        description="Browse, create, and manage maintenance tickets."
        actions={createTicketButton}
      />
      <section className="flex flex-col gap-2  w-full  items-end">
        <ToggleView isList={isList} onChangeView={handleChangeView} />
      </section>
      {!isList ? <TicketComponent /> : null}
      {isList && isTechnician ? <TechnicianTicketList /> : null}
      {isList && !isTechnician ? <AdminTicketList /> : null}
    </section>
  );
}
