"use client";

import React from "react";

import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName: string;
  isLoading: boolean;
}

function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading,
}: DeleteConfirmationModalProps) {
  return (
    <ActionConfirmDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={title}
      description={`${description} "${itemName}" will be permanently deleted.`}
      confirmLabel={isLoading ? "Deleting..." : "Delete"}
      onConfirm={onConfirm}
      isLoading={isLoading}
      variant="destructive"
    />
  );
}

export default React.memo(DeleteConfirmationModal);
