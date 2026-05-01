"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Clock3, Loader2, LogIn, ShieldAlert } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import {
  getLastClientSessionActivityAt,
  markClientSessionActivity,
  subscribeToClientSessionActivity,
} from "@/lib/auth/client-session-activity";
import { http } from "@/services/http";
import { API_ROUTES } from "@/shared/routes/apiRoutes";

const MIN_WARNING_LEAD_MS = 30 * 1000;
const DEFAULT_WARNING_LEAD_MS = 60 * 1000;
const EXPIRED_REDIRECT_DELAY_MS = 2 * 1000;

function getWarningLeadMs(timeoutMs: number) {
  return Math.min(
    DEFAULT_WARNING_LEAD_MS,
    Math.max(MIN_WARNING_LEAD_MS, Math.floor(timeoutMs / 5)),
  );
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getErrorStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response
  ) {
    return Number(error.response.status);
  }

  return null;
}

export function SessionKeepAliveDialog({
  sessionTimeoutMinutes,
}: {
  sessionTimeoutMinutes: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [effectiveSessionTimeoutMinutes, setEffectiveSessionTimeoutMinutes] =
    useState(sessionTimeoutMinutes);
  const [lastActivityAt, setLastActivityAt] = useState(() =>
    getLastClientSessionActivityAt(),
  );
  const [now, setNow] = useState(() => Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [expiredAt, setExpiredAt] = useState<number | null>(null);

  const syncActivity = useCallback((at = Date.now()) => {
    setLastActivityAt(at);
    setNow(at);
    setExpiredAt(null);
    setRefreshError(null);
  }, []);

  const redirectToSessionExpired = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const next = `${window.location.pathname}${window.location.search}`;
    window.location.assign(
      `/auth/session-expired?next=${encodeURIComponent(next)}`,
    );
  }, []);

  const sessionTimeoutMs = useMemo(
    () => Math.max(1, effectiveSessionTimeoutMinutes) * 60 * 1000,
    [effectiveSessionTimeoutMinutes],
  );
  const warningLeadMs = useMemo(
    () => getWarningLeadMs(sessionTimeoutMs),
    [sessionTimeoutMs],
  );
  const warningStartsAt = lastActivityAt + sessionTimeoutMs - warningLeadMs;
  const expiresAt = lastActivityAt + sessionTimeoutMs;
  const remainingMs = Math.max(0, expiresAt - now);
  const isExpired = expiredAt !== null || remainingMs === 0;
  const isWarningOpen = !isExpired && now >= warningStartsAt;
  const countdownLabel = formatCountdown(remainingMs);
  const searchKey = searchParams.toString();

  useEffect(() => {
    setEffectiveSessionTimeoutMinutes(sessionTimeoutMinutes);
  }, [sessionTimeoutMinutes]);

  useEffect(() => {
    syncActivity(getLastClientSessionActivityAt());

    return subscribeToClientSessionActivity((at) => {
      startTransition(() => {
        syncActivity(at);
      });
    });
  }, [syncActivity]);

  useEffect(() => {
    const at = Date.now();
    markClientSessionActivity(at);
    syncActivity(at);
  }, [pathname, searchKey, syncActivity]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (expiredAt !== null || remainingMs > 0) {
      return;
    }

    setExpiredAt(Date.now());
  }, [expiredAt, remainingMs]);

  useEffect(() => {
    if (expiredAt === null) {
      return;
    }

    const timer = window.setTimeout(() => {
      redirectToSessionExpired();
    }, EXPIRED_REDIRECT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [expiredAt, redirectToSessionExpired]);

  async function handleKeepAlive() {
    setIsRefreshing(true);
    setRefreshError(null);

    try {
      const response = await http.post(API_ROUTES.auth.sessionKeepAlive);
      const nextTimeoutMinutes = Number(
        response.data?.data?.sessionTimeoutMinutes ?? effectiveSessionTimeoutMinutes,
      );

      if (Number.isFinite(nextTimeoutMinutes) && nextTimeoutMinutes > 0) {
        setEffectiveSessionTimeoutMinutes(nextTimeoutMinutes);
      }

      const refreshedAt = Date.now();
      markClientSessionActivity(refreshedAt);
      syncActivity(refreshedAt);
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        setExpiredAt(Date.now());
        return;
      }

      setRefreshError(
        "We couldn't keep your session active. Try again or sign in again.",
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  if (!Number.isFinite(effectiveSessionTimeoutMinutes)) {
    return null;
  }

  return (
    <Dialog open={isWarningOpen || isExpired} onOpenChange={() => undefined}>
      <AppDialogContent
        className="sm:max-w-lg"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <AppDialogHeader
          icon={ShieldAlert}
          tone={isExpired ? "destructive" : "default"}
          title={isExpired ? "Session Expired" : "Keep Your Session Active"}
          description={
            isExpired
              ? "Your session has expired for security. We'll take you to sign in again."
              : "Your secure session is about to expire. Continue your session to keep working without interruption."
          }
        />

        <AppDialogBody>
          {isExpired ? (
            <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              <p className="font-medium">
                Your protected dashboard access timed out due to inactivity.
              </p>
              <p className="text-red-600/90 dark:text-red-200/80">
                Redirecting to sign in so you can start a fresh session.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 dark:border-blue-900/40 dark:bg-blue-950/30">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Time remaining before sign-out
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Select the button below to refresh your secure session.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 rounded-full border-blue-300 bg-white px-3 py-1 text-sm font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200"
                >
                  <Clock3 className="mr-1.5 size-3.5" />
                  {countdownLabel}
                </Badge>
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                If no action is taken, the app will clear the stale session and
                return you to sign in.
              </p>

              {refreshError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                  {refreshError}
                </div>
              ) : null}
            </div>
          )}
        </AppDialogBody>

        <AppDialogFooter>
          {isExpired ? (
            <Button onClick={redirectToSessionExpired}>
              <LogIn className="mr-2 size-4" />
              Sign In Again
            </Button>
          ) : (
            <Button onClick={handleKeepAlive} disabled={isRefreshing}>
              {isRefreshing ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Clock3 className="mr-2 size-4" />
              )}
              Keep Session Active
            </Button>
          )}
        </AppDialogFooter>
      </AppDialogContent>
    </Dialog>
  );
}
