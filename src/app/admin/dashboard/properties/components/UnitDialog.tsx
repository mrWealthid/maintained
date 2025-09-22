"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import EditUnitForm from "@/app/shared/property-feat/form/UnitForm";
import UnitView from "@/app/shared/property-feat/components/UnitView";
import { useAppContext } from "@/app/shared/contexts/AppContext";
import { useCreateUnit } from "@/app/shared/property-feat/hooks/unitHooks";
import { Unit } from "@/app/shared/property-feat/service/unit-service";
import UnitForm from "@/app/shared/onboarding-feat/components/UnitForm";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none rounded-none border-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {mode === "create"
              ? "Add Units"
              : mode === "edit"
                ? "Edit Unit"
                : "Unit Details"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Configure units for your properties"
              : mode === "edit"
                ? "Update unit information"
                : "View unit details and information"}
          </DialogDescription>
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
