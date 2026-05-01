import { TeamListSkeleton } from "@/features/team/components/TeamListSkeleton";

// Delegates this route segment to the shared team list skeleton.
export default function Loading() {
  return <TeamListSkeleton />;
}
