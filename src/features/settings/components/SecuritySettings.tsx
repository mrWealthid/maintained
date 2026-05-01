"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  Globe,
  LaptopMinimal,
  Loader2,
  LogOut,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  isValidIpAddress,
  normalizeIpAddress,
  normalizeIpAddressList,
  splitIpAddressInput,
} from "@/lib/security/ip-address";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { useAppContext } from "@/shared/contexts/AppContext";
import type { WorkspaceSecuritySettings } from "../models/settings.model";
import {
  useRevokeOtherSecuritySessions,
  useRevokeSecuritySession,
  useSecuritySessions,
  useSecuritySettings,
  useUpdateSecuritySettings,
} from "../hooks/settingsHooks";

const EMPTY_WHITELIST_MESSAGE =
  "Add at least one allowed IP address before enabling IP whitelisting.";

const defaultSecuritySettings: WorkspaceSecuritySettings = {
  require2fa: false,
  sessionTimeoutMinutes: 60,
  maxActiveSessions: "unlimited",
  ipWhitelist: {
    enabled: false,
    ips: [],
  },
  currentRequestIp: null,
};

function formatSessionDate(value: string) {
  return new Date(value).toLocaleString();
}

function getSessionDeviceLabel(userAgent?: string | null) {
  const normalized = (userAgent ?? "").toLowerCase();

  if (
    normalized.includes("iphone") ||
    normalized.includes("android") ||
    normalized.includes("mobile")
  ) {
    return {
      icon: Smartphone,
      label: "Mobile device",
    };
  }

  return {
    icon: LaptopMinimal,
    label: normalized ? "Desktop browser" : "Unknown device",
  };
}

const SecuritySettings: React.FC = () => {
  const { user } = useAppContext();
  const canManageSecurity = user.permissions.includes(
    PERMISSION.SETTINGS_SECURITY_MANAGE
  );
  const canViewSessions = user.permissions.includes(
    PERMISSION.SETTINGS_SESSIONS_VIEW
  );
  const canRevokeSessions = user.permissions.includes(
    PERMISSION.SETTINGS_SESSIONS_REVOKE
  );
  const { data, isLoading } = useSecuritySettings();
  const updateSecuritySettings = useUpdateSecuritySettings();
  const { data: sessions = [], isLoading: loadingSessions } =
    useSecuritySessions();
  const revokeSessionMutation = useRevokeSecuritySession();
  const revokeOtherSessionsMutation = useRevokeOtherSecuritySessions();
  const [settings, setSettings] = useState<WorkspaceSecuritySettings>(
    defaultSecuritySettings
  );
  const [ipDraft, setIpDraft] = useState("");
  const [ipDraftError, setIpDraftError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  const allowedIps = useMemo(
    () => normalizeIpAddressList(settings.ipWhitelist.ips),
    [settings.ipWhitelist.ips]
  );
  const currentRequestIp = normalizeIpAddress(settings.currentRequestIp ?? "");
  const currentIpAllowed =
    currentRequestIp.length > 0 && allowedIps.includes(currentRequestIp);
  const whitelistError =
    settings.ipWhitelist.enabled && allowedIps.length === 0
      ? EMPTY_WHITELIST_MESSAGE
      : null;
  const otherSessionCount = sessions.filter((session) => !session.current).length;

  function patchSettings(patch: Partial<WorkspaceSecuritySettings>) {
    setSettings((current) => ({
      ...current,
      ...patch,
      ipWhitelist: {
        ...current.ipWhitelist,
        ...(patch.ipWhitelist ?? {}),
      },
    }));
  }

  function applyAllowedIps(nextIps: string[]) {
    patchSettings({
      ipWhitelist: {
        ...settings.ipWhitelist,
        ips: normalizeIpAddressList(nextIps),
      },
    });
  }

  function handleAddIps(rawValue: string) {
    const entries = splitIpAddressInput(rawValue);

    if (entries.length === 0) {
      setIpDraftError("Enter at least one IP address to add.");
      return;
    }

    const invalidEntries = entries.filter((entry) => !isValidIpAddress(entry));
    if (invalidEntries.length > 0) {
      setIpDraftError(
        `These entries are not valid IP addresses: ${invalidEntries
          .slice(0, 3)
          .join(", ")}`
      );
      return;
    }

    applyAllowedIps([...allowedIps, ...entries]);
    setIpDraft("");
    setIpDraftError(null);
  }

  function handleAddCurrentIp() {
    if (!currentRequestIp) {
      setIpDraftError(
        "Your current public IP could not be determined from the request headers."
      );
      return;
    }

    applyAllowedIps([...allowedIps, currentRequestIp]);
    setIpDraftError(null);
  }

  function handleSave() {
    updateSecuritySettings.mutate({
      ...settings,
      ipWhitelist: {
        enabled: settings.ipWhitelist.enabled,
        ips: allowedIps,
      },
    });
  }

  let activeSessionsContent = (
    <p className="rounded-2xl border border-dashed border-border/70 bg-background/40 px-4 py-5 text-sm text-muted-foreground">
      No active sessions were found for this workspace.
    </p>
  );

  if (loadingSessions) {
    activeSessionsContent = (
      <p className="rounded-2xl border border-border/70 bg-background/60 px-4 py-5 text-sm text-muted-foreground">
        Loading active sessions...
      </p>
    );
  } else if (sessions.length) {
    activeSessionsContent = (
      <div className="space-y-3">
        {sessions.map((session) => {
          const device = getSessionDeviceLabel(session.userAgent);
          const DeviceIcon = device.icon;
          const isRevoking =
            revokeSessionMutation.isPending &&
            revokeSessionMutation.variables === session.sessionId;

          return (
            <div
              key={session.sessionId}
              className="rounded-2xl border border-border/70 bg-background/70 px-4 py-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <DeviceIcon className="size-4 text-primary" />
                    <p className="text-sm font-medium">{device.label}</p>
                    {session.current ? (
                      <Badge variant="outline">Current session</Badge>
                    ) : null}
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="truncate">
                      {session.userAgent || "User agent unavailable"}
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <Globe className="size-3.5" />
                      {session.ipAddress || "IP unavailable"}
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      Last active {formatSessionDate(session.lastSeenAt)}
                    </p>
                  </div>
                </div>

                {canRevokeSessions ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={session.current || isRevoking}
                    onClick={() =>
                      revokeSessionMutation.mutate(session.sessionId)
                    }
                  >
                    {isRevoking ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 size-4" />
                    )}
                    Revoke
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage authentication, active sessions, and workspace access
              restrictions.
            </CardDescription>
          </div>
          {canManageSecurity ? (
            <Button
              type="button"
              onClick={handleSave}
              disabled={
                updateSecuritySettings.isPending ||
                Boolean(whitelistError) ||
                isLoading
              }
            >
              {updateSecuritySettings.isPending ? "Saving..." : "Save Changes"}
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              Authentication
            </h4>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/35 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Two-Factor Authentication (2FA)
                </p>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for privileged workspace access.
                </p>
              </div>
              <Switch
                checked={settings.require2fa}
                disabled={!canManageSecurity}
                onCheckedChange={(value) =>
                  patchSettings({ require2fa: value })
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              Session Management
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Session Timeout (Minutes)
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={String(settings.sessionTimeoutMinutes)}
                  disabled={!canManageSecurity}
                  onChange={(event) =>
                    patchSettings({
                      sessionTimeoutMinutes: Number(event.target.value) || 5,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter a whole number between 5 and 1440 minutes.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Maximum Active Sessions
                </label>
                <Select
                  value={String(settings.maxActiveSessions)}
                  disabled={!canManageSecurity}
                  onValueChange={(value) =>
                    patchSettings({
                      maxActiveSessions:
                        value === "unlimited"
                          ? "unlimited"
                          : (Number(value) as 1 | 3 | 5),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Session</SelectItem>
                    <SelectItem value="3">3 Sessions</SelectItem>
                    <SelectItem value="5">5 Sessions</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {canViewSessions ? (
              <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/25 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-primary" />
                      <h5 className="text-sm font-medium">Active Sessions</h5>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Review and revoke devices signed in to this workspace.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{sessions.length} active</Badge>
                    {canRevokeSessions ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          otherSessionCount === 0 ||
                          revokeOtherSessionsMutation.isPending
                        }
                        onClick={() => revokeOtherSessionsMutation.mutate()}
                      >
                        {revokeOtherSessionsMutation.isPending ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <LogOut className="mr-2 size-4" />
                        )}
                        Revoke Other Sessions
                      </Button>
                    ) : null}
                  </div>
                </div>

                {activeSessionsContent}
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              Access Control
            </h4>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/35 p-4">
              <div>
                <p className="text-sm font-medium">IP Whitelisting</p>
                <p className="text-sm text-muted-foreground">
                  Restrict workspace access to specific public IP addresses.
                </p>
              </div>
              <Switch
                checked={settings.ipWhitelist.enabled}
                disabled={!canManageSecurity}
                onCheckedChange={(value) =>
                  patchSettings({
                    ipWhitelist: { ...settings.ipWhitelist, enabled: value },
                  })
                }
              />
            </div>

            <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/25 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="plain">{allowedIps.length} configured</Badge>
                {currentRequestIp ? (
                  <Badge variant="outline">Current IP: {currentRequestIp}</Badge>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 lg:flex-row">
                <Input
                  placeholder="Add IPs like 203.0.113.10, 198.51.100.4"
                  value={ipDraft}
                  disabled={!canManageSecurity || !settings.ipWhitelist.enabled}
                  onChange={(event) => {
                    setIpDraft(event.target.value);
                    setIpDraftError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddIps(ipDraft);
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      !canManageSecurity || !settings.ipWhitelist.enabled
                    }
                    onClick={() => handleAddIps(ipDraft)}
                  >
                    <Plus className="mr-2 size-4" />
                    Add IPs
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={
                      !canManageSecurity ||
                      !settings.ipWhitelist.enabled ||
                      !currentRequestIp ||
                      currentIpAllowed
                    }
                    onClick={handleAddCurrentIp}
                  >
                    <Globe className="mr-2 size-4" />
                    {currentIpAllowed ? "Current IP added" : "Add Current IP"}
                  </Button>
                </div>
              </div>

              {ipDraftError ? (
                <Alert variant="destructive">
                  <ShieldAlert className="size-4" />
                  <AlertTitle>IP entry issue</AlertTitle>
                  <AlertDescription>{ipDraftError}</AlertDescription>
                </Alert>
              ) : null}

              {whitelistError ? (
                <Alert variant="destructive">
                  <ShieldAlert className="size-4" />
                  <AlertTitle>Whitelist needs attention</AlertTitle>
                  <AlertDescription>{whitelistError}</AlertDescription>
                </Alert>
              ) : null}

              {allowedIps.length ? (
                <div className="flex flex-wrap gap-2">
                  {allowedIps.map((ip) => (
                    <Badge key={ip} variant="outline" className="gap-2">
                      {ip}
                      {canManageSecurity ? (
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            applyAllowedIps(
                              allowedIps.filter((entry) => entry !== ip)
                            )
                          }
                        >
                          ×
                        </button>
                      ) : null}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No IP addresses configured yet.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
