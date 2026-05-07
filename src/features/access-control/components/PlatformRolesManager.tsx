"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import ErrorList from "@/components/ui/ErrorList";
import { ShieldCheck } from "lucide-react";

import { usePlatformRoles } from "../hooks/use-access-control";
import AccessControlPageSkeleton from "./AccessControlPageSkeleton";

export default function PlatformRolesManager() {
  const rolesQuery = usePlatformRoles();
  const roles = rolesQuery.data?.roles ?? [];
  const permissionCatalog = rolesQuery.data?.permissionCatalog ?? [];
  const showSkeleton = !rolesQuery.data && rolesQuery.isLoading;

  if (showSkeleton) return <AccessControlPageSkeleton />;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <CardTitle>App-wide roles</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review the default platform access configuration for Super Admins.
          </p>
        </div>
        <Badge variant="secondary">Default configuration</Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <ErrorList error={rolesQuery.error} title="Platform role load error" />

        {roles.map((role) => {
          const selectedPermissions = new Set(role.permissions);
          return (
            <div
              key={role.id}
              className="space-y-5 rounded-md border border-border p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                    <ShieldCheck className="size-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{role.name}</h3>
                      {role.locked ? (
                        <Badge variant="outline">Locked</Badge>
                      ) : null}
                      {role.isDefault ? (
                        <Badge variant="secondary">Default</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {role.permissions.length} permissions
                </Badge>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {permissionCatalog.map((section) => (
                  <div key={section.id} className="rounded-md border p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-medium">
                          {section.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {section.permissions.length} permissions
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {section.permissions.map((permission) => (
                        <label
                          key={permission.key}
                          className="flex items-start gap-3 rounded-md border bg-muted/20 p-3"
                        >
                          <Checkbox
                            checked={selectedPermissions.has(permission.key)}
                            disabled
                            className="mt-0.5"
                          />
                          <span className="space-y-1">
                            <span className="block text-sm font-medium">
                              {permission.label}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {permission.description}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
