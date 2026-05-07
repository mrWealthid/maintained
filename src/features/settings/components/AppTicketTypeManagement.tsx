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
  useAppTicketTypes,
  useDeleteAppTicketType,
  useUpdateAppTicketType,
} from "../hooks/settingsHooks";
import { TicketType } from "@/shared/model/model";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { SettingsSection } from "./SettingsSection";
import TicketTypeModal from "./TicketTypeModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export default function AppTicketTypeManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<TicketType | null>(null);
  const [selectedType, setSelectedType] = useState<TicketType | null>(null);

  const { data: ticketTypes, isLoading } = useAppTicketTypes();
  const { handleDeleteAppTicketType, isDeleting } = useDeleteAppTicketType();
  const updateTicketType = useUpdateAppTicketType();
  const canManage = useHasPermission(PERMISSION.PLATFORM_SETTINGS_MANAGE);

  const handleEdit = (ticketType: TicketType) => {
    setEditingType(ticketType);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingType(null);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedType?.id) return;
    handleDeleteAppTicketType(selectedType.id, {
      onSuccess: () => setSelectedType(null),
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

  const handleClose = useCallback(() => setSelectedType(null), []);
  const hasTicketTypes = Boolean(ticketTypes?.length);

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Platform Ticket Types"
        description="Default ticket types available to every workspace"
        icon={Plus}
        actions={
          canManage ? (
            <Button type="button" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ticket Type
            </Button>
          ) : null
        }
      >
        {isLoading && (
          <div className="text-center py-4">Loading ticket types...</div>
        )}
        {!isLoading && !hasTicketTypes && (
          <div className="text-center py-4 text-muted-foreground">
            No platform ticket types yet
          </div>
        )}
        {!isLoading && hasTicketTypes && (
          <div className="space-y-3">
            {ticketTypes!.map((ticketType: TicketType) => (
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
                    <Badge variant="outline">Platform</Badge>
                  </div>
                  {ticketType.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {ticketType.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {canManage && (
                    <>
                      <Switch
                        checked={ticketType.isActive}
                        onCheckedChange={() => handleToggleStatus(ticketType)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="outline" size="sm">
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
                          <DropdownMenuItem
                            onClick={() => setSelectedType(ticketType)}
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
            ))}
          </div>
        )}
      </SettingsSection>

      <TicketTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingType={editingType}
        scope="app"
      />

      <DeleteConfirmationModal
        isOpen={!!selectedType?.id}
        onClose={handleClose}
        onConfirm={confirmDelete}
        title="Delete Platform Ticket Type"
        description="This ticket type will be removed for every workspace. This action cannot be undone."
        itemName={selectedType?.name || ""}
        isLoading={isDeleting}
      />
    </div>
  );
}
