import { useSyncExternalStore } from "react";

export default function useHasMounted() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}
