"use client";
import React, { FC, useState } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TfiMore } from "react-icons/tfi";
import { Property } from "../service/property-service";
import { useDeleteProperty } from "../hooks/propertyHooks";
import Modal from "@/app/shared/components/modal/Modal";
import ConfirmationPage from "@/app/shared/components/ui/ConfirmationPage";
import PropertyForm from "../form/PropertyForm";
import PropertyView from "../components/PropertyView";
import { useCreateProperty } from "../hooks/propertyHooks";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PropertyActionsProps {
  property: Property;
}

const PropertyActions: FC<PropertyActionsProps> = ({ property }) => {
  const { isDeleting, handleDeleteProperty } = useDeleteProperty();
  const { isCreating, handleCreateProperty } = useCreateProperty(
    true,
    property._id
  );
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");

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

          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
          >
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Modal.Open opens="delete-property">
              <button type="button" className="w-full text-left">
                Delete
              </button>
            </Modal.Open>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal.Window
        name="delete-property"
        title="Delete Property"
        description="Property will be deleted permanently"
      >
        <ConfirmationPage
          handler={(onCloseModal) => {
            handleDelete(onCloseModal ?? (() => {}));
          }}
          isLoading={isDeleting}
          modalText={"Are you sure you want to delete this property?"}
        />
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
              <PropertyForm
                property={property}
                onSubmit={onSubmit}
                isLoading={isCreating}
              />
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
