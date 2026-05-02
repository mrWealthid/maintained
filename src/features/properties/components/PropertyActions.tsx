"use client";

import { useState, type ComponentType } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import RowActionsMenu from "@/shared/components/table/RowActionsMenu";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
import ErrorList from "@/components/ui/ErrorList";

import { Property } from "../services/property-service";
import {
  useCreateProperty,
  useDeleteProperty,
} from "../hooks/propertyHooks";
import PropertyForm from "../forms/PropertyForm";
import PropertyView from "./PropertyView";
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

interface PropertyActionsProps {
  property: Property;
}

const PropertyActions = ({ property }: PropertyActionsProps) => {
  const { isDeleting, handleDeleteProperty, deletePropertyError } =
    useDeleteProperty();
  const { isCreating, handleCreateProperty, createPropertyError } =
    useCreateProperty(true, property._id);

  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");
  const [confirmKey, setConfirmKey] = useState<ConfirmKey | null>(null);

  const canEditProperty = useHasPermission(PERMISSION.PROPERTIES_EDIT);
  const canDeleteProperty = useHasPermission(PERMISSION.PROPERTIES_DELETE);

  const onSubmit = (
    data: any,
    actions?: { onSuccess: () => void; onError: () => void },
  ) => {
    handleCreateProperty(data, {
      onSuccess: () => {
        actions?.onSuccess();
        setSheetOpen(false);
      },
    });
  };

  const confirmConfig: Record<ConfirmKey, ConfirmConfigItem> = {
    delete: {
      title: "Delete Property",
      description:
        "This action cannot be undone. The property will be permanently removed.",
      confirmLabel: isDeleting ? "Deleting..." : "Delete",
      variant: "destructive",
      icon: Trash2,
      onConfirm: () => {
        handleDeleteProperty(property._id, {
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

  if (canEditProperty) {
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

  if (canDeleteProperty) {
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
        ariaLabel={`Actions for property ${property.name ?? property._id}`}
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
          {confirmKey === "delete" && deletePropertyError ? (
            <ErrorList error={deletePropertyError} />
          ) : null}
        </ActionConfirmDialog>
      ) : null}
    </>
  );
};

export default PropertyActions;
