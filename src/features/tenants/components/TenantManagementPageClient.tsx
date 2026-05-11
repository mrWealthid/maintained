"use client";

import { useState } from "react";
import {
  Clock3,
  Home,
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
  const isEmpty = !tenantsQuery.isLoading && (summary?.total ?? 0) === 0;

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

          {isEmpty ? (
            <div className="mb-4 flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 text-center">
              <Home className="size-9 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No tenants yet</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Invite residents from here so each tenant is tied to the right property and unit.
              </p>
              <Button className="mt-4" onClick={() => setInviteOpen(true)}>
                <MailPlus className="mr-2 size-4" />
                Invite Tenant
              </Button>
            </div>
          ) : null}

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
