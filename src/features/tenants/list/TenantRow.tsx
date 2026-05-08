"use client";

import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { TenantListItem } from "../models/tenant-form.model";

type TenantRowProps = {
  data?: TenantListItem[];
  onView: (tenant: TenantListItem) => void;
};

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TenantRow({ data, onView }: TenantRowProps) {
  if (!data?.length) return null;

  return (
    <>
      {data.map((tenant) => (
        <TableRow
          key={`${tenant.kind}-${tenant.id}`}
          className="hover:bg-muted/40"
        >
          <TableCell className="min-w-0">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{tenant.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {tenant.email}
              </p>
            </div>
          </TableCell>
          <TableCell>{tenant.property?.name ?? "No property"}</TableCell>
          <TableCell>{tenant.unit?.label ?? "No unit"}</TableCell>
          <TableCell>
            <div className="space-y-1">
              <Badge
                variant={tenant.status === "active" ? "default" : "secondary"}
              >
                {tenant.status === "active" ? "Active" : "Pending"}
              </Badge>
              <p className="text-[11px] text-muted-foreground">
                {tenant.status === "active"
                  ? formatDate(tenant.joinedAt)
                  : formatDate(tenant.invitedAt)}
              </p>
            </div>
          </TableCell>
          <TableCell className="text-right">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onView(tenant)}
            >
              <Eye className="mr-2 size-4" />
              View
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
