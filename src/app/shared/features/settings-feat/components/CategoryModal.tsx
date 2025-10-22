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
import { CategoryFormData } from "../model/settings.model";
import { useCreateCategory, useUpdateCategory } from "../hooks/settingsHooks";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory?: any;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  editingCategory,
}) => {
  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

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
          id: editingCategory._id,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? "Edit Category" : "Create New Category"}
          </DialogTitle>
          <DialogDescription>
            {editingCategory
              ? "Update category details"
              : "Add a new ticket category"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                {isLoading
                  ? "Saving..."
                  : editingCategory
                    ? "Update"
                    : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;
