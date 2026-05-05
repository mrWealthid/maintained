"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FolderOpen } from "lucide-react";

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
import { CategoryFormData } from "../models/settings.model";
import {
  useCreateCategory,
  useUpdateCategory,
  useCreateAppCategory,
  useUpdateAppCategory,
} from "../hooks/settingsHooks";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory?: any;
  scope?: "workspace" | "app";
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  editingCategory,
  scope = "workspace",
}) => {
  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const createWorkspaceCategory = useCreateCategory();
  const updateWorkspaceCategory = useUpdateCategory();
  const createAppCategory = useCreateAppCategory();
  const updateAppCategory = useUpdateAppCategory();
  const createCategory =
    scope === "app" ? createAppCategory : createWorkspaceCategory;
  const updateCategory =
    scope === "app" ? updateAppCategory : updateWorkspaceCategory;

  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        description: editingCategory.description,
        isActive: editingCategory.isActive,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        isActive: true,
      });
    }
  }, [editingCategory, isOpen, form]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id ?? editingCategory._id,
          data,
        });
      } else {
        await createCategory.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const isLoading = createCategory.isPending || updateCategory.isPending;
  let submitLabel = "Create";
  if (isLoading) {
    submitLabel = "Saving...";
  } else if (editingCategory) {
    submitLabel = "Update";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AppDialogContent className="sm:max-w-lg">
        <AppDialogHeader
          title={editingCategory ? "Edit Category" : "Create New Category"}
          description={
            editingCategory
              ? "Update category details used for ticket intake and reporting."
              : "Add a new ticket category for this workspace."
          }
          icon={FolderOpen}
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="contents">
            <AppDialogBody>
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Category name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
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
                        placeholder="Enter category description"
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
                        Active categories can be selected on new tickets.
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

export default CategoryModal;
