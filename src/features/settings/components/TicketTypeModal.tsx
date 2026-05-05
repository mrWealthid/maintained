"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Ticket } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import { TicketTypeFormData } from "../models/settings.model";
import {
  useCreateTicketType,
  useUpdateTicketType,
  useCreateAppTicketType,
  useUpdateAppTicketType,
} from "../hooks/settingsHooks";

interface TicketTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingType?: any;
  scope?: "workspace" | "app";
}

const TicketTypeModal: React.FC<TicketTypeModalProps> = ({
  isOpen,
  onClose,
  editingType,
  scope = "workspace",
}) => {
  const form = useForm<TicketTypeFormData>({
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const createWorkspaceTicketType = useCreateTicketType();
  const updateWorkspaceTicketType = useUpdateTicketType();
  const createAppTicketType = useCreateAppTicketType();
  const updateAppTicketType = useUpdateAppTicketType();
  const createTicketType =
    scope === "app" ? createAppTicketType : createWorkspaceTicketType;
  const updateTicketType =
    scope === "app" ? updateAppTicketType : updateWorkspaceTicketType;

  useEffect(() => {
    if (editingType) {
      form.reset({
        name: editingType.name,
        description: editingType.description,
        isActive: editingType.isActive,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        isActive: true,
      });
    }
  }, [editingType, isOpen, form]);

  const onSubmit = async (data: TicketTypeFormData) => {
    try {
      if (editingType) {
        await updateTicketType.mutateAsync({
          id: editingType.id ?? editingType._id,
          data,
        });
      } else {
        await createTicketType.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const isLoading = createTicketType.isPending || updateTicketType.isPending;
  let submitLabel = "Create";
  if (isLoading) {
    submitLabel = "Saving...";
  } else if (editingType) {
    submitLabel = "Update";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AppDialogContent className="sm:max-w-lg">
        <AppDialogHeader
          title={editingType ? "Edit Ticket Type" : "Create New Ticket Type"}
          description={
            editingType
              ? "Update request type details used for workflow routing."
              : scope === "app"
                ? "Add a new platform-wide request type available to every workspace."
                : "Add a new request type for this workspace."
          }
          icon={Ticket}
        />
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              form.handleSubmit(onSubmit)(e);
            }}
            className="contents"
          >
            <AppDialogBody>
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Ticket type name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket Type Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ticket type name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter ticket type description"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/25 p-4">
                    <div className="space-y-1">
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Active ticket types can be selected on new requests.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </AppDialogBody>

            <AppDialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>{submitLabel}</Button>
            </AppDialogFooter>
          </form>
        </Form>
      </AppDialogContent>
    </Dialog>
  );
};

export default TicketTypeModal;
