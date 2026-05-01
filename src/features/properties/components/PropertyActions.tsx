"use client";
import React, { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TfiMore } from "react-icons/tfi";
import { Property } from "../services/property-service";
import { useDeleteProperty } from "../hooks/propertyHooks";
import Modal from "@/shared/components/modal/Modal";
import ConfirmationPage from "@/shared/components/ui/ConfirmationPage";
import PropertyForm from "../forms/PropertyForm";
import PropertyView from "./PropertyView";
import { useCreateProperty } from "../hooks/propertyHooks";
import ErrorList from "@/components/ui/ErrorList";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";

interface PropertyActionsProps {
  property: Property;
}

const PropertyActions: FC<PropertyActionsProps> = ({ property }) => {
  const { isDeleting, handleDeleteProperty, deletePropertyError } =
    useDeleteProperty();
  const { isCreating, handleCreateProperty, createPropertyError } =
    useCreateProperty(
    true,
    property._id
  );
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");
  const canEditProperty = useHasPermission(PERMISSION.PROPERTIES_EDIT);
  const canDeleteProperty = useHasPermission(PERMISSION.PROPERTIES_DELETE);

  function handleDelete(onCloseModal: () => void) {
    handleDeleteProperty(property._id, {
      onSuccess: () => onCloseModal(),
    });
  }

  function handleEdit() {
    setViewMode("edit");
    setOpen(true);
  }

  function handleView() {
    setViewMode("view");
    setOpen(true);
  }

  const onSubmit = (
    data: any,
    actions?: { onSuccess: () => void; onError: () => void }
  ) => {
    handleCreateProperty(data, {
      onSuccess: () => {
        actions?.onSuccess();
        setOpen(false);
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"ghost"}
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <TfiMore />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="">
          <DropdownMenuItem onClick={handleView}>View Details</DropdownMenuItem>

          {canEditProperty && (
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              Edit
            </DropdownMenuItem>
          )}

          {canDeleteProperty && (
            <DropdownMenuItem>
              <Modal.Open opens="delete-property">
                <button type="button" className="w-full text-left">
                  Delete
                </button>
              </Modal.Open>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal.Window
        name="delete-property"
        title="Delete Property"
        description="Property will be deleted permanently"
      >
        <div className="space-y-3">
          <ConfirmationPage
            handler={(onCloseModal) => {
              handleDelete(onCloseModal ?? (() => {}));
            }}
            isLoading={isDeleting}
            modalText={"Are you sure you want to delete this property?"}
          />
          {deletePropertyError ? (
            <ErrorList error={deletePropertyError} />
          ) : null}
        </div>
      </Modal.Window>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="w-full overflow-y-auto h-full max-h-screen max-w-[100vw] md:max-w-full"
        >
          <div className="w-full flex flex-col gap-4 py-4 px-2 sm:w-2/3 sm:mx-auto sm:px-4">
            <SheetHeader>
              <SheetTitle>
                {viewMode === "edit" ? "Edit Property" : "Property Details"}
              </SheetTitle>
              <SheetDescription>
                {viewMode === "edit"
                  ? "Update property information"
                  : "View property details and information"}
              </SheetDescription>
            </SheetHeader>

            {viewMode === "edit" ? (
              <>
                {createPropertyError ? (
                  <ErrorList error={createPropertyError} />
                ) : null}
                <PropertyForm
                  property={property}
                  onSubmit={onSubmit}
                  isLoading={isCreating}
                />
              </>
            ) : (
              <PropertyView property={property} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default PropertyActions;
