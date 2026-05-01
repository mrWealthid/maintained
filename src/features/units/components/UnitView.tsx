"use client";

import React, { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Home, Building2, Users, Calendar, MapPin } from "lucide-react";
import { Unit } from "../services/unit-service";

interface UnitViewProps {
  unit: Unit;
}

const UnitView: FC<UnitViewProps> = ({ unit }) => {
  const formatAddress = (address: any) => {
    if (!address) return "N/A";
    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postalCode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Home className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Unit Details</h2>
          <p className="text-muted-foreground">View unit information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unit Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Unit Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Label
              </label>
              <p className="text-sm font-medium">{unit.label}</p>
            </div>

            {unit.floor && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Floor
                </label>
                <p className="text-sm">{unit.floor}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="mt-1">
                <Badge variant={unit.tenantActive ? "default" : "secondary"}>
                  {unit.tenantActive ? "Occupied" : "Vacant"}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Active
              </label>
              <div className="mt-1">
                <Badge variant={unit.isActive ? "default" : "secondary"}>
                  {unit.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {unit.tags && unit.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {unit.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Property Name
              </label>
              <p className="text-sm font-medium">
                {unit.property?.name || "N/A"}
              </p>
            </div>

            {unit.property?.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Property Address
                </label>
                <p className="text-sm">
                  {formatAddress(unit.property.address)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tenant Information */}
      {unit.tenantUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Tenant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="text-sm font-medium">{unit.tenantUser.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="text-sm">{unit.tenantUser.email}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tenant History */}
      {unit.tenants && unit.tenants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tenant History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unit.tenants.map((tenant, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">Tenant #{index + 1}</p>
                    <p className="text-xs text-muted-foreground">
                      Started: {new Date(tenant.start).toLocaleDateString()}
                    </p>
                    {tenant.end && (
                      <p className="text-xs text-muted-foreground">
                        Ended: {new Date(tenant.end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge variant={tenant.end ? "secondary" : "default"}>
                    {tenant.end ? "Past" : "Current"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timestamps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created
              </label>
              <p className="text-sm">
                {new Date(unit.createdAt).toLocaleDateString()} at{" "}
                {new Date(unit.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <p className="text-sm">
                {new Date(unit.updatedAt).toLocaleDateString()} at{" "}
                {new Date(unit.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitView;
