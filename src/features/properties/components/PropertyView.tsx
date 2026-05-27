"use client";

import React, { FC } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Calendar,
  CalendarRange,
  CheckCircle2,
  DoorOpen,
  Hash,
  Home,
  ImageIcon,
  Info,
  MapPin,
  StickyNote,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import type { Property } from "../services/property-service";
import { fetchUnitList } from "@/features/units/services/unit-service";
import type { Unit } from "@/features/units/services/unit-service";

interface PropertyViewProps {
  property: Property;
}

function formatType(type?: string) {
  if (!type) return "—";
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAddress(a?: Property["address"]) {
  if (!a) return [];
  return [
    a.line1,
    a.line2,
    [a.city, a.state, a.postalCode].filter(Boolean).join(", "),
    a.country,
  ].filter((line) => line && line.toString().trim().length > 0);
}

const PropertyView: FC<PropertyViewProps> = ({ property }) => {
  const propertyId = (property as { _id?: string; id?: string })._id ?? (property as { id?: string }).id;

  const { data: unitListResponse, isLoading: isLoadingUnits } = useQuery({
    queryKey: ["units", "by-property", propertyId],
    queryFn: () =>
      fetchUnitList({
        page: 1,
        limit: 50,
        search: { property: propertyId } as never,
      }),
    enabled: Boolean(propertyId),
  });

  const units: Unit[] = (unitListResponse?.data as Unit[]) ?? [];
  const unitCount = unitListResponse?.totalRecords ?? property.units ?? units.length;

  const defaultUnitId =
    typeof property.defaultUnit === "object"
      ? property.defaultUnit?._id ?? property.defaultUnit?.id
      : property.defaultUnit;

  const addressLines = formatAddress(property.address);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                {property.name}
              </h2>
              <Badge variant="outline" className="capitalize">
                {formatType(property.type)}
              </Badge>
              <Badge variant={property.isActive ? "default" : "secondary"}>
                {property.isActive ? "Active" : "Inactive"}
              </Badge>
              {property.code ? (
                <Badge variant="outline" className="font-mono text-xs">
                  <Hash className="mr-1 h-3 w-3" /> {property.code}
                </Badge>
              ) : null}
            </div>
            {addressLines.length ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {addressLines.join(" · ")}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2 text-sm">
          <DoorOpen
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="leading-tight">
            <div className="text-xs text-muted-foreground">Total units</div>
            <div className="text-lg font-semibold">{unitCount}</div>
          </div>
        </div>
      </header>

      {property.photos?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-4 w-4" aria-hidden="true" />
              Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {property.photos.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"
                >
                  <Image
                    src={url}
                    alt="Property photo"
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4" aria-hidden="true" />
              Property information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Name" value={property.name} />
            <Field label="Type" value={formatType(property.type)} />
            {property.code ? <Field label="Code" value={property.code} /> : null}
            {property.yearBuilt ? (
              <Field label="Year built" value={String(property.yearBuilt)} />
            ) : null}
            <Field
              label="Status"
              value={
                <Badge variant={property.isActive ? "default" : "secondary"}>
                  {property.isActive ? "Active" : "Inactive"}
                </Badge>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {addressLines.length ? (
              <address className="not-italic text-sm leading-relaxed text-foreground">
                {addressLines.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </address>
            ) : (
              <p className="text-sm text-muted-foreground">
                No address recorded.
              </p>
            )}
            {property.address?.lat && property.address?.lng ? (
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                {property.address.lat.toFixed(4)},{" "}
                {property.address.lng.toFixed(4)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {property.amenities?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Amenities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <Badge
                  key={amenity}
                  variant="outline"
                  className="px-2.5 py-1 text-xs"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
                  {amenity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {property.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <StickyNote className="h-4 w-4" aria-hidden="true" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {property.notes}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Units sub-section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DoorOpen className="h-4 w-4" aria-hidden="true" />
            Units
            <Badge variant="outline" className="ml-1 font-mono text-xs">
              {unitCount}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUnits ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : units.length ? (
            <ul className="divide-y rounded-lg border">
              {units.map((unit) => {
                const unitId = (unit as { _id?: string; id?: string })._id ?? (unit as { id?: string }).id;
                const isDefault = defaultUnitId && String(defaultUnitId) === String(unitId);
                return (
                  <li
                    key={unitId}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                        aria-hidden="true"
                      >
                        <Home className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">
                            {unit.label}
                          </span>
                          {isDefault ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Default
                            </Badge>
                          ) : null}
                          {unit.floor ? (
                            <span className="text-xs text-muted-foreground">
                              · Floor {unit.floor}
                            </span>
                          ) : null}
                        </div>
                        {unit.tenantUser ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {unit.tenantUser.name} · {unit.tenantUser.email}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Vacant
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={unit.tenantActive ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {unit.tenantActive ? "Occupied" : "Vacant"}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/30 px-6 py-10 text-center">
              <DoorOpen
                className="mx-auto h-7 w-7 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-medium">No units yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add your first unit to start tracking tenants and tickets here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarRange className="h-4 w-4" aria-hidden="true" />
            Timestamps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Created"
              value={formatDateTime(property.createdAt)}
              icon={Calendar}
            />
            <Field
              label="Last updated"
              value={formatDateTime(property.updatedAt)}
              icon={Calendar}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        {label}
      </span>
      <span className="min-w-0 break-words text-right text-sm">{value}</span>
    </div>
  );
}

export default PropertyView;
