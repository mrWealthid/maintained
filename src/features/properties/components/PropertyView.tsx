"use client";

import React, { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin, Calendar, Hash, Users } from "lucide-react";
import { Property } from "../services/property-service";

interface PropertyViewProps {
  property: Property;
}

const PropertyView: FC<PropertyViewProps> = ({ property }) => {
  const formatPropertyType = (type: string) => {
    return type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

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
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Property Details</h2>
          <p className="text-muted-foreground">View property information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Name
              </label>
              <p className="text-sm font-medium">{property.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Type
              </label>
              <div className="mt-1">
                <Badge variant="outline" className="capitalize">
                  {formatPropertyType(property.type)}
                </Badge>
              </div>
            </div>

            {property.code && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Code
                </label>
                <p className="text-sm font-mono">{property.code}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Units
              </label>
              <p className="text-sm">{property.units || 0} units</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="mt-1">
                <Badge variant={property.isActive ? "default" : "secondary"}>
                  {property.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Full Address
              </label>
              <p className="text-sm">{formatAddress(property.address)}</p>
            </div>

            {property.address && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Street
                    </label>
                    <p className="text-sm">{property.address.line1 || "N/A"}</p>
                  </div>

                  {property.address.line2 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Line 2
                      </label>
                      <p className="text-sm">{property.address.line2}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        City
                      </label>
                      <p className="text-sm">
                        {property.address.city || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        State
                      </label>
                      <p className="text-sm">
                        {property.address.state || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        ZIP Code
                      </label>
                      <p className="text-sm">
                        {property.address.postalCode || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Country
                      </label>
                      <p className="text-sm">
                        {property.address.country || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

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
                {new Date(property.createdAt).toLocaleDateString()} at{" "}
                {new Date(property.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <p className="text-sm">
                {new Date(property.updatedAt).toLocaleDateString()} at{" "}
                {new Date(property.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyView;
