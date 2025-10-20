"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CategoryFormData } from "../model/settings.model";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Category } from "@/app/shared/model/model";

// interface Category {
//   _id: string;
//   name: string;
//   description: string;
//   isActive: boolean;
//   isDefault: boolean;
//   business: string;
// }

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tickets/categories");
      const data = await response.json();
      if (data.status === "success") {
        setCategories(data.data);
      }
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);
    try {
      const url = editingCategory
        ? `/api/tickets/categories/${editingCategory.id}`
        : "/api/tickets/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingCategory
            ? "Category updated successfully"
            : "Category created successfully"
        );
        setShowForm(false);
        setEditingCategory(null);
        setFormData({ name: "", description: "", isActive: true });
        loadCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save category");
      }
    } catch (error) {
      toast.error("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", isActive: true });
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      const response = await fetch(`/api/tickets/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      if (response.ok) {
        toast.success("Category status updated");
        loadCategories();
      } else {
        toast.error("Failed to update category status");
      }
    } catch (error) {
      toast.error("Failed to update category status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Category Management</h2>
          <p className="text-gray-600">Create and manage ticket categories</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCategory ? "Edit Category" : "Create New Category"}
            </CardTitle>
            <CardDescription>
              {editingCategory
                ? "Update category details"
                : "Add a new ticket category"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading
                    ? "Saving..."
                    : editingCategory
                      ? "Update"
                      : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage existing ticket categories</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No categories found
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
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
                      disabled={category.isDefault}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManagement;
