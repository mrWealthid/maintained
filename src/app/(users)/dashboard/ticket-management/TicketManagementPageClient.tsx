"use client";
import { useCallback, useState } from "react";
import AdminTicketList from "@/features/tickets/list/admin/TicketList";
import TechnicianTicketList from "@/features/tickets/list/technician/TicketList";
import ToggleView from "@/shared/components/toggle-views/ToggleView";
import TicketComponent from "@/features/tickets/components/TicketComponent";
import { InteractiveTicketChat } from "@/features/tickets/components/InteractiveTicketChat";
import { Bot, FilePlus, PlusCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TicketForm from "@/features/tickets/forms/TicketForm";
import TicketSummary from "@/features/tickets/components/TicketSummary";
import {
  ticketCreateFormSchema,
  type TicketCreateFormValues,
} from "@/features/tickets/models/ticket-form.model";
import { CreateTicketPayload } from "@/shared/model/model";
import ErrorList from "@/components/ui/ErrorList";
import { Sheet } from "@/components/ui/sheet";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetFooter,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import { useCreateTicket } from "@/features/tickets/hooks/ticketHooks";
import { useRouter } from "next/navigation";
import { APP_ROUTE_PATHS } from "@/shared/routes/appRoutePaths";
import { useAppContext } from "@/shared/contexts/AppContext";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { ROLES } from "@/shared/enums/enums";
import { TICKET_PRIORITY } from "@/features/tickets/models/ticket-priority.model";

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
  const canSelectTicketLocation =
    user.role === ROLES.admin ||
    user.role === ROLES.owner ||
    user.role === ROLES.super_admin;

  const handleChangeView = useCallback((val: boolean) => {
    setIsList(val);
  }, []);

  const { isCreating, handleCreateTicket, createTicketError } =
    useCreateTicket(false);

  const methods = useForm<TicketCreateFormValues>({
    resolver: zodResolver(ticketCreateFormSchema) as never,
    mode: "all",
    defaultValues: {
      priority: TICKET_PRIORITY.medium,
      relatedTo: "",
      property: "",
      unit: "",
    },
  });
  const {
    formState: { isDirty, isValid },
  } = methods;
  const router = useRouter();
  const ticketFormId = "create-ticket-form";

  const onSubmit = (
    data: CreateTicketPayload,
    actions?: { onSuccess: () => void; onError?: () => void }
  ) => {
    handleCreateTicket(data, {
      onSuccess: () => {
        actions?.onSuccess();
        router.push(APP_ROUTE_PATHS.DASHBOARD.TICKETS);
        setOpen(false);
      },
      onError: () => {
        actions?.onError?.();
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
                        className="relative flex gap-2 cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors focus:bg-accent w-full  hover:bg-accent focus:text-accent-foreground hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
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
                className="h-[100dvh] max-h-[100dvh] max-w-[100vw] md:max-w-full"
              >
                <AppSheetHeader
                  title="Create Maintenance Ticket"
                  description="Create a maintenance request from a focused workspace."
                  icon={Wrench}
                />
                <AppSheetBody className="mx-auto w-full max-w-6xl">
                  <div className="mb-6">
                    <h1 className="text-xl font-bold text-foreground sm:text-3xl">
                      Create Maintenance Ticket
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Submit a new repair or maintenance request.
                    </p>
                  </div>
                  {createTicketError ? (
                    <div className="mb-6">
                      <ErrorList
                        error={createTicketError}
                        title="Could not create ticket"
                      />
                    </div>
                  ) : null}
                  <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                    <div className="min-w-0">
                      <TicketForm
                        formId={ticketFormId}
                        onSubmit={onSubmit}
                        showActions={false}
                        showPropertyUnitFields={canSelectTicketLocation}
                        onCancel={() => setOpen(false)}
                      />
                    </div>
                    <div className="order-first min-w-0 lg:order-none">
                      <TicketSummary />
                    </div>
                  </div>
                </AppSheetBody>
                <AppSheetFooter className="gap-3 sm:items-center sm:justify-end">
                  <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:flex sm:items-center">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isCreating}
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      form={ticketFormId}
                      disabled={!isValid || isCreating || !isDirty}
                    >
                      {isCreating ? "Creating..." : "Create Ticket"}
                    </Button>
                  </div>
                </AppSheetFooter>
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
