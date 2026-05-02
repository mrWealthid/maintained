"use client";

import type { ComponentType } from "react";
import { Mail } from "lucide-react";

type BulkSelectionAction = {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  disabled?: boolean;
  onClick: () => void;
};

type BulkSelectionActionBarProps = {
  isActionPending: boolean;
  isMessagePending: boolean;
  isSelectionActionPending: boolean;
  isMessageDisabled?: boolean;
  showMessageButton?: boolean;
  actionPendingLabel?: string;
  onMessageClick: () => void;
  actions: BulkSelectionAction[];
};

export default function BulkSelectionActionBar({
  isActionPending,
  isMessagePending,
  isSelectionActionPending,
  isMessageDisabled = false,
  showMessageButton = true,
  actionPendingLabel = "Processing...",
  onMessageClick,
  actions,
}: BulkSelectionActionBarProps) {
  const pendingActionText = isActionPending ? actionPendingLabel : null;

  return (
    <>
      {showMessageButton ? (
        <button
          type="button"
          className="flex items-center gap-1 rounded-3xl border border-primary/20 px-3 py-1.5 text-xs"
          disabled={isSelectionActionPending || isMessageDisabled}
          onClick={onMessageClick}
        >
          {isMessagePending ? (
            "Sending..."
          ) : (
            <>
              <Mail className="h-3.5 w-3.5" />
              Send email
            </>
          )}
        </button>
      ) : null}

      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          className="btn-danger flex items-center gap-1 rounded-3xl border px-3 py-1.5 text-xs"
          disabled={isSelectionActionPending || action.disabled}
          onClick={action.onClick}
        >
          {pendingActionText ? (
            pendingActionText
          ) : (
            <>
              <action.icon className="h-3.5 w-3.5" />
              {action.label}
            </>
          )}
        </button>
      ))}
    </>
  );
}
