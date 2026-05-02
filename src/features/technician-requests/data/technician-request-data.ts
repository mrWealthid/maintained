export const TECHNICIAN_REQUEST_KEYS = {
  all: ["technician-requests"] as const,
  list: (query: unknown) => ["technician-requests", "list", query] as const,
  byId: (id: string) => ["technician-requests", id] as const,
} as const;
