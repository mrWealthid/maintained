import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";

// Delegates this route segment to the shared dashboard skeleton.
export default function Loading() {
  return <DashboardSkeleton />;
}
