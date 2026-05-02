"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ROLES } from "@/shared/enums/enums";
import {
  formatWorkspaceRoleLabel,
  type WORKSPACE_ROLE,
} from "@/shared/auth/roles";
import {
  Building2,
  ChevronsUpDown,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  getWorkspaceTypeLabel,
  isSoloWorkspaceType,
  type WorkspaceType,
} from "@/shared/model/workspace.model";

type ProfileProps = {
  name: string;
  email?: string;
  role: ROLES;
  workspaceRole?: WORKSPACE_ROLE | null;
  businessName: string;
  workspaceType?: WorkspaceType | null;
  workspaceLabel?: string;
  imageUrl?: string;
  expanded?: boolean;
};

function formatRoleLabel(role: ROLES, workspaceRole?: WORKSPACE_ROLE | null) {
  if (role === ROLES.super_admin) return "Super Admin";
  return formatWorkspaceRoleLabel(workspaceRole ?? role);
}

function Profile({
  name,
  email,
  role,
  workspaceRole,
  businessName,
  workspaceType,
  workspaceLabel,
  imageUrl,
  expanded = true,
}: ProfileProps) {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";
  const avatarSrc = imageUrl?.trim() || "/images/default.jpg";
  const resolvedWorkspaceLabel =
    workspaceLabel ??
    (role === ROLES.super_admin
      ? "Platform"
      : getWorkspaceTypeLabel(workspaceType, { short: true }));
  let WorkspaceTypeIcon = Building2;

  if (role === ROLES.super_admin) {
    WorkspaceTypeIcon = ShieldCheck;
  } else if (isSoloWorkspaceType(workspaceType)) {
    WorkspaceTypeIcon = UserRound;
  }

  return (
    <div
      className={cn(
        "flex min-w-0 items-center",
        expanded ? "gap-3" : "w-full justify-center",
      )}
    >
      <Avatar className="size-10 border border-border/70 shadow-2xs">
        <AvatarImage src={avatarSrc} alt={name} />
        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className={cn("min-w-0 flex-1", !expanded && "hidden")}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-foreground capitalize">
              {name || initials}
            </p>
            {email ? (
              <p className="truncate text-[11px] leading-tight text-muted-foreground/85">
                {email}
              </p>
            ) : null}
          </div>
          <ChevronsUpDown className="mt-0.5 size-4 shrink-0 text-muted-foreground/70" />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className="gap-1 border-primary/25 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary"
          >
            <ShieldCheck className="size-3" />
            {formatRoleLabel(role, workspaceRole)}
          </Badge>
          <Badge
            variant="outline"
            className="gap-1 border-primary/25 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary"
          >
            <WorkspaceTypeIcon className="size-3" />
            {resolvedWorkspaceLabel}
          </Badge>
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Building2 className="size-3 shrink-0" />
            <span className="truncate">{businessName}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Profile);
