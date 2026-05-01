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
import { Unit } from "../services/unit-service";
import { useDeleteUnit } from "../hooks/unitHooks";
import Modal from "@/shared/components/modal/Modal";
import ConfirmationPage from "@/shared/components/ui/ConfirmationPage";
import UnitForm from "../forms/UnitForm";
import UnitView from "./UnitView";
import { useCreateUnit } from "../hooks/unitHooks";
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

interface UnitActionsProps {
  unit: Unit;
}

const UnitActions: FC<UnitActionsProps> = ({ unit }) => {
  const { isDeleting, handleDeleteUnit, deleteUnitError } = useDeleteUnit();
  const { isCreating, handleCreateUnit, createUnitError } = useCreateUnit(
    true,
    unit._id
  );
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");
  const canEditUnit = useHasPermission(PERMISSION.UNITS_EDIT);
  const canDeleteUnit = useHasPermission(PERMISSION.UNITS_DELETE);

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

          {canEditUnit && (
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

          {canDeleteUnit && (
            <DropdownMenuItem>
              <Modal.Open opens="delete-unit">
                <button type="button" className="w-full text-left">
                  Delete
                </button>
              </Modal.Open>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal.Window
        name="delete-unit"
        title="Delete Unit"
        description="Unit will be deleted permanently"
      >
        <div className="space-y-3">
          <ConfirmationPage
            handler={(onCloseModal) => {
              handleDelete(onCloseModal ?? (() => {}));
            }}
            isLoading={isDeleting}
            modalText={"Are you sure you want to delete this unit?"}
          />
          {deleteUnitError ? <ErrorList error={deleteUnitError} /> : null}
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
                {viewMode === "edit" ? "Edit Unit" : "Unit Details"}
              </SheetTitle>
              <SheetDescription>
                {viewMode === "edit"
                  ? "Update unit information"
                  : "View unit details and information"}
              </SheetDescription>
            </SheetHeader>

            {viewMode === "edit" ? (
              <>
                {createUnitError ? <ErrorList error={createUnitError} /> : null}
                <UnitForm
                  unit={unit}
                  onSubmit={onSubmit}
                  isLoading={isCreating}
                />
              </>
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
