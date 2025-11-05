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
import PropertyForm from "@/features/property-feat/form/PropertyForm";
import MultiplePropertyForm from "@/features/onboarding-feat/components/MultiplePropertyForm";
import PropertyView from "@/features/property-feat/components/PropertyView";
import { useAppContext } from "@/shared/contexts/AppContext";
import { useCreateProperty } from "@/features/property-feat/hooks/propertyHooks";
import { Property } from "@/features/property-feat/service/property-service";

interface PropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property;
  mode: "create" | "edit" | "view";
  onSuccess?: () => void;
}

const PropertyDialog: React.FC<PropertyDialogProps> = ({
  open,
  onOpenChange,
  property,
  mode,
  onSuccess,
}) => {
  const [isMultiple, setIsMultiple] = useState(false);
  const { user } = useAppContext();
  const businessId = user?.currentBusiness?.id;
  const { isCreating, handleCreateProperty } = useCreateProperty(
    mode === "edit",
    property?._id
  );

  if (!businessId) {
    return null;
  }

  const handleSubmit = (data: any) => {
    handleCreateProperty(data, {
      onSuccess: () => {
        onSuccess?.();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen max-w-none h-full max-h-screen rounded-none border-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {mode === "create"
              ? isMultiple
                ? "Add Multiple Properties"
                : "Add Property"
              : mode === "edit"
                ? "Edit Property"
                : "Property Details"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? isMultiple
                ? "Create multiple properties at once"
                : "Add a new property to your portfolio"
              : mode === "edit"
                ? "Update property information"
                : "View property details and information"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1  overflow-y-auto p-6 pt-4">
          <div className="space-y-6">
            {/* Toggle for single vs multiple */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
                <Button
                  variant={!isMultiple ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setIsMultiple(false)}
                >
                  Single Property
                </Button>
                <Button
                  variant={isMultiple ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setIsMultiple(true)}
                >
                  Multiple Properties
                </Button>
              </div>
            </div>

            {mode === "create" && !isMultiple && (
              <PropertyForm
                property={undefined}
                onSubmit={handleSubmit}
                isLoading={isCreating}
              />
            )}
          </div>

          {mode === "create" && isMultiple && (
            <MultiplePropertyForm
              businessId={businessId}
              successCallback={() => {
                onSuccess?.();
                onOpenChange(false);
              }}
              onCloseModal={() => onOpenChange(false)}
              errorCallback={(e) => {
                console.error("Error creating properties:", e);
              }}
            />
          )}

          {mode === "edit" && (
            <PropertyForm
              property={property}
              onSubmit={handleSubmit}
              isLoading={isCreating}
            />
          )}

          {mode === "view" && property && <PropertyView property={property} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDialog;
