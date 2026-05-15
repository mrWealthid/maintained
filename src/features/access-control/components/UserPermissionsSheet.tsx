"use client";

import { useMemo, useState } from "react";
import { Check, Eye, Search, ShieldAlert, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetFooter,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import type { TeamPermissionCatalogSection } from "../models/access-control.model";

type UserPermissionsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  roleLabel: string;
  effectivePermissions: Set<string>;
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

export default function UserPermissionsSheet({
  open,
  onOpenChange,
  userName,
  roleLabel,
  effectivePermissions,
  permissionCatalog,
}: UserPermissionsSheetProps) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const totalPermissions = permissionCatalog.reduce(
    (sum, section) => sum + section.permissions.length,
    0,
  );
  const grantedCount = permissionCatalog.reduce(
    (sum, section) =>
      sum +
      section.permissions.filter((permission) =>
        effectivePermissions.has(permission.key),
      ).length,
    0,
  );
  const grantedPercentage =
    totalPermissions > 0
      ? ((grantedCount / totalPermissions) * 100).toFixed(0)
      : "0";

  const sections = useMemo(() => {
    return permissionCatalog
      .map((section) => {
        const permissions = section.permissions.filter((permission) => {
          if (!normalizedQuery) {
            return true;
          }

          return `${section.title} ${permission.label} ${permission.key} ${permission.description}`
            .toLowerCase()
            .includes(normalizedQuery);
        });

        return { ...section, permissions };
      })
      .filter((section) => section.permissions.length > 0);
  }, [normalizedQuery, permissionCatalog]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent
        side="right"
        className="w-screen max-w-screen sm:max-w-[100vw]"
      >
        <AppSheetHeader
          title="Access Details"
          description={`${grantedCount} of ${totalPermissions} workspace permissions assigned.`}
          icon={Eye}
        />

        <AppSheetBody className="space-y-5">
          <div className="rounded-lg border bg-card p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{userName}</p>
                <p className="text-sm font-semibold text-foreground">
                  {roleLabel}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Permissions Granted
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {grantedCount}/{totalPermissions}
                </p>
                <p className="text-xs text-muted-foreground">
                  {grantedPercentage}% of workspace
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant="plain">Active</Badge>
              </div>
            </div>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search permissions"
              className="pl-9"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <div className="min-w-max">
              {sections.map((section) => (
                <div key={section.id}>
                  <div className="border-b bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {section.title}
                  </div>
                  {section.permissions.map((permission) => {
                    const hasPermission = effectivePermissions.has(
                      permission.key,
                    );

                    return (
                      <div
                        key={permission.key}
                        className={
                          hasPermission
                            ? "border-b bg-emerald-50/40 last:border-b-0 dark:bg-emerald-950/10"
                            : "border-b bg-card last:border-b-0"
                        }
                      >
                        <div className="flex items-start justify-between gap-4 px-4 py-4">
                          <div className="min-w-0 flex-1">
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
                              {hasPermission ? (
                                <Badge
                                  variant="plain"
                                  className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                                >
                                  Granted
                                </Badge>
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                              {permission.key}
                            </p>
                            {permission.dependsOn.length ? (
                              <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                                <ShieldAlert className="size-3" />
                                Requires {permission.dependsOn.join(", ")}
                              </div>
                            ) : null}
                          </div>
                          <div
                            className={
                              hasPermission
                                ? "flex size-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                                : "flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/30"
                            }
                            title={
                              hasPermission
                                ? "Permission granted"
                                : "Permission not granted"
                            }
                          >
                            {hasPermission ? (
                              <Check className="size-4" />
                            ) : (
                              <X className="size-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              {sections.length === 0 ? (
                <div className="bg-card px-4 py-10 text-center text-sm text-muted-foreground">
                  No permissions match your search.
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
