"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCategories,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/settingsHooks";
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import CategoryModal from "./CategoryModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { Category } from "@/shared/model/model";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { SettingsSection } from "./SettingsSection";

const CategoryManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const { data: categories, isLoading } = useCategories();
  const { handleDeleteCategory, isDeleting } = useDeleteCategory();
  const updateCategory = useUpdateCategory();
  const canManageCategories = useHasPermission(
    PERMISSION.TICKET_CATEGORIES_MANAGE
  );

  const isOpen = !!selectedCategory?.id;
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
  };

  const confirmDelete = () => {
    handleDeleteCategory(selectedCategory?.id!, {
      onSuccess: () => setSelectedCategory(null),
    });
  };

  const handleToggleStatus = async (category: Category) => {
    await updateCategory.mutateAsync({
      id: category.id,
      data: {
        name: category.name,
        description: category.description,
        isActive: !category.isActive,
      },
    });
  };

  const handleClose = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  const hasCategories = Boolean(categories?.length);

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Category Management"
        description="Create and manage ticket categories"
        icon={Plus}
        actions={
          canManageCategories ? (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          ) : null
        }
      >
        {isLoading && (
          <div className="text-center py-4">Loading categories...</div>
        )}
        {!isLoading && !hasCategories && (
          <div className="text-center py-4 text-muted-foreground">
            No categories found
          </div>
        )}
        {!isLoading && hasCategories && (
          <div className="space-y-3">
            {categories!.map((category: Category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <Badge
                      variant={category.isActive ? "outline" : "secondary"}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {category.isDefault && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {canManageCategories && (
                    <>
                      <Switch
                        checked={category.isActive}
                        onCheckedChange={() => handleToggleStatus(category)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {!category.isDefault && (
                            <DropdownMenuItem
                              onClick={() => handleDelete(category)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingCategory={editingCategory}
      />

      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={confirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        itemName={selectedCategory?.name || ""}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CategoryManagement;
