"use client";

import { useState } from "react";
import { Home, MailPlus } from "lucide-react";

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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <AppPageHeader name="Tenant Management" />
          <p className="text-sm text-muted-foreground">
            Manage residents separately from staff, tied to their property and unit.
          </p>
        </div>
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
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total tenants</CardDescription>
            <CardTitle>{summary?.total ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active residents</CardDescription>
            <CardTitle>{summary?.active ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending invites</CardDescription>
            <CardTitle>{summary?.pending ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Residents</CardTitle>
          <CardDescription>
            Use table filters to view tenants by property or by unit.
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
