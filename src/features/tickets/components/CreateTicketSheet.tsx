"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileClock, Save, Trash2, Wrench, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import ErrorList from "@/components/ui/ErrorList";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetFooter,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import type { CreateTicketPayload } from "@/shared/model/model";
import { useCreateTicket } from "@/features/tickets/hooks/ticketHooks";
import {
  ticketAdminCreateFormSchema,
  ticketCreateFormSchema,
  type TicketCreateFormValues,
} from "@/features/tickets/models/ticket-form.model";
import TicketForm from "@/features/tickets/forms/TicketForm";
import TicketSummary from "@/features/tickets/components/TicketSummary";
import { useAppContext } from "@/shared/contexts/AppContext";
import {
  buildTicketCreateDraftStorageKey,
  deleteTicketCreateDraft,
  loadTicketCreateDrafts,
  saveTicketCreateDraft,
  type TicketCreateDraft,
} from "@/features/tickets/helpers/ticket-create-draft.helper";

export const DEFAULT_TICKET_FORM_VALUES: TicketCreateFormValues = {
  title: "",
  area: "",
  description: "",
  category: "",
  type: "",
  relatedTo: "",
  property: "",
  unit: "",
};

type CreateTicketSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showPropertyUnitFields?: boolean;
  onCreated?: () => void;
};

export default function CreateTicketSheet({
  open,
  onOpenChange,
  showPropertyUnitFields = false,
  onCreated,
}: CreateTicketSheetProps) {
  const { user } = useAppContext();
  const { isCreating, handleCreateTicket, createTicketError } =
    useCreateTicket(false);
  const [closeDraftPromptOpen, setCloseDraftPromptOpen] = useState(false);
  const [closeDraftNamingMode, setCloseDraftNamingMode] = useState(false);
  const [resumeDraftPromptOpen, setResumeDraftPromptOpen] = useState(false);
  const [availableDrafts, setAvailableDrafts] = useState<TicketCreateDraft[]>(
    [],
  );
  const [draftNameInput, setDraftNameInput] = useState("");
  const draftStorageKey = useMemo(
    () =>
      buildTicketCreateDraftStorageKey({
        workspaceId: user.currentBusiness?.id,
        userEmail: user.email,
      }),
    [user.currentBusiness?.id, user.email],
  );

  const methods = useForm<TicketCreateFormValues>({
    resolver: zodResolver(
      showPropertyUnitFields
        ? ticketAdminCreateFormSchema
        : ticketCreateFormSchema,
    ) as never,
    mode: "onChange",
    defaultValues: DEFAULT_TICKET_FORM_VALUES,
  });
  const {
    formState: { isDirty, isValid },
    getValues,
    reset,
  } = methods;
  const ticketFormId = "create-ticket-form";

  function closeSheetAndReset() {
    setCloseDraftPromptOpen(false);
    setCloseDraftNamingMode(false);
    setResumeDraftPromptOpen(false);
    setAvailableDrafts([]);
    setDraftNameInput("");
    reset(DEFAULT_TICKET_FORM_VALUES);
    onOpenChange(false);
  }

  function handleSheetOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    if (isDirty && !isCreating) {
      setCloseDraftPromptOpen(true);
      return;
    }

    closeSheetAndReset();
  }

  useEffect(() => {
    if (open) {
      reset(DEFAULT_TICKET_FORM_VALUES);
      const drafts = loadTicketCreateDrafts(draftStorageKey);
      setAvailableDrafts(drafts);
      setResumeDraftPromptOpen(drafts.length > 0);
    }
  }, [draftStorageKey, open, reset]);

  function handleSaveDraftAndClose() {
    setCloseDraftNamingMode(true);
    setDraftNameInput("");
  }

  function handleSaveDraftWithName() {
    const draft = saveTicketCreateDraft({
      workspaceId: user.currentBusiness?.id,
      userEmail: user.email,
      values: getValues(),
      name: draftNameInput.trim() || undefined,
    });

    if (draft) {
      toast.success("Ticket draft saved.");
      closeSheetAndReset();
      return;
    }

    toast.error("Ticket draft could not be saved in this browser.");
  }

  function handleCancelNaming() {
    setCloseDraftNamingMode(false);
    setDraftNameInput("");
  }

  function handleDiscardDraftAndClose() {
    closeSheetAndReset();
  }

  function handleResumeDraft(draft: TicketCreateDraft) {
    reset(draft.values);
    setResumeDraftPromptOpen(false);
    setAvailableDrafts([]);
    toast.success(`Resumed draft: "${draft.name}"`);
  }

  function handleDeleteDraft(draftId: string) {
    deleteTicketCreateDraft(draftStorageKey, draftId);
    setAvailableDrafts((drafts) =>
      drafts.filter((draft) => draft.id !== draftId),
    );
  }

  function handleStartFresh() {
    deleteTicketCreateDraft(draftStorageKey);
    setAvailableDrafts([]);
    setResumeDraftPromptOpen(false);
    reset(DEFAULT_TICKET_FORM_VALUES);
  }

  const onSubmit = (
    data: CreateTicketPayload,
    actions?: { onSuccess: () => void; onError?: () => void },
  ) => {
    handleCreateTicket(data, {
      onSuccess: () => {
        actions?.onSuccess();
        deleteTicketCreateDraft(draftStorageKey);
        closeSheetAndReset();
        onCreated?.();
      },
      onError: () => {
        actions?.onError?.();
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
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
                  showPropertyUnitFields={showPropertyUnitFields}
                  onCancel={() => handleSheetOpenChange(false)}
                />
              </div>
              <div className="order-first min-w-0 lg:order-none">
                <TicketSummary showTicketType={false} />
              </div>
            </div>
          </AppSheetBody>
          <AppSheetFooter className="gap-3 sm:items-center sm:justify-end">
            <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:flex sm:items-center">
              <Button
                type="button"
                variant="outline"
                disabled={isCreating}
                onClick={() => handleSheetOpenChange(false)}
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

      <Dialog
        open={closeDraftPromptOpen}
        onOpenChange={(dialogOpen) => {
          setCloseDraftPromptOpen(dialogOpen);
          if (!dialogOpen) {
            setCloseDraftNamingMode(false);
            setDraftNameInput("");
          }
        }}
      >
        <AppDialogContent className="sm:max-w-xl">
          <AppDialogHeader
            icon={FileClock}
            title={
              closeDraftNamingMode ? "Name your draft" : "Save ticket draft?"
            }
            description={
              closeDraftNamingMode
                ? "Give your draft a name so it is easy to find later."
                : "You have unsaved ticket details. Save them as a draft before closing, or discard this form."
            }
          />
          <AppDialogBody>
            {closeDraftNamingMode ? (
              <Input
                placeholder="e.g. Kitchen leak request"
                value={draftNameInput}
                onChange={(event) => setDraftNameInput(event.target.value)}
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSaveDraftWithName();
                  }
                }}
              />
            ) : (
              <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                Drafts are stored on this browser for your current workspace and
                can be resumed the next time you create a ticket.
              </div>
            )}
          </AppDialogBody>
          <AppDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {closeDraftNamingMode ? (
              <>
                <Button type="button" variant="outline" onClick={handleCancelNaming}>
                  Back
                </Button>
                <Button
                  type="button"
                  className="gap-2"
                  onClick={handleSaveDraftWithName}
                >
                  <Save className="size-4" />
                  Save Draft
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCloseDraftPromptOpen(false)}
                >
                  Keep Editing
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2"
                  onClick={handleDiscardDraftAndClose}
                >
                  <Trash2 className="size-4" />
                  Discard
                </Button>
                <Button
                  type="button"
                  className="gap-2"
                  onClick={handleSaveDraftAndClose}
                >
                  <Save className="size-4" />
                  Save Draft
                </Button>
              </>
            )}
          </AppDialogFooter>
        </AppDialogContent>
      </Dialog>

      <Dialog
        open={resumeDraftPromptOpen}
        onOpenChange={setResumeDraftPromptOpen}
      >
        <AppDialogContent className="sm:max-w-2xl">
          <AppDialogHeader
            icon={FileClock}
            title={`Available drafts (${availableDrafts.length})`}
            description="Select a draft to resume, or start fresh."
          />
          <AppDialogBody>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {availableDrafts.length === 0 ? (
                <div className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  No drafts available.
                </div>
              ) : (
                availableDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {draft.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(draft.updatedAt).toLocaleDateString()} at{" "}
                        {new Date(draft.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteDraft(draft.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleResumeDraft(draft)}
                      >
                        Resume
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AppDialogBody>
          <AppDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResumeDraftPromptOpen(false)}
            >
              Not Now
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              onClick={handleStartFresh}
            >
              <Trash2 className="size-4" />
              Start Fresh
            </Button>
          </AppDialogFooter>
        </AppDialogContent>
      </Dialog>
    </FormProvider>
  );
}
