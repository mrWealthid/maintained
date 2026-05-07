"use client";

import React, { FC } from "react";
import {
  Bath,
  Bed,
  Building2,
  CalendarDays,
  CalendarRange,
  CircleDollarSign,
  Hash,
  Home,
  History,
  MapPin,
  Mail,
  Ruler,
  StickyNote,
  Tag,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Unit } from "../services/unit-service";

interface UnitViewProps {
  unit: Unit;
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAddress(a?: Unit["property"]["address"]) {
  if (!a) return [];
  const parts = [
    a.line1,
    a.line2,
    [a.city, a.state, a.postalCode].filter(Boolean).join(", "),
    a.country,
  ].filter((line) => line && line.toString().trim().length > 0);
  return parts;
}

function formatCurrency(amount?: number, currency = "USD") {
  if (amount === undefined || amount === null || Number.isNaN(amount))
    return null;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function relativeDays(from: Date, to: Date = new Date()) {
  const diffMs = to.getTime() - from.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"}`;
}

const UnitView: FC<UnitViewProps> = ({ unit }) => {
  const sortedTenants = [...(unit.tenants ?? [])].sort((a, b) => {
    const aDate = new Date(a.start).getTime();
    const bDate = new Date(b.start).getTime();
    return bDate - aDate;
  });

  // Compute occupancy headline
  const currentTenantEntry = sortedTenants.find((t) => !t.end);
  const occupancyHeadline = (() => {
    if (unit.tenantActive && currentTenantEntry) {
      return `Occupied for ${relativeDays(new Date(currentTenantEntry.start))}`;
    }
    if (unit.tenantActive) return "Occupied";
    const lastEnded = sortedTenants.find((t) => t.end)?.end;
    if (lastEnded) {
      return `Vacant for ${relativeDays(new Date(lastEnded))}`;
    }
    return "Vacant";
  })();

  const addressLines = formatAddress(unit.property?.address);
  const rent = formatCurrency(
    unit.monthlyRent?.amount,
    unit.monthlyRent?.currency,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Home className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                {unit.label}
              </h2>
              {unit.floor ? (
                <Badge variant="outline" className="text-xs">
                  Floor {unit.floor}
                </Badge>
              ) : null}
              <Badge variant={unit.isActive ? "default" : "secondary"}>
                {unit.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {unit.property ? (
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                {unit.property.name}
                {addressLines.length ? (
                  <span className="text-muted-foreground/80">
                    · {addressLines[0]}
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      {/* Occupancy strip */}
      <div
        className={`flex items-center justify-between gap-4 rounded-xl border px-5 py-4 ${
          unit.tenantActive
            ? "border-primary/30 bg-primary/5"
            : "border-amber-500/30 bg-amber-500/5"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              unit.tenantActive
                ? "bg-primary/10 text-primary"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
            aria-hidden="true"
          >
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{occupancyHeadline}</p>
            {unit.tenantUser ? (
              <p className="text-xs text-muted-foreground">
                {unit.tenantUser.name} · {unit.tenantUser.email}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                No active tenant
              </p>
            )}
          </div>
        </div>
        {rent ? (
          <div className="rounded-lg border bg-background px-3 py-2 text-right">
            <div className="text-xs text-muted-foreground">Monthly rent</div>
            <div className="flex items-center justify-end gap-1 text-sm font-semibold">
              <CircleDollarSign
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden="true"
              />
              {rent}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Unit details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Hash className="h-4 w-4" aria-hidden="true" />
              Unit details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Label" value={unit.label} />
            {unit.floor ? <Field label="Floor" value={unit.floor} /> : null}
            {unit.bedrooms !== undefined ? (
              <Field
                icon={Bed}
                label="Bedrooms"
                value={String(unit.bedrooms)}
              />
            ) : null}
            {unit.bathrooms !== undefined ? (
              <Field
                icon={Bath}
                label="Bathrooms"
                value={String(unit.bathrooms)}
              />
            ) : null}
            {unit.sizeSqft !== undefined ? (
              <Field
                icon={Ruler}
                label="Size"
                value={`${unit.sizeSqft.toLocaleString()} sqft`}
              />
            ) : null}
            {rent ? (
              <Field
                icon={CircleDollarSign}
                label="Monthly rent"
                value={rent}
              />
            ) : null}
          </CardContent>
        </Card>

        {/* Property card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Name" value={unit.property?.name ?? "—"} />
            {addressLines.length ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <MapPin
                    className="mr-1 inline h-3 w-3"
                    aria-hidden="true"
                  />
                  Address
                </p>
                <address className="mt-1 not-italic text-sm leading-relaxed text-foreground">
                  {addressLines.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </address>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Current tenant card (only if occupied) */}
      {unit.tenantUser ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" aria-hidden="true" />
              Current tenant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">{unit.tenantUser.name}</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" aria-hidden="true" />
                {unit.tenantUser.email}
              </p>
            </div>
            {currentTenantEntry ? (
              <p className="text-xs text-muted-foreground">
                Moved in {formatDate(currentTenantEntry.start)} ·{" "}
                {relativeDays(new Date(currentTenantEntry.start))} ago
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Tags */}
      {unit.tags?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4" aria-hidden="true" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {unit.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Notes */}
      {unit.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <StickyNote className="h-4 w-4" aria-hidden="true" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {unit.notes}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Tenant history — always rendered */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" aria-hidden="true" />
            Tenant history
            <Badge variant="outline" className="ml-1 font-mono text-xs">
              {sortedTenants.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTenants.length ? (
            <ol className="relative space-y-3 border-l border-border/60 pl-6">
              {sortedTenants.map((tenant, idx) => {
                const tenantUser =
                  typeof tenant.user === "object" ? tenant.user : null;
                const isCurrent = !tenant.end;
                return (
                  <li key={idx} className="relative">
                    <span
                      className={`absolute -left-[28px] mt-1.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background ${
                        isCurrent
                          ? "bg-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="rounded-lg border bg-card px-4 py-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-medium">
                          {tenantUser?.name ?? `Tenant #${idx + 1}`}
                        </p>
                        <Badge
                          variant={isCurrent ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {isCurrent ? "Current" : "Past"}
                        </Badge>
                      </div>
                      {tenantUser?.email ? (
                        <p className="text-xs text-muted-foreground">
                          {tenantUser.email}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(tenant.start)}
                        {" – "}
                        {tenant.end ? formatDate(tenant.end) : "present"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/30 px-6 py-10 text-center">
              <History
                className="mx-auto h-7 w-7 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-medium">No tenant history yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Past and present tenants will appear here once added.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarRange className="h-4 w-4" aria-hidden="true" />
            Timestamps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              icon={CalendarDays}
              label="Created"
              value={formatDateTime(unit.createdAt)}
            />
            <Field
              icon={CalendarDays}
              label="Last updated"
              value={formatDateTime(unit.updatedAt)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        {label}
      </span>
      <span className="min-w-0 break-words text-right text-sm">{value}</span>
    </div>
  );
}

export default UnitView;
