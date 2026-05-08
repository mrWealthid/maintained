"use client";

import BulkSelectionActionBar from "@/shared/components/BulkSelectionActionBar";
import type { TenantListItem } from "../models/tenant-form.model";

type TenantBulkSelectionActionsProps = {
  selectedRows: TenantListItem[];
  isMessagePending: boolean;
  onMessageClick: (tenantIds: string[], recipientEmails: string[]) => void;
};

export function hasTenantBulkActions(selectedRows: TenantListItem[]) {
  return selectedRows.some((row) => Boolean(row.email));
}

export default function TenantBulkSelectionActions({
  selectedRows,
  isMessagePending,
  onMessageClick,
}: TenantBulkSelectionActionsProps) {
  const messageIds = selectedRows
    .filter((row) => row.email)
    .map((row) => row.id);
  const recipientEmails = Array.from(
    new Set(
      selectedRows
        .map((row) => row.email)
        .filter((email): email is string => Boolean(email)),
    ),
  );

  return (
    <BulkSelectionActionBar
      actions={[]}
      isActionPending={false}
      isMessagePending={isMessagePending}
      isSelectionActionPending={isMessagePending}
      isMessageDisabled={messageIds.length === 0}
      showMessageButton={messageIds.length > 0}
      onMessageClick={() => onMessageClick(messageIds, recipientEmails)}
    />
  );
}
