"use client";

import {
  Building2,
  CalendarClock,
  DoorOpen,
  Eye,
  Home,
  Mail,
  Ruler,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import RowActionsMenu from "@/shared/components/table/RowActionsMenu";
import type { BaseActions } from "@/shared/model/model";
import type { TenantListItem } from "../models/tenant-form.model";

type TenantRowProps = {
  data?: TenantListItem[];
  onView: (tenant: TenantListItem) => void;
  enableSelection?: boolean;
  getRowIdForRow?: (row: TenantListItem, index: number) => string | number;
  isRowSelected?: (id: string | number) => boolean;
  toggleRowSelection?: (id: string | number) => void;
};

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(value?: number | null, currency = "USD") {
  if (value == null) return "Rent not set";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function unitLayout(unit: TenantListItem["unit"]) {
  const parts = [
    unit?.bedrooms != null ? `${unit.bedrooms} bed` : null,
    unit?.bathrooms != null ? `${unit.bathrooms} bath` : null,
    unit?.sizeSqft != null ? `${unit.sizeSqft} sqft` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" / ") : "Layout not set";
}

function statusClassName(status: TenantListItem["status"]) {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300";
  }

  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300";
}

export default function TenantRow({
  data,
  onView,
  enableSelection,
  getRowIdForRow,
  isRowSelected,
  toggleRowSelection,
}: TenantRowProps) {
  if (!data?.length) return null;

  return (
    <>
      {data.map((tenant, index) => {
        const rowId = getRowIdForRow
          ? getRowIdForRow(tenant, index)
          : `${tenant.kind}-${tenant.id}`;
        const checked = !!enableSelection && !!isRowSelected?.(rowId);
        const rent = formatMoney(
          tenant.unit?.monthlyRent?.amount,
          tenant.unit?.monthlyRent?.currency ?? "USD",
        );
        const timelineDate =
          tenant.status === "active" ? tenant.joinedAt : tenant.invitedAt;
        const baseActions: BaseActions[] = [
          {
            label: "View details",
            action: () => onView(tenant),
            icon: Eye,
          },
        ];

        return (
          <TableRow
            key={`${tenant.kind}-${tenant.id}`}
            className="relative hover:bg-muted/40 transition-colors"
          >
            {enableSelection ? (
              <TableCell className="w-8 px-2">
                <Checkbox
                  aria-label="Select row"
                  checked={checked}
                  onCheckedChange={() => toggleRowSelection?.(rowId)}
                  className="m-0"
                />
              </TableCell>
            ) : null}

            <TableCell className="font-medium whitespace-nowrap">
              {index + 1}.
            </TableCell>

            <TableCell colSpan={3} className="py-3 px-2">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserRound className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-card-foreground">
                    {tenant.name}
                  </p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {tenant.kind === "tenant" ? "Resident" : "Pending invite"}
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell className="py-3 px-2">
              <div className="flex min-w-40 items-center gap-1.5 text-sm text-card-foreground">
                <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{tenant.email}</span>
              </div>
            </TableCell>

            <TableCell className="py-3 px-2">
              <div className="flex min-w-36 items-start gap-2">
                <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-card-foreground">
                    {tenant.property?.name ?? "No property"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {tenant.property?.type ?? "Property type not set"}
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell className="py-3 px-2">
              <div className="flex min-w-32 items-start gap-2">
                <DoorOpen className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-card-foreground">
                    {tenant.unit?.label ?? "No unit"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {tenant.unit?.floor ? `Floor ${tenant.unit.floor}` : "Floor not set"}
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell className="py-3 px-2">
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-1.5 text-card-foreground">
                  <Home className="size-3.5 text-muted-foreground" />
                  {rent}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Ruler className="size-3.5" />
                  {unitLayout(tenant.unit)}
                </p>
              </div>
            </TableCell>

            <TableCell className="py-3 px-2">
              <Badge variant="outline" className={statusClassName(tenant.status)}>
                {tenant.status === "active" ? "Active" : "Pending"}
              </Badge>
            </TableCell>

            <TableCell className="py-3 px-2">
              <div className="min-w-32 text-sm">
                <p className="flex items-center gap-1.5 text-card-foreground">
                  <CalendarClock className="size-3.5 text-muted-foreground" />
                  {formatDate(timelineDate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tenant.status === "active" ? "Joined" : "Invited"}
                </p>
              </div>
            </TableCell>

            <TableCell className="md:px-2 py-2 space-x-3">
              <RowActionsMenu
                ariaLabel={`Actions for tenant ${tenant.name}`}
                baseActions={baseActions}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
