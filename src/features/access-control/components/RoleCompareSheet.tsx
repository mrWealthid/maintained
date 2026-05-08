"use client";

import { useMemo, useState } from "react";
import { Check, GitCompare, Search, ShieldAlert, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetFooter,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import { formatWorkspaceRoleLabel } from "@/shared/auth/roles";
import type {
  TeamPermissionCatalogSection,
  TeamWorkspaceRoleDefinition,
} from "../models/access-control.model";

type RoleCompareSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: TeamWorkspaceRoleDefinition[];
  permissionCatalog: TeamPermissionCatalogSection[];
};

function riskClassName(riskLevel: string) {
  if (riskLevel === "high") {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300";
  }
  if (riskLevel === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300";
}

export default function RoleCompareSheet({
  open,
  onOpenChange,
  roles,
  permissionCatalog,
}: RoleCompareSheetProps) {
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [query, setQuery] = useState("");
  const rolePermissionSets = useMemo(
    () => new Map(roles.map((role) => [role.id, new Set(role.permissions)])),
    [roles],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const matrixColumns = `minmax(18rem,1.3fr) repeat(${roles.length}, minmax(10rem,1fr))`;

  const sections = useMemo(() => {
    return permissionCatalog
      .map((section) => {
        const permissions = section.permissions.filter((permission) => {
          const values = roles.map((role) =>
            rolePermissionSets.get(role.id)?.has(permission.key) ?? false,
          );
          const differs = new Set(values).size > 1;
          const matchesSearch =
            !normalizedQuery ||
            `${section.title} ${permission.label} ${permission.key} ${permission.description}`
              .toLowerCase()
              .includes(normalizedQuery);

          if (differencesOnly && !differs) return false;
          return matchesSearch;
        });

        return { ...section, permissions };
      })
      .filter((section) => section.permissions.length > 0);
  }, [
    differencesOnly,
    normalizedQuery,
    permissionCatalog,
    rolePermissionSets,
    roles,
  ]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent
        side="right"
        className="w-screen max-w-screen sm:max-w-[100vw]"
      >
        <AppSheetHeader
          title="Compare roles"
          description={`${roles.length} selected roles compared across workspace permissions.`}
          icon={GitCompare}
        />
        <AppSheetBody className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {roles.map((role) => (
              <div key={role.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{role.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatWorkspaceRoleLabel(role.legacyRole)}
                    </p>
                  </div>
                  <Badge variant={role.isSystem ? "outline" : "plain"}>
                    {role.isSystem ? "System" : "Custom"}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-muted-foreground">Permissions</p>
                    <p className="mt-1 font-semibold">{role.permissions.length}</p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-muted-foreground">Members</p>
                    <p className="mt-1 font-semibold">{role.memberCount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search permission or group"
                className="pl-9"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={differencesOnly}
                onCheckedChange={setDifferencesOnly}
              />
              Differences only
            </label>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <div className="min-w-max">
              <div
                className="grid border-b bg-muted/50 text-xs font-medium text-muted-foreground"
                style={{ gridTemplateColumns: matrixColumns }}
              >
                <div className="sticky left-0 z-10 bg-muted/50 px-4 py-3">
                  Permission
                </div>
                {roles.map((role) => (
                  <div key={role.id} className="border-l px-4 py-3">
                    <p className="truncate font-semibold text-foreground">
                      {role.name}
                    </p>
                    <p className="truncate">
                      {formatWorkspaceRoleLabel(role.legacyRole)}
                    </p>
                  </div>
                ))}
              </div>

              {sections.map((section) => (
                <div key={section.id}>
                  <div className="border-b bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {section.title}
                  </div>
                  {section.permissions.map((permission) => {
                    const values = roles.map((role) =>
                      rolePermissionSets.get(role.id)?.has(permission.key) ?? false,
                    );
                    const differs = new Set(values).size > 1;

                    return (
                      <div
                        key={permission.key}
                        className={`grid border-b last:border-b-0 ${differs ? "bg-amber-50/40 dark:bg-amber-950/10" : "bg-card"}`}
                        style={{ gridTemplateColumns: matrixColumns }}
                      >
                        <div className="sticky left-0 z-10 border-r bg-inherit px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium">
                                {permission.label}
                              </p>
                              <Badge
                                variant="outline"
                                className={riskClassName(permission.riskLevel)}
                              >
                                {permission.riskLevel}
                              </Badge>
                              {differs ? (
                                <Badge variant="outline">Differs</Badge>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              {permission.key}
                            </p>
                            {permission.dependsOn.length ? (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <ShieldAlert className="size-3" />
                                Depends on {permission.dependsOn.join(", ")}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        {roles.map((role, index) => {
                          const hasPermission = values[index];
                          return (
                            <div
                              key={`${role.id}-${permission.key}`}
                              className="flex items-center justify-center border-l px-4 py-3"
                            >
                              <div
                                className={`flex size-8 items-center justify-center rounded-full border ${
                                  hasPermission
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                                    : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/30"
                                }`}
                                title={hasPermission ? "Permission exists" : "Permission missing"}
                              >
                                {hasPermission ? (
                                  <Check className="size-4" />
                                ) : (
                                  <X className="size-4" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
              {sections.length === 0 ? (
                <div className="bg-card px-4 py-10 text-center text-sm text-muted-foreground">
                  No permissions match the current filters.
                </div>
              ) : null}
            </div>
          </div>
        </AppSheetBody>
        <AppSheetFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </AppSheetFooter>
      </AppSheetContent>
    </Sheet>
  );
}
