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
  useTicketTypes,
  useDeleteTicketType,
  useUpdateTicketType,
} from "../hooks/settingsHooks";
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import TicketTypeModal from "./TicketTypeModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { TicketType } from "@/app/shared/model/model";

const TicketTypeManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<TicketType | null>(null);

  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  const { data: ticketTypes, isLoading } = useTicketTypes();
  const { handleDeleteTicketType, isDeleting } = useDeleteTicketType();
  const updateTicketType = useUpdateTicketType();

  const handleEdit = (ticketType: TicketType) => {
    setEditingType(ticketType);
    setIsModalOpen(true);
  };

  console.log("I rendered - TicketManagement");

  const handleCreate = () => {
    setEditingType(null);
    setIsModalOpen(true);
  };

  const isOpen = !!selectedTicket?.id;

  const handleDelete = (ticketType: TicketType) => {
    setSelectedTicket(ticketType);
  };

  const confirmDelete = () => {
    handleDeleteTicketType(selectedTicket?.id!, {
      onSuccess: () => setSelectedTicket(null),
    });
  };

  const handleToggleStatus = async (ticketType: TicketType) => {
    await updateTicketType.mutateAsync({
      id: ticketType.id,
      data: {
        name: ticketType.name,
        description: ticketType.description,
        isActive: !ticketType.isActive,
      },
    });
  };

  const handleClose = useCallback(() => {
    setSelectedTicket(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ticket Type Management</h2>
          <p className="text-gray-600">Create and manage ticket types</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Ticket Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Types</CardTitle>
          <CardDescription>Manage existing ticket types</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading ticket types...</div>
          ) : !ticketTypes || ticketTypes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No ticket types found
            </div>
          ) : (
            <div className="space-y-3">
              {ticketTypes.map((ticketType: TicketType) => (
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
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleEdit(ticketType)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!ticketType.isDefault && (
                          <DropdownMenuItem
                            onClick={() => handleDelete(ticketType)}
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

      <TicketTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingType={editingType}
      />

      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={confirmDelete}
        title="Delete Ticket Type"
        description="Are you sure you want to delete this ticket type? This action cannot be undone."
        itemName={selectedTicket?.name || ""}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TicketTypeManagement;
