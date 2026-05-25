"use client";

import { useState } from "react";
import {
  Clock3,
  MailPlus,
  UserCheck,
  UsersRound,
} from "lucide-react";

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
import { useTenantList } from "../hooks/use-tenants";
import type { TenantListItem } from "../models/tenant-form.model";
import { InviteTenantSheet } from "./InviteTenantSheet";
import { TenantDetailSheet } from "./TenantDetailSheet";
import TenantList from "../list/TenantList";

export default function TenantManagementPageClient() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantListItem | null>(
    null,
  );
  const tenantsQuery = useTenantList({ page: 1, limit: 1 });
  const summary = tenantsQuery.data?.summary;

  return (
    <div className="flex flex-col gap-6">
      <AppPageHeader
        title="Tenant Management"
        description="Manage residents, invites, and unit assignment without mixing them into staff records."
        actions={
          <InviteTenantSheet
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            trigger={
              <Button>
                <MailPlus className="mr-2 size-4" />
                Invite Tenant
              </Button>
            }
          />
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <div>
              <CardDescription>Total contacts</CardDescription>
              <CardTitle>{summary?.total ?? 0}</CardTitle>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UsersRound className="size-5" />
            </div>
          </CardHeader>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <div>
              <CardDescription>Active residents</CardDescription>
              <CardTitle>{summary?.active ?? 0}</CardTitle>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <UserCheck className="size-5" />
            </div>
          </CardHeader>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <div>
              <CardDescription>Pending invites</CardDescription>
              <CardTitle>{summary?.pending ?? 0}</CardTitle>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Clock3 className="size-5" />
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Residents</CardTitle>
          <CardDescription>
            Filter tenants by resident, property, unit, invite status, or send bulk messages from the list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorList error={tenantsQuery.error} title="Tenant load error" />
          <TenantList onView={setSelectedTenant} />
        </CardContent>
      </Card>

      <TenantDetailSheet
        tenant={selectedTenant}
        open={!!selectedTenant}
        onOpenChange={(open) => {
          if (!open) setSelectedTenant(null);
        }}
      />
    </div>
  );
}
