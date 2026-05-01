"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditUnitForm from "@/features/units/forms/UnitForm";
import UnitView from "@/features/units/components/UnitView";
import { useAppContext } from "@/shared/contexts/AppContext";
import { useCreateUnit } from "@/features/units/hooks/unitHooks";
import { Unit } from "@/features/units/services/unit-service";
import UnitForm from "@/features/onboarding/components/UnitForm";

interface UnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: Unit;
  mode: "create" | "edit" | "view";
  onSuccess?: () => void;
}

const UnitDialog: React.FC<UnitDialogProps> = ({
  open,
  onOpenChange,
  unit,
  mode,
  onSuccess,
}) => {
  const { user } = useAppContext();
  const businessId = user?.currentBusiness?.id;
  const { isCreating, handleCreateUnit } = useCreateUnit(
    mode === "edit",
    unit?._id
  );

  if (!businessId) {
    return null;
  }

  const handleSubmit = (data: any) => {
    handleCreateUnit(data, {
      onSuccess: () => {
        onSuccess?.();
        onOpenChange(false);
      },
    });
  };

  let dialogTitle = "Unit Details";
  let dialogDescription = "View unit details and information";
  if (mode === "create") {
    dialogTitle = "Add Units";
    dialogDescription = "Configure units for your properties";
  } else if (mode === "edit") {
    dialogTitle = "Edit Unit";
    dialogDescription = "Update unit information";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen max-w-none h-full max-h-screen rounded-none border-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {mode === "create" && (
            <UnitForm
              businessId={businessId}
              successCallback={() => {
                onOpenChange(false);
              }}

              // unit={undefined}
              // onSubmit={handleSubmit}
              // isLoading={isCreating}
            />
          )}

          {mode === "edit" && (
            <EditUnitForm
              unit={unit}
              onSubmit={handleSubmit}
              isLoading={isCreating}
            />
          )}

          {mode === "view" && unit && <UnitView unit={unit} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnitDialog;
