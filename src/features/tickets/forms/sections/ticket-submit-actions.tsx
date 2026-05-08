"use client";

import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TicketSubmitActions({
  isEditing,
  isSubmitting,
  isValid,
  isDirty,
  onCancel,
}: {
  isEditing: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:-mx-1 sm:px-1 sm:pb-2">
      <div className="rounded-lg border bg-card/95 px-4 py-4 shadow-xs backdrop-blur-sm sm:rounded-lg sm:px-5">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl px-6"
              disabled={!isValid || isSubmitting || !isDirty}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus className="mr-2 size-4" />
                  {isEditing ? "Update" : "Create"} Ticket
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
