"use client";
import { useCallback, useState } from "react";
import TicketList from "@/app/admin/dashboard/ticket-management/list/TicketList";
import ToggleView from "@/app/shared/components/toggle-views/ToggleView";
import TicketComponent from "@/app/shared/features/ticket-feat/pages/TicketComponent";
import { CiCirclePlus } from "react-icons/ci";
import TransitionReveal from "@/app/shared/components/animation/TransitionReveal";
import { InteractiveTicketChat } from "@/app/shared/features/ticket-feat/pages/InteractiveTicketChat";
import { Bot, FilePlus } from "lucide-react";
import { ManageTicketForm } from "@/app/shared/features/ticket-feat/model/ticket.model";
import { FormProvider, useForm } from "react-hook-form";
import TicketForm from "@/app/shared/features/ticket-feat/form/TicketForm";
import { CreateTicketPayload } from "@/app/shared/model/model";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateTicket } from "@/app/shared/features/ticket-feat/hooks/ticketHooks";
import { useRouter } from "next/navigation";
import { ROUTES_DEFINITION } from "@/app/shared/routes/routes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const [isList, setIsList] = useState(false);
  const [open, setOpen] = useState(false);

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
        router.push(ROUTES_DEFINITION.DASHBOARD.TICKETS);
        setOpen(false);
      },
    });
  };

  return (
    <section className="flex  gap-6 flex-col ">
      <h1 className="title"> Maintenance Requests </h1>
      <section className="flex flex-col gap-2  w-full  items-end">
        <FormProvider {...methods}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="btn-primary bg-card flex items-center gap-1 rounded-lg"
              >
                <CiCirclePlus size={18} />
                Create Ticket
              </button>
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
            <SheetContent
              side="bottom"
              className="w-full  overflow-y-auto h-full max-h-screen   max-w-[100vw] md:max-w-full"
            >
              <div className="w-full  flex flex-col gap-4 py-4 px-2 sm:w-2/3 sm:mx-auto sm:px-4">
                <SheetHeader>
                  <SheetTitle>Manage Ticket</SheetTitle>
                  <SheetDescription>
                    Seamlessly manage requests
                  </SheetDescription>
                </SheetHeader>

                <TicketForm onSubmit={onSubmit} />
              </div>
            </SheetContent>
          </Sheet>
        </FormProvider>

        <ToggleView isList={isList} onChangeView={handleChangeView} />
      </section>
      {isList ? (
        <TransitionReveal keyId="list">
          <TicketList />
        </TransitionReveal>
      ) : (
        <TransitionReveal keyId="tile">
          <TicketComponent />
        </TransitionReveal>
      )}
    </section>
  );
}
