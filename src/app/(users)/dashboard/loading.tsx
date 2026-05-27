import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";

// Page loader for the dashboard segment (and its sub-pages without their own
// loader). Kept as a skeleton so content layout is previewed while data loads.
export default function Loading() {
  return <DashboardSkeleton />;
}
