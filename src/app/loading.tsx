import { ProperlyLoader } from "@/shared/components/ProperlyLoader";

// Top-level route loader: the animated Properly mark, full viewport.
export default function Loading() {
  return <ProperlyLoader fullscreen />;
}
