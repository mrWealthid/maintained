"use client";

import Link from "next/link";
import { Building2, Mail, Phone, Users } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { APP_ROUTE_PATHS } from "@/shared/routes/appRoutePaths";
import type { WorkspaceListRowDTO } from "../models/workspace-list.model";
import WorkspaceRowActions from "./WorkspaceRowActions";

type Props = {
  data?: WorkspaceListRowDTO[];
  enableSelection?: boolean;
  getRowIdForRow?: (
    row: WorkspaceListRowDTO,
    index: number,
  ) => string | number;
  isRowSelected?: (id: string | number) => boolean;
  toggleRowSelection?: (id: string | number) => void;
};

export default function WorkspaceRow({
  data,
  enableSelection,
  getRowIdForRow,
  isRowSelected,
  toggleRowSelection,
}: Props) {
  if (!data?.length) return null;

  return (
    <>
      {data.map((workspace, index) => {
        const rowId = getRowIdForRow
          ? getRowIdForRow(workspace, index)
          : workspace.id;
        const checked = !!enableSelection && !!isRowSelected?.(rowId);
        const createdAt = workspace.createdAt
          ? new Date(workspace.createdAt)
          : null;

        return (
          <TableRow
            key={workspace.id}
            className="relative hover:bg-muted/40 transition-colors"
          >
            {enableSelection ? (
              <TableCell className="w-8 px-2">
                <Checkbox
                  aria-label="Select row"
                  checked={checked}
                  onCheckedChange={() => toggleRowSelection?.(rowId)}
                />
              </TableCell>
            ) : null}

            <TableCell className="font-medium whitespace-nowrap">
              {index + 1}.
            </TableCell>

            <TableCell colSpan={2} className="py-3 px-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </div>
                <div className="min-w-0">
                  <Link
                    href={`${APP_ROUTE_PATHS.DASHBOARD.WORKSPACES}/${workspace.id}`}
                    className="block truncate text-sm font-medium text-primary hover:underline underline-offset-4"
                  >
                    {workspace.name}
                  </Link>
                  <div className="text-xs text-muted-foreground truncate">
                    {workspace.registrationId || "—"}
                  </div>
                </div>
              </div>
            </TableCell>

            <TableCell colSpan={2} className="py-3 px-2">
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-1.5 text-card-foreground">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span className="truncate">{workspace.email || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="size-3.5" />
                  <span>{workspace.contact || "—"}</span>
                </div>
              </div>
            </TableCell>

            <TableCell className="py-3 px-2">
              <span className="text-sm font-medium">
                {workspace.propertyCount.toLocaleString()}
              </span>
            </TableCell>

            <TableCell className="py-3 px-2">
              <span className="text-sm font-medium">
                {workspace.unitCount.toLocaleString()}
              </span>
            </TableCell>

            <TableCell className="py-3 px-2">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Users className="size-3.5 text-muted-foreground" />
                {workspace.memberCount.toLocaleString()}
              </div>
            </TableCell>

            <TableCell className="py-3 px-2">
              <Badge
                variant="outline"
                className={
                  workspace.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
                }
              >
                {workspace.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>

            <TableCell className="py-3 px-2">
              <div className="text-sm">
                <p>
                  {createdAt ? createdAt.toLocaleDateString() : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {workspace.creator?.name ||
                    workspace.creator?.email ||
                    "Unknown"}
                </p>
              </div>
            </TableCell>

            <WorkspaceRowActions workspace={workspace} />
          </TableRow>
        );
      })}
    </>
  );
}
