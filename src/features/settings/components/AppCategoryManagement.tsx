"use client";

import { useCallback, useState } from "react";
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";

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
  useAppCategories,
  useDeleteAppCategory,
  useUpdateAppCategory,
} from "../hooks/settingsHooks";
import { Category } from "@/shared/model/model";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { SettingsSection } from "./SettingsSection";
import CategoryModal from "./CategoryModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export default function AppCategoryManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const { data: categories, isLoading } = useAppCategories();
  const { handleDeleteAppCategory, isDeleting } = useDeleteAppCategory();
  const updateCategory = useUpdateAppCategory();
  const canManage = useHasPermission(PERMISSION.PLATFORM_SETTINGS_MANAGE);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedCategory?.id) return;
    handleDeleteAppCategory(selectedCategory.id, {
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

  const handleClose = useCallback(() => setSelectedCategory(null), []);
  const hasCategories = Boolean(categories?.length);

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Platform Categories"
        description="Default ticket categories available to every workspace"
        icon={Plus}
        actions={
          canManage ? (
            <Button type="button" onClick={handleCreate}>
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
            No platform categories yet
          </div>
        )}
        {!isLoading && hasCategories && (
          <div className="space-y-3">
            {categories!.map((category: Category) => {
              const canEditCategory = canManage && !category.isSystem;

              return (
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
                      <Badge variant="outline">Platform</Badge>
                      {category.isSystem && (
                        <Badge variant="secondary">System</Badge>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {canEditCategory && (
                      <>
                        <Switch
                          checked={category.isActive}
                          onCheckedChange={() => handleToggleStatus(category)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" size="sm">
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
                            <DropdownMenuItem
                              onClick={() => setSelectedCategory(category)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsSection>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingCategory={editingCategory}
        scope="app"
      />

      <DeleteConfirmationModal
        isOpen={!!selectedCategory?.id}
        onClose={handleClose}
        onConfirm={confirmDelete}
        title="Delete Platform Category"
        description="This category will be removed for every workspace. This action cannot be undone."
        itemName={selectedCategory?.name || ""}
        isLoading={isDeleting}
      />
    </div>
  );
}
