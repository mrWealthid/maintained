"use client";

import { MailPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ErrorList from "@/components/ui/ErrorList";
import AppPageHeader from "@/shared/components/app-header/AppPageHeader";
import { WORKSPACE_ROLE } from "@/shared/auth/roles";
import { useTeamOverview } from "../hooks/use-team";
import { InviteTeamMemberDialog } from "./InviteTeamMemberDialog";
import TeamList from "./TeamList";

export default function TeamManagementPageClient() {
  const overviewQuery = useTeamOverview();
  const meta = overviewQuery.data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <AppPageHeader name="Team Management" />
          <p className="text-sm text-muted-foreground">
            Invite workspace members, assign roles, and manage team lifecycle.
          </p>
        </div>

        <InviteTeamMemberDialog
          defaultRole={meta?.defaultRoleForNewMembers ?? WORKSPACE_ROLE.member}
          trigger={
            <Button>
              <MailPlus className="mr-2 size-4" />
              Invite Team Member
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace members</CardTitle>
          <CardDescription>
            {meta?.businessName
              ? `${meta.businessName} team roster`
              : "Team roster"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ErrorList error={overviewQuery.error} title="Team load error" />
          <TeamList inviteAllowed={meta?.allowTeamInvitations ?? true} />
        </CardContent>
      </Card>
    </div>
  );
}
