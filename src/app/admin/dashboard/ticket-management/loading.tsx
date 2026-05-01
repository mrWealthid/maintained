import { TicketListSkeleton } from "@/features/tickets/components/TicketListSkeleton";

// Delegates this route segment to the shared ticket list skeleton.
export default function Loading() {
  return <TicketListSkeleton />;
}
