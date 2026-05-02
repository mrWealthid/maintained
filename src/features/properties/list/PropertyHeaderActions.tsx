"use client";

import React, { FC } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyDialog from "../components/PropertyDialog";
import { useState } from "react";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";

const PropertyHeaderActions: FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const canCreateProperty = useHasPermission(PERMISSION.PROPERTIES_CREATE);
  const handleCreate = () => {
    setSelectedProperty(null);
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  if (!canCreateProperty) return null;

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleCreate} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Property
      </Button>

      <PropertyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        property={selectedProperty}
        mode={dialogMode}
        onSuccess={() => {
          setIsDialogOpen(false);
          // Table will automatically refetch due to query invalidation
        }}
      />
    </div>
  );
};

export default PropertyHeaderActions;
