import { ProperlyLoader } from "@/shared/components/ProperlyLoader";

// Route loader for the app shell: the animated Properly mark.
// Page-specific skeletons (dashboard, chat, tickets) live in their
// own loading.tsx files and take over for those segments.
export default function Loading() {
  return <ProperlyLoader />;
}
