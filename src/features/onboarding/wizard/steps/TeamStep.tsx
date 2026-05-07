"use client";

import { useEffect, useMemo, useRef } from "react";
import { UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InviteTeamMemberDialog } from "@/features/team/components/InviteTeamMemberDialog";
import { useTeamOverview } from "@/features/team/hooks/use-team";

type Props = {
  workspaceType: "BUSINESS" | "INDIVIDUAL";
  onContinue: () => void;
};

export default function TeamStep({ workspaceType, onContinue }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const { data: overview, refetch } = useTeamOverview();
  const teammates = useMemo(
    () => (overview?.data ?? []).filter((member) => !member.isCurrentUser),
    [overview?.data],
  );

  const isSolo = workspaceType === "INDIVIDUAL";
  const headline = isSolo ? "Add teammates (optional)" : "Invite your team";
  const helper = isSolo
    ? "Solo workspace — invites are optional. Add an admin or technician to share the load."
    : "Invite at least one admin or technician so tickets can be assigned.";

  return (
    <section aria-labelledby="team-step-heading" className="space-y-6">
      <header className="space-y-1">
        <h2
          id="team-step-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-semibold focus:outline-none"
        >
          {headline}
        </h2>
        <p className="text-sm text-muted-foreground">{helper}</p>
      </header>

      {teammates.length ? (
        <ul className="space-y-2" aria-label="Invited teammates">
          {teammates.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <Users className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-medium">
                    {member.name || member.email || "Pending invite"}
                  </div>
                  {member.email && member.name ? (
                    <div className="text-xs text-muted-foreground">
                      {member.email}
                    </div>
                  ) : null}
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {member.status === "pending" ? "Invited" : member.role}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed bg-muted/30 px-6 py-10 text-center">
          <Users
            className="mx-auto h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium">No teammates yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Invitations are sent by email and expire in 24 hours.
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <InviteTeamMemberDialog
          trigger={
            <Button type="button" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite teammate
            </Button>
          }
          onInvited={() => void refetch()}
        />
        <Button type="button" onClick={onContinue} className="px-8">
          {teammates.length ? "Continue" : "Skip for now"}
        </Button>
      </div>
    </section>
  );
}
