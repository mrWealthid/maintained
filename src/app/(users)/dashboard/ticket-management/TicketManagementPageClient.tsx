"use client";
import { useCallback, useState } from "react";
import AdminTicketList from "@/features/tickets/list/admin/TicketList";
import TechnicianTicketList from "@/features/tickets/list/technician/TicketList";
import ToggleView from "@/shared/components/toggle-views/ToggleView";
import TicketComponent from "@/features/tickets/components/TicketComponent";
import { InteractiveTicketChat } from "@/features/tickets/components/InteractiveTicketChat";
import { Bot, FilePlus, PlusCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManageTicketForm } from "@/features/tickets/models/ticket.model";
import { FormProvider, useForm } from "react-hook-form";
import TicketForm from "@/features/tickets/forms/TicketForm";
import { CreateTicketPayload } from "@/shared/model/model";
import { Sheet } from "@/components/ui/sheet";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import { useCreateTicket } from "@/features/tickets/hooks/ticketHooks";
import { useRouter } from "next/navigation";
import { APP_ROUTE_PATHS } from "@/shared/routes/appRoutePaths";
import { useAppContext } from "@/shared/contexts/AppContext";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { ROLES } from "@/shared/enums/enums";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const [isList, setIsList] = useState(true);
  const [open, setOpen] = useState(false);
  const { user } = useAppContext();
  const canCreateTicket = useHasPermission(PERMISSION.TICKETS_CREATE);
  const isTechnician = user.role === ROLES.technician;

  const handleChangeView = useCallback((val: boolean) => {
    setIsList(val);
  }, []);

  const { isCreating, handleCreateTicket } = useCreateTicket(false);

  const methods = useForm<ManageTicketForm>({ mode: "all" });
  const router = useRouter();

  const onSubmit = (
    data: CreateTicketPayload,
    actions?: { onSuccess: () => void }
  ) => {
    console.log("🔥 SUBMIT:", data);

    handleCreateTicket(data, {
      onSuccess: () => {
        actions?.onSuccess();
        router.push(APP_ROUTE_PATHS.DASHBOARD.TICKETS);
        setOpen(false);
      },
    });
  };

  return (
    <section className="flex  gap-6 flex-col ">
      <h1 className="title"> Maintenance Requests </h1>
      <section className="flex flex-col gap-2  w-full  items-end">
        {canCreateTicket ? (
          <FormProvider {...methods}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="gap-1">
                  <PlusCircle className="h-[18px] w-[18px]" />
                  Create Ticket
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => {
                      e.stopPropagation();
                      setOpen(true);
                    }}
                  >
                    <FilePlus size={14} /> Fill Ticket Form
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <InteractiveTicketChat onSubmit={onSubmit}>
                      <button
                        type="button"
                        className="relative flex gap-2 cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent w-full  hover:bg-accent focus:text-accent-foreground hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        role="button"
                      >
                        <Bot size={14} />
                        Chat-based Ticket
                      </button>
                    </InteractiveTicketChat>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={open} onOpenChange={setOpen}>
              <AppSheetContent
                side="bottom"
                className="h-full max-h-screen max-w-[100vw] md:max-w-full"
              >
                <AppSheetHeader
                  title="Manage Ticket"
                  description="Create a maintenance request from a focused workspace."
                  icon={Wrench}
                />
                <AppSheetBody className="mx-auto w-full max-w-4xl">
                  <TicketForm onSubmit={onSubmit} />
                </AppSheetBody>
              </AppSheetContent>
            </Sheet>
          </FormProvider>
        ) : null}

        <ToggleView isList={isList} onChangeView={handleChangeView} />
      </section>
      {!isList ? <TicketComponent /> : null}
      {isList && isTechnician ? <TechnicianTicketList /> : null}
      {isList && !isTechnician ? <AdminTicketList /> : null}
    </section>
  );
}
