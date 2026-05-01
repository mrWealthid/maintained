export function getValueByAccessor<T>(row: T, accessor: keyof T | string) {
  return String(accessor)
    .split(".")
    .filter(Boolean)
    .reduce<unknown>((acc, key) => {
      if (!acc || typeof acc !== "object") return undefined;
      return (acc as Record<string, unknown>)[key];
    }, row as unknown);
}
