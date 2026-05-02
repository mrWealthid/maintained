"use client";

import { useState, type ComponentType } from "react";
import { DoorOpen, Eye, Edit, Trash2 } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import RowActionsMenu from "@/shared/components/table/RowActionsMenu";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
import ErrorList from "@/components/ui/ErrorList";

import { Unit } from "../services/unit-service";
import { useCreateUnit, useDeleteUnit } from "../hooks/unitHooks";
import UnitForm from "../forms/UnitForm";
import UnitView from "./UnitView";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";
import type { BaseActions, ConfirmActions } from "@/shared/model/model";

type ConfirmKey = "delete";

type ConfirmConfigItem = {
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "destructive";
  icon?: ComponentType<{ className?: string }>;
  onConfirm: () => Promise<void> | void;
};

interface UnitActionsProps {
  unit: Unit;
}

const UnitActions = ({ unit }: UnitActionsProps) => {
  const { isDeleting, handleDeleteUnit, deleteUnitError } = useDeleteUnit();
  const { isCreating, handleCreateUnit, createUnitError } = useCreateUnit(
    true,
    unit._id,
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");
  const [confirmKey, setConfirmKey] = useState<ConfirmKey | null>(null);

  const canEditUnit = useHasPermission(PERMISSION.UNITS_EDIT);
  const canDeleteUnit = useHasPermission(PERMISSION.UNITS_DELETE);

  const onSubmit = (
    data: any,
    actions?: { onSuccess: () => void; onError: () => void },
  ) => {
    handleCreateUnit(data, {
      onSuccess: () => {
        actions?.onSuccess();
        setSheetOpen(false);
      },
    });
  };

  const confirmConfig: Record<ConfirmKey, ConfirmConfigItem> = {
    delete: {
      title: "Delete Unit",
      description:
        "This action cannot be undone. The unit will be permanently removed.",
      confirmLabel: isDeleting ? "Deleting..." : "Delete",
      variant: "destructive",
      icon: Trash2,
      onConfirm: () => {
        handleDeleteUnit(unit._id, {
          onSuccess: () => setConfirmKey(null),
        });
      },
    },
  };

  const activeConfirm = confirmKey ? confirmConfig[confirmKey] : null;

  const baseActions: BaseActions[] = [
    {
      label: "View details",
      action: () => {
        setMenuOpen(false);
        setViewMode("view");
        setSheetOpen(true);
      },
      icon: Eye,
    },
  ];

  if (canEditUnit) {
    baseActions.push({
      label: "Edit",
      action: () => {
        setMenuOpen(false);
        setViewMode("edit");
        setSheetOpen(true);
      },
      icon: Edit,
    });
  }

  const confirmableActions: Array<
    Omit<ConfirmActions, "key"> & { key: ConfirmKey }
  > = [];

  if (canDeleteUnit) {
    confirmableActions.push({
      label: "Delete",
      key: "delete",
      icon: Trash2,
      variant: "destructive",
    });
  }

  return (
    <>
      <RowActionsMenu
        ariaLabel={`Actions for unit ${unit._id}`}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        baseActions={baseActions}
        confirmActions={confirmableActions}
        onConfirmAction={(key) => {
          setMenuOpen(false);
          setConfirmKey(key);
        }}
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <AppSheetContent
          side="bottom"
          className="h-full max-h-screen max-w-[100vw] md:max-w-full"
        >
          <AppSheetHeader
            title={viewMode === "edit" ? "Edit Unit" : "Unit Details"}
            description={
              viewMode === "edit"
                ? "Update unit information from a focused workspace."
                : "View unit details and related information."
            }
            icon={DoorOpen}
          />

          <AppSheetBody className="mx-auto w-full max-w-4xl">
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
          </AppSheetBody>
        </AppSheetContent>
      </Sheet>

      {activeConfirm ? (
        <ActionConfirmDialog
          open={!!activeConfirm}
          onOpenChange={(o) => !o && setConfirmKey(null)}
          title={activeConfirm.title}
          description={activeConfirm.description}
          confirmLabel={activeConfirm.confirmLabel}
          variant={activeConfirm.variant}
          icon={activeConfirm.icon}
          isLoading={isDeleting}
          onConfirm={async () => {
            await activeConfirm.onConfirm();
          }}
        >
          {confirmKey === "delete" && deleteUnitError ? (
            <ErrorList error={deleteUnitError} />
          ) : null}
        </ActionConfirmDialog>
      ) : null}
    </>
  );
};

export default UnitActions;
