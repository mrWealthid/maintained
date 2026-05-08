import { TECHNICIAN_RESPONSE, TICKET_STATUS } from "@/shared/enums/enums";

export const ticketListFilterData = [
  {
    label: "Pending",
    value: TICKET_STATUS.pending,
  },
  {
    label: "Assigned",
    value: TICKET_STATUS.assigned,
  },
  {
    label: "Completed",
    value: TICKET_STATUS.completed,
  },
];
export const technicianListFilter = [
  {
    label: "Pending",
    value: TECHNICIAN_RESPONSE.pending,
  },
  {
    label: "Applied",
    value: TECHNICIAN_RESPONSE.applied,
  },
  {
    label: "Selected",
    value: TECHNICIAN_RESPONSE.selected,
  },
];
