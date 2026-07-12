"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorList from "@/components/ui/ErrorList";
import {
  TECHNICIAN_SPECIALTY_LABELS,
  TECHNICIAN_SPECIALTY_VALUES,
} from "@/features/technicians/models/technician-specialty.model";

type Initial = {
  businessName: string;
  contactPhone: string;
  description: string;
  specialties: string[];
  address: string;
  serviceAreaKm: number | null;
};

type Props = {
  initial: Initial;
};

/**
 * Profile editor for the calling trade. Sends only the fields that changed
 * via PATCH so the server can keep validation tight (any empty
 * `specialties` array is a 400 here AND in the model's pre-validate hook).
 */
export default function TradeProfileForm({ initial }: Props) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [contactPhone, setContactPhone] = useState(initial.contactPhone);
  const [description, setDescription] = useState(initial.description);
  const [specialties, setSpecialties] = useState<string[]>(initial.specialties);
  const [address, setAddress] = useState(initial.address);
  const [serviceAreaKm, setServiceAreaKm] = useState<string>(
    initial.serviceAreaKm == null ? "" : String(initial.serviceAreaKm),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const toggleSpecialty = (s: string) =>
    setSpecialties((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
    );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (specialties.length === 0) {
      setError({
        message:
          "Keep at least one specialty so workspaces can match you to repair requests.",
      });
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        businessName: businessName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        description: description.trim() || undefined,
        specialties,
        address: address.trim() || undefined,
      };
      const km = Number(serviceAreaKm);
      if (serviceAreaKm.trim() && Number.isFinite(km)) {
        body.serviceAreaKm = km;
      }

      const res = await fetch("/api/trades/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json);
        return;
      }
      setSavedAt(new Date());
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your trade profile</CardTitle>
        <CardDescription>
          Workspaces find you by these specialties. Keep them current so you
          only see jobs you can actually quote.
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-5">
          {error ? (
            <ErrorList title="Couldn't save profile" error={error as never} />
          ) : null}
          {savedAt ? (
            <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:text-emerald-300">
              Saved {savedAt.toLocaleTimeString()}.
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="businessName">Business / trading name</Label>
              <Input
                id="businessName"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Specialties <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              At least one. Workspaces broadcast repair requests by
              specialty — you only see jobs that match.
            </p>
            <div className="flex flex-wrap gap-2">
              {TECHNICIAN_SPECIALTY_VALUES.map((s) => {
                const active = specialties.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleSpecialty(s)}
                    className={
                      "rounded-full border px-3 py-1 text-xs transition-colors " +
                      (active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/40 hover:bg-muted")
                    }
                  >
                    {TECHNICIAN_SPECIALTY_LABELS[
                      s as keyof typeof TECHNICIAN_SPECIALTY_LABELS
                    ] ?? s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">Base address</Label>
              <Input
                id="address"
                placeholder="Street, city, country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional — used to estimate travel for future map-based
                routing.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area">Service area (km)</Label>
              <Input
                id="area"
                type="number"
                min={0}
                max={2000}
                step={1}
                value={serviceAreaKm}
                placeholder="e.g. 30"
                onChange={(e) => setServiceAreaKm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Short description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="What you do, certifications, anything a workspace should know."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>

        <CardContent className="flex justify-end border-t border-border pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save profile"
            )}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
