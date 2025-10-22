"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { TicketTypeFormData } from "../model/settings.model";
import {
  useCreateTicketType,
  useUpdateTicketType,
} from "../hooks/settingsHooks";

interface TicketTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingType?: any;
}

const TicketTypeModal: React.FC<TicketTypeModalProps> = ({
  isOpen,
  onClose,
  editingType,
}) => {
  const form = useForm<TicketTypeFormData>({
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const createTicketType = useCreateTicketType();
  const updateTicketType = useUpdateTicketType();

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
          id: editingType._id,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingType ? "Edit Ticket Type" : "Create New Ticket Type"}
          </DialogTitle>
          <DialogDescription>
            {editingType
              ? "Update ticket type details"
              : "Add a new ticket type"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Active</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingType ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TicketTypeModal;
