"use client";

import * as React from "react";
import { useMemo, useEffect, useState } from "react";
import {
  MailCheck,
  Building2,
  ListPlus,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock,
  Target,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/shared/contexts/AppContext";
import { ChecklistState } from "./model/model";

import { SuccessScreen } from "./components/SuccessScreen";
import { ManagePropertyDialog } from "./dialogs/ManageProperty";
import { ManagePropertiesDialog } from "./dialogs/ManageProperties";
import { ManageUnitDialog } from "./dialogs/ManageUnit";
import { ManageUserInviteDialog } from "./dialogs/ManageUserInvite";
import { ManageUsersInviteDialog } from "./dialogs/ManageUsersInvite";

/* ---------- Dialog wrappers (unchanged UI) ---------- */

/* ---------- Multistep ---------- */
export function OnboardingMultiStep({
  emailVerified,
  checklistData,
  onCloseModal,
}: {
  emailVerified: boolean;
  checklistData?: ChecklistState;
  onCloseModal?: () => void;
}) {
  const { user } = useAppContext();
  const currentBusinessId = user?.currentBusiness?.id ?? "";

  // Merge props + server counters (prop wins if true)
  const counters = useMemo(
    () => ({
      emailVerified: Boolean(emailVerified || checklistData?.emailVerified),
      propertiesCount: checklistData?.propertiesCount ?? 0,
      unitsCount: checklistData?.unitsCount ?? 0,
      adminsCount: checklistData?.adminsCount ?? 0,
      techniciansCount: checklistData?.techniciansCount ?? 0,
      tenantsCount: checklistData?.tenantsCount ?? 0,
    }),
    [checklistData, emailVerified]
  );

  // Optimistic flags so we auto-advance even if server counters haven't refreshed yet
  const [optimistic, setOptimistic] = useState({
    property: false,
    units: false,
    team: false,
  });

  // Compute completion (server || optimistic)
  const emailCompleted = counters.emailVerified;
  const propertyCompleted =
    (counters.propertiesCount ?? 0) > 0 || optimistic.property;
  const unitsCompleted = (counters.unitsCount ?? 0) > 0 || optimistic.units;

  // ✅ FIX: count admins + technicians
  const teamCount =
    (counters.adminsCount ?? 0) + (counters.techniciansCount ?? 0);
  const teamCompleted = teamCount > 1 || optimistic.team;

  const steps = useMemo(
    () => [
      {
        id: "verify-email",
        title: "Verify email",
        description:
          "Confirm your email to secure your account and enable notifications.",
        icon: <MailCheck className="h-5 w-5" />,
        completed: emailCompleted,
        enabled: true,
        estimatedTime: "1 min",
        action: (
          <Button
            asChild
            size="sm"
            variant={emailCompleted ? "secondary" : "default"}
            disabled={emailCompleted}
          >
            <a href="/verify-email">{emailCompleted ? "Verified" : "Open"}</a>
          </Button>
        ),
      },
      {
        id: "add-property",
        title: "Add a property",
        description:
          "Create your first property (apartment, office, warehouse).",
        icon: <Building2 className="h-5 w-5" />,
        completed: propertyCompleted,
        enabled: emailCompleted,
        estimatedTime: "3 min",
        action: (
          <div className="flex gap-2">
            <ManagePropertyDialog
              businessId={currentBusinessId}
              onCreated={() => setOptimistic((s) => ({ ...s, property: true }))}
              trigger={
                <Button size="sm" variant="outline" disabled={!emailCompleted}>
                  Add property
                </Button>
              }
            />
            <ManagePropertiesDialog
              businessId={currentBusinessId}
              onCreated={() => setOptimistic((s) => ({ ...s, property: true }))}
              trigger={
                <Button size="sm" variant="outline" disabled={!emailCompleted}>
                  Add multiple
                </Button>
              }
            />
          </div>
        ),
      },
      {
        id: "add-units",
        title: "Add units",
        description: "Add apartments/rooms/bays under a property.",
        icon: <ListPlus className="h-5 w-5" />,
        completed: unitsCompleted,
        enabled: propertyCompleted,
        estimatedTime: "5 min",
        action: (
          <ManageUnitDialog
            businessId={currentBusinessId}
            onAdded={() => setOptimistic((s) => ({ ...s, units: true }))}
            trigger={
              <Button size="sm" variant="outline" disabled={!propertyCompleted}>
                Add units
              </Button>
            }
          />
        ),
      },
      {
        id: "invite-team",
        title: "Invite team (admins/technicians)",
        description: "Invite teammates who help manage requests.",
        icon: <Users className="h-5 w-5" />,
        completed: teamCompleted,
        enabled: unitsCompleted,
        estimatedTime: "2 min",
        action: (
          <div className="flex gap-2">
            <ManageUserInviteDialog
              onInvited={() => setOptimistic((s) => ({ ...s, team: true }))}
              trigger={
                <Button size="sm" variant="outline" disabled={!unitsCompleted}>
                  <Plus className="h-4 w-4 mr-1" />
                  Invite
                </Button>
              }
            />
            <ManageUsersInviteDialog
              onInvited={() => setOptimistic((s) => ({ ...s, team: true }))}
              trigger={
                <Button size="sm" variant="outline" disabled={!unitsCompleted}>
                  <Plus className="h-4 w-4 mr-1" />
                  Invite Multiple
                </Button>
              }
            />
          </div>
        ),
      },
    ],
    [
      currentBusinessId,
      emailCompleted,
      propertyCompleted,
      unitsCompleted,
      teamCompleted,
    ]
  );

  const total = steps.length;
  const completedCount = steps.filter((s) => s.completed).length;
  const progressPct = Math.round((completedCount / total) * 100);

  const firstIncompleteIndex = steps.findIndex((s) => !s.completed);
  const [currentIndex, setCurrentIndex] = useState(
    firstIncompleteIndex === -1 ? total - 1 : firstIncompleteIndex
  );

  useEffect(() => {
    const nextIdx = steps.findIndex((s) => !s.completed);
    setCurrentIndex(nextIdx === -1 ? total - 1 : nextIdx);
  }, [steps, total]);

  const allDone = completedCount === total;
  const current = steps[Math.min(currentIndex, steps.length - 1)];

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      {/* Summary */}
      <Card className="border-0 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary ">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  Getting Started
                </CardTitle>
                <CardDescription className="text-sm">
                  Complete these essential steps to launch your maintenance
                  workspace.
                </CardDescription>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {completedCount}/{total}
                </div>
                <div className="text-xs">Completed</div>
              </div>
              <div className="w-40">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span className="font-medium">{progressPct}%</span>
                </div>
                <Progress
                  value={progressPct}
                  className="h-3 block bg-green-700"
                />
              </div>
            </div>
          </div>

          {!allDone && current && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50">
              <Target className="h-4 w-4" />
              <span>Next: {current.title}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stepper */}
      {!allDone && (
        <div className="mt-6 grid grid-cols-4 gap-2">
          {steps.map((s, i) => {
            let state = "todo";
            if (s.completed) {
              state = "done";
            } else if (i === currentIndex) {
              state = "active";
            }

            return (
              <div
                key={s.id}
                className={[
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
                  state === "done" &&
                    "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50",
                  state === "active" && "bg-primary/5 border-yellow-600",
                  state === "todo" && "bg-muted/30 border-muted",
                ].join(" ")}
              >
                <div
                  className={[
                    "h-5 w-5 grid place-items-center rounded-full border",
                    state === "done" &&
                      "bg-emerald-600 text-white border-emerald-600",
                    state === "active" && "bg-muted border-primary ",
                    state === "todo" &&
                      "text-muted-foreground border-muted-foreground/30",
                  ].join(" ")}
                >
                  {state === "done" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="truncate">{s.title}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Current step or Success */}
      <div className="mt-6">
        {allDone ? (
          <Card className="border-emerald-200/50 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-900/10">
            <CardContent className="p-6">
              <SuccessScreen onCloseModal={onCloseModal} />
            </CardContent>
          </Card>
        ) : (
          current && (() => {
            let iconClassName = "bg-muted/50";
            if (current.completed) {
              iconClassName = "bg-emerald-600 text-white";
            } else if (current.enabled) {
              iconClassName = "bg-muted";
            }

            return (
            <Card
              className={[
                "transition-all",
                current.enabled
                  ? "border-border"
                  : "opacity-60 border-muted bg-muted/20 pointer-events-none",
              ].join(" ")}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={[
                      "flex h-12 w-12 items-center justify-center rounded-lg",
                      iconClassName,
                    ].join(" ")}
                  >
                    {current.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">
                        {current.title}
                      </h3>
                      {current.completed && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-900/40 text-xs">
                          Completed
                        </Badge>
                      )}
                      {!current.completed && !current.enabled && (
                        <Badge variant="secondary" className="text-xs">
                          Locked
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {current.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {current.estimatedTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {current.action}
                        {!current.completed && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Manual Next (disabled until complete) */}
                    <div className="mt-4">
                      <Button
                        size="sm"
                        disabled={!current.completed}
                        onClick={() => {
                          const nextIdx = steps.findIndex((s) => !s.completed);
                          if (nextIdx !== -1) setCurrentIndex(nextIdx);
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })()
        )}
      </div>
    </div>
  );
}
