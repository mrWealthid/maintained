export const WORKSPACE_TYPE = {
  BUSINESS: "BUSINESS",
  INDIVIDUAL: "INDIVIDUAL",
} as const;

export const WORKSPACE_TYPE_VALUES = [
  WORKSPACE_TYPE.BUSINESS,
  WORKSPACE_TYPE.INDIVIDUAL,
] as const;

export type WorkspaceType = (typeof WORKSPACE_TYPE_VALUES)[number];

export const DEFAULT_WORKSPACE_TYPE = WORKSPACE_TYPE.BUSINESS;

export function isWorkspaceType(value: unknown): value is WorkspaceType {
  return WORKSPACE_TYPE_VALUES.includes(value as WorkspaceType);
}

export function resolveWorkspaceType(value: unknown): WorkspaceType {
  return isWorkspaceType(value) ? value : DEFAULT_WORKSPACE_TYPE;
}

export function isSoloWorkspaceType(value: unknown): boolean {
  return resolveWorkspaceType(value) === WORKSPACE_TYPE.INDIVIDUAL;
}

export function isBusinessWorkspaceType(value: unknown): boolean {
  return resolveWorkspaceType(value) === WORKSPACE_TYPE.BUSINESS;
}

export function getWorkspaceTypeLabel(
  value: unknown,
  options?: { short?: boolean },
): string {
  const workspaceType = resolveWorkspaceType(value);

  if (workspaceType === WORKSPACE_TYPE.INDIVIDUAL) {
    return options?.short ? "Solo Owner" : "Solo Owner Workspace";
  }

  return options?.short ? "Business" : "Business Workspace";
}
