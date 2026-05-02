"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Send, X } from "lucide-react";

import { TableCell } from "@/components/ui/table";
import RowActionsMenu from "@/shared/components/table/RowActionsMenu";

import { TechnicianRowActionsProps } from "@/features/tickets/models/ticket.model";
import { TECHNICIAN_RESPONSE, TICKET_STATUS } from "@/shared/enums/enums";
import DeclineForm from "@/features/technician-requests/forms/DeclineForm";
import { APP_ROUTE_PATHS } from "@/shared/routes/appRoutePaths";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";
import type { BaseActions } from "@/shared/model/model";

const TicketRowActions = ({ technicianRequest }: TechnicianRowActionsProps) => {
  const router = useRouter();
  const canRespondToRequest = useHasPermission(
    PERMISSION.TECHNICIAN_REQUESTS_RESPOND,
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);

  const isPendingResponse =
    technicianRequest.ticket.status === TICKET_STATUS.pending_assignment &&
    technicianRequest.status === TECHNICIAN_RESPONSE.pending;
  const isApplied = technicianRequest.status === TECHNICIAN_RESPONSE.applied;

  const baseActions: BaseActions[] = [
    {
      label: "View details",
      action: () =>
        router.push(
          `${APP_ROUTE_PATHS.DASHBOARD.TICKETS}/${technicianRequest.ticket.id}`,
        ),
      icon: Eye,
    },
  ];

  if (isPendingResponse && canRespondToRequest) {
    baseActions.push({
      label: "Apply",
      action: () =>
        router.push(
          `${APP_ROUTE_PATHS.DASHBOARD.TICKETS}/apply/${technicianRequest.id}`,
        ),
      icon: Send,
    });
    baseActions.push({
      label: "Decline",
      action: () => {
        setMenuOpen(false);
        setDeclineOpen(true);
      },
      icon: X,
    });
  }

  if (isApplied && canRespondToRequest) {
    baseActions.push({
      label: "Update",
      action: () =>
        router.push(
          `${APP_ROUTE_PATHS.DASHBOARD.TICKETS}/apply/${technicianRequest.id}`,
        ),
      icon: Send,
    });
    baseActions.push({
      label: "Decline",
      action: () => {
        setMenuOpen(false);
        setDeclineOpen(true);
      },
      icon: X,
    });
  }

  return (
    <TableCell className="md:px-2 py-2 space-x-3">
      <RowActionsMenu
        ariaLabel={`Actions for ticket ${technicianRequest.ticket.id}`}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        baseActions={baseActions}
      />

      <DeclineForm
        ticketRequest={technicianRequest}
        open={declineOpen}
        onOpenChange={setDeclineOpen}
      />
    </TableCell>
  );
};

export default TicketRowActions;
