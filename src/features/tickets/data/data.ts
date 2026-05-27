import { TECHNICIAN_RESPONSE, TICKET_STATUS } from "@/shared/enums/enums";

export const ticketListFilterData = [
  {
    label: "All",
    value: TICKET_STATUS.all,
  },
  {
    label: "Pending",
    value: TICKET_STATUS.pending,
  },
  {
    label: "Processing",
    value: TICKET_STATUS.processing,
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
    label: "All",
    value: TECHNICIAN_RESPONSE.all,
  },
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
