import React, { FC } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import UnitDialog from "./UnitDialog";
import { useState } from "react";
import { useAppContext } from "@/app/shared/contexts/AppContext";

const UnitHeaderActions: FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const { user } = useAppContext();

  const handleCreate = () => {
    setSelectedUnit(null);
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleCreate} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Unit
      </Button>

      <UnitDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        unit={selectedUnit}
        mode={dialogMode}
        onSuccess={() => {
          setIsDialogOpen(false);
          // Table will automatically refetch due to query invalidation
        }}
      />
    </div>
  );
};

export default UnitHeaderActions;
