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
import { TicketTypeFormData } from "../model/settings.model";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { TicketType } from "@/app/shared/model/model";

// interface TicketType {
//   _id: string;
//   name: string;
//   description: string;
//   isActive: boolean;
//   isDefault: boolean;
//   business: string;
// }

const TicketTypeManagement: React.FC = () => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<TicketType | null>(null);
  const [formData, setFormData] = useState<TicketTypeFormData>({
    name: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    loadTicketTypes();
  }, []);

  const loadTicketTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tickets/types");
      const data = await response.json();
      if (data.status === "success") {
        setTicketTypes(data.data);
      }
    } catch (error) {
      toast.error("Failed to load ticket types");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Ticket type name is required");
      return;
    }

    setLoading(true);
    try {
      const url = editingType
        ? `/api/tickets/types/${editingType.id}`
        : "/api/tickets/types";
      const method = editingType ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingType
            ? "Ticket type updated successfully"
            : "Ticket type created successfully"
        );
        setShowForm(false);
        setEditingType(null);
        setFormData({ name: "", description: "", isActive: true });
        loadTicketTypes();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save ticket type");
      }
    } catch (error) {
      toast.error("Failed to save ticket type");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ticketType: TicketType) => {
    setEditingType(ticketType);
    setFormData({
      name: ticketType.name,
      description: ticketType.description,
      isActive: ticketType.isActive,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingType(null);
    setFormData({ name: "", description: "", isActive: true });
  };

  const handleToggleStatus = async (ticketType: TicketType) => {
    try {
      const response = await fetch(`/api/tickets/types/${ticketType.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !ticketType.isActive }),
      });

      if (response.ok) {
        toast.success("Ticket type status updated");
        loadTicketTypes();
      } else {
        toast.error("Failed to update ticket type status");
      }
    } catch (error) {
      toast.error("Failed to update ticket type status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ticket Type Management</h2>
          <p className="text-gray-600">Create and manage ticket types</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-2" />
          Add Ticket Type
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingType ? "Edit Ticket Type" : "Create New Ticket Type"}
            </CardTitle>
            <CardDescription>
              {editingType
                ? "Update ticket type details"
                : "Add a new ticket type"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Ticket Type Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter ticket type name"
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
                  placeholder="Enter ticket type description"
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
                  {loading ? "Saving..." : editingType ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ticket Types</CardTitle>
          <CardDescription>Manage existing ticket types</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading ticket types...</div>
          ) : ticketTypes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No ticket types found
            </div>
          ) : (
            <div className="space-y-3">
              {ticketTypes.map((ticketType) => (
                <div
                  key={ticketType.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{ticketType.name}</h3>
                      <Badge
                        variant={ticketType.isActive ? "outline" : "secondary"}
                      >
                        {ticketType.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {ticketType.isDefault && (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </div>
                    {ticketType.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {ticketType.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={ticketType.isActive}
                      onCheckedChange={() => handleToggleStatus(ticketType)}
                      disabled={ticketType.isDefault}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(ticketType)}
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

export default TicketTypeManagement;
