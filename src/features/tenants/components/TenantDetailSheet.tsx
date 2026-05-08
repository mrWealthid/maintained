"use client";

import { CalendarDays, Home, Mail, MapPin, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetFooter,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import type { TenantListItem } from "../models/tenant-form.model";

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function TenantDetailSheet({
  tenant,
  open,
  onOpenChange,
}: {
  tenant: TenantListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent side="right" className="sm:max-w-xl">
        <AppSheetHeader
          title={tenant?.name ?? "Tenant details"}
          description="Resident, invite, property, and unit details."
          icon={UserRound}
        />
        <AppSheetBody>
          {tenant ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">
                      {tenant.name}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {tenant.email}
                    </p>
                  </div>
                  <Badge
                    variant={tenant.status === "active" ? "default" : "secondary"}
                  >
                    {tenant.status === "active" ? "Active" : "Pending"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3">
                <DetailRow
                  icon={Mail}
                  label="Email"
                  value={tenant.email}
                />
                <DetailRow
                  icon={MapPin}
                  label="Property"
                  value={tenant.property?.name ?? "No property"}
                />
                <DetailRow
                  icon={Home}
                  label="Unit"
                  value={tenant.unit?.label ?? "No unit"}
                />
                <DetailRow
                  icon={CalendarDays}
                  label={tenant.status === "active" ? "Joined" : "Invited"}
                  value={
                    tenant.status === "active"
                      ? formatDate(tenant.joinedAt)
                      : formatDate(tenant.invitedAt)
                  }
                />
                {tenant.status === "pending" ? (
                  <DetailRow
                    icon={CalendarDays}
                    label="Invite expires"
                    value={formatDate(tenant.inviteExpiresAt)}
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </AppSheetBody>
        <AppSheetFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </AppSheetFooter>
      </AppSheetContent>
    </Sheet>
  );
}
