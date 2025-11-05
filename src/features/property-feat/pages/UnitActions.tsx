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
import { Unit } from "../service/unit-service";
import { useDeleteUnit } from "../hooks/unitHooks";
import Modal from "@/shared/components/modal/Modal";
import ConfirmationPage from "@/shared/components/ui/ConfirmationPage";
import UnitForm from "../form/UnitForm";
import UnitView from "../components/UnitView";
import { useCreateUnit } from "../hooks/unitHooks";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface UnitActionsProps {
  unit: Unit;
}

const UnitActions: FC<UnitActionsProps> = ({ unit }) => {
  const { isDeleting, handleDeleteUnit } = useDeleteUnit();
  const { isCreating, handleCreateUnit } = useCreateUnit(true, unit._id);
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");

  function handleDelete(onCloseModal: () => void) {
    handleDeleteUnit(unit._id, {
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
    handleCreateUnit(data, {
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
            <Modal.Open opens="delete-unit">
              <button type="button" className="w-full text-left">
                Delete
              </button>
            </Modal.Open>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal.Window
        name="delete-unit"
        title="Delete Unit"
        description="Unit will be deleted permanently"
      >
        <ConfirmationPage
          handler={(onCloseModal) => {
            handleDelete(onCloseModal ?? (() => {}));
          }}
          isLoading={isDeleting}
          modalText={"Are you sure you want to delete this unit?"}
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
                {viewMode === "edit" ? "Edit Unit" : "Unit Details"}
              </SheetTitle>
              <SheetDescription>
                {viewMode === "edit"
                  ? "Update unit information"
                  : "View unit details and information"}
              </SheetDescription>
            </SheetHeader>

            {viewMode === "edit" ? (
              <UnitForm
                unit={unit}
                onSubmit={onSubmit}
                isLoading={isCreating}
              />
            ) : (
              <UnitView unit={unit} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default UnitActions;
