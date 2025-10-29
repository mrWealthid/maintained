"use client";

import { useCallback, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Category } from "@/app/shared/model/model";

const CategoryManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const { data: categories, isLoading } = useCategories();
  const { handleDeleteCategory, isDeleting } = useDeleteCategory();
  const updateCategory = useUpdateCategory();

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Category Management</h2>
          <p className="text-gray-600">Create and manage ticket categories</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage existing ticket categories</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading categories...</div>
          ) : !categories || categories.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No categories found
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category: Category) => (
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
                      <p className="text-sm text-gray-600 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
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
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!category.isDefault && (
                          <DropdownMenuItem
                            onClick={() => handleDelete(category)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
