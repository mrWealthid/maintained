"use client";

import { useMemo } from "react";

import { useAppContext } from "@/shared/contexts/AppContext";
import type { PermissionKey } from "@/shared/auth/permission-registry";

export function usePermission(permission: PermissionKey) {
  const { user } = useAppContext();

  return useMemo(
    () => user.permissions.includes(permission),
    [permission, user.permissions]
  );
}

export function useHasPermission(permission: PermissionKey) {
  return usePermission(permission);
}

export function useAnyPermission(permissions: readonly PermissionKey[]) {
  const { user } = useAppContext();

  return useMemo(
    () => permissions.some((permission) => user.permissions.includes(permission)),
    [permissions, user.permissions]
  );
}

export function useAllPermissions(permissions: readonly PermissionKey[]) {
  const { user } = useAppContext();

  return useMemo(
    () => permissions.every((permission) => user.permissions.includes(permission)),
    [permissions, user.permissions]
  );
}
