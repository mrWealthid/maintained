"use client";
import * as React from "react";
import { useState, useMemo } from "react";
import {
  Plus,
  MailCheck,
  Building2,
  ListPlus,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Target,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppContext } from "../contexts/AppContext";
import UserForm from "@/app/admin/dashboard/users/UserForm";
import PropertyForm from "./components/PropertyForm";
import MultiplePropertyForm from "./components/MultiplePropertyForm";
import UnitForm from "./components/UnitForm";
import MultipleUserForm from "@/app/admin/dashboard/users/MultipleUserForm";
import { OnboardingChecklistContentProps } from "./model/model";

export function OnboardingChecklistContent({
  emailVerified,
  onCompleted,
  checklistData,
}: OnboardingChecklistContentProps) {
  const { user } = useAppContext();
  const currentBusinessId = user?.currentBusiness?.id;
  // Use passed data instead of calling hook to avoid duplicate requests
  const data = checklistData;

  // counters (fallback to prop for email)
  const counters = useMemo(
    () =>
      data ?? {
        emailVerified: !!emailVerified,
        propertiesCount: 0,
        unitsCount: 0,
        adminsCount: 0,
        techniciansCount: 0,
        tenantsCount: 0,
      },
    [data, emailVerified]
  );

  // derive steps from real data with sequential dependencies
  const steps = useMemo(() => {
    const emailCompleted = !!counters.emailVerified;
    const propertyCompleted = (counters.propertiesCount ?? 0) > 0;
    const unitsCompleted = (counters.unitsCount ?? 0) > 0;
    const teamCompleted = (counters.adminsCount ?? 0) > 0;

    return [
      {
        id: "verify-email",
        title: "Verify email",
        description:
          "Confirm your email to secure your account and enable notifications.",
        icon: <MailCheck className="h-5 w-5" />,
        completed: emailCompleted,
        enabled: true, // First step is always enabled
        estimatedTime: "1 min",
        cta: (
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
        enabled: emailCompleted, // Can only add property after email verification
        estimatedTime: "3 min",
        cta: (
          <div className="flex gap-2">
            <PropertyWizardDialog
              businessId={currentBusinessId!}
              onCreated={() => {
                // optional toast lives inside your dialog wrapper already
              }}
              trigger={
                <Button size="sm" variant="outline" disabled={!emailCompleted}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add property
                </Button>
              }
            />
            <MultiplePropertyQuickAddDialog
              businessId={currentBusinessId!}
              onCreated={() => {
                // optional toast lives inside your dialog wrapper already
              }}
              trigger={
                <Button size="sm" variant="outline" disabled={!emailCompleted}>
                  <Plus className="h-4 w-4 mr-1" />
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
        enabled: propertyCompleted, // Can only add units after adding property
        estimatedTime: "5 min",
        cta: (
          <UnitsQuickAddDialog
            businessId={currentBusinessId!}
            onAdded={() => {}}
            trigger={
              <Button size="sm" variant="outline" disabled={!propertyCompleted}>
                <Plus className="h-4 w-4 mr-1" />
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
        enabled: unitsCompleted, // Can only invite team after adding units
        estimatedTime: "2 min",
        cta: (
          <div className="flex gap-2">
            <InviteUserDialog
              businessId={currentBusinessId!}
              onInvited={() => {}}
              trigger={
                <Button size="sm" variant="outline" disabled={!unitsCompleted}>
                  <Plus className="h-4 w-4 mr-1" />
                  Invite
                </Button>
              }
            />
            <MultipleInviteUserDialog
              businessId={currentBusinessId!}
              onInvited={() => {}}
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
      // Commented out invite tenant flow - working with 4 steps
      // {
      //   id: "invite-tenants",
      //   title: "Invite tenants",
      //   description:
      //     "Invite tenants to specific units so they can file requests.",
      //   icon: <UserPlus className="h-5 w-5" />,
      //   completed: (counters.tenantsCount ?? 0) > 0,
      //   estimatedTime: "3 min",
      //   cta: (
      //     <InviteUserDialog
      //       businessId={currentBusinessId!}
      //       forceRole="USER"
      //       trigger={
      //         <Button size="sm">
      //           <Plus className="h-4 w-4 mr-1" />
      //           Invite tenant
      //         </Button>
      //       }
      //     />
      //   ),
      // },
    ] as const;
  }, [counters, currentBusinessId]);

  const totalTasks = steps.length;
  const completed = useMemo(
    () => steps.filter((s) => s.completed).length,
    [steps]
  );
  const progressPct = (completed / totalTasks) * 100;
  const nextStep = steps.find((s) => !s.completed);

  // Call onCompleted when all steps are done
  React.useEffect(() => {
    if (completed === totalTasks && onCompleted) {
      onCompleted();
    }
  }, [completed, totalTasks, onCompleted]);

  return (
    <div className="h-full w-full">
      {/* Header / summary bar (match provided UI) */}
      <div className="border-b bg-card/50 backdrop-blur-sm rounded-t-lg">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold">Getting Started</h1>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Onboarding
          </Badge>
        </div>
      </div>

      {/* Welcome / progress summary */}
      <Card className="mt-4 border-0 bg-card/50 backdrop-blur-sm ">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-balance mb-1">
                Welcome to your workspace
              </CardTitle>
              <CardDescription className="text-sm text-pretty">
                Complete these essential steps to start managing maintenance
                requests efficiently.
              </CardDescription>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {completed}/{totalTasks}
                </div>
                <div className="text-xs ">Completed</div>
              </div>
              <div className="w-32">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="">Progress</span>
                  <span className=" font-medium">
                    {Math.round(progressPct)}%
                  </span>
                </div>
                <Progress
                  value={progressPct}
                  className="h-3 block bg-green-700"
                />
              </div>
            </div>
          </div>

          {nextStep && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50">
              <Target className="h-4 w-4" />
              <span>Next: {nextStep.title}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Steps grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {steps.map((step, index) => (
          <Card
            key={step.id}
            className={`group transition-all duration-300 animate-slide-in-up flex flex-col ${
              step.completed
                ? "border-emerald-200/50 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-900/10"
                : step.enabled
                  ? "border-border hover:border-primary/30 hover:shadow-md"
                  : "border-muted bg-muted/20 opacity-60"
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      step.completed
                        ? "bg-emerald-600 text-white"
                        : step.enabled
                          ? "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-button-primary"
                          : "bg-muted/50 text-muted-foreground/50"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-base leading-tight">
                      {step.title}
                    </h3>
                    {step.completed ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-900/40 text-xs">
                        Completed
                      </Badge>
                    ) : !step.enabled ? (
                      <Badge variant="secondary" className="text-xs">
                        Locked
                      </Badge>
                    ) : null}
                  </div>

                  <p className="text-sm text-muted-foreground text-pretty leading-relaxed mb-2">
                    {step.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {step.estimatedTime}
                      </span>
                    </div>

                    {/* Keep your real CTAs (dialogs/links) */}
                    <div className="flex items-center gap-2">
                      {step.cta}
                      {!step.completed && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {completed === totalTasks && (
          <Card className="lg:col-span-2 border-emerald-200/50 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-900/10">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">You’re all set! 🎉</h3>
              <p className="text-sm text-muted-foreground mb-4">
                All onboarding steps are complete. Your maintenance workspace is
                ready.
              </p>
              <Button asChild className="gap-2">
                <a href="/admin/dashboard">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function PropertyWizardDialog({
  businessId,
  trigger,
  onCreated,
}: {
  businessId: string;
  trigger: React.ReactNode;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-screen h-screen max-w-none max-h-none rounded-none border-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add property</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <PropertyForm
            businessId={businessId} // user={undefined as any}
            successCallback={() => {
              setOpen(false); // close only on success
              onCreated?.(); // refresh checklist/counters
            }}
            onCloseModal={() => {
              setOpen(false);
            }} // still allow manual cancel to close
            errorCallback={(e) => {
              // optional: toast with your existing system
              // toast.error(getErrorMessage(e));
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MultiplePropertyQuickAddDialog({
  businessId,
  trigger,
  onCreated,
}: {
  businessId: string;
  trigger: React.ReactNode;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-screen h-screen max-w-none max-h-none rounded-none border-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add multiple properties</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <MultiplePropertyForm
            businessId={businessId}
            successCallback={() => {
              setOpen(false); // close only on success
              onCreated?.(); // refresh checklist/counters
            }}
            onCloseModal={() => {
              setOpen(false);
            }} // still allow manual cancel to close
            errorCallback={(e) => {
              // optional: toast with your existing system
              // toast.error(getErrorMessage(e));
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UnitsQuickAddDialog({
  businessId,
  trigger,
  onAdded,
}: {
  businessId: string;
  trigger: React.ReactNode;
  onAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="
      left-0 top-0 -translate-x-0 -translate-y-0
      w-screen h-[100dvh] max-w-none
      rounded-none p-0 overflow-hidden
    "
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add units</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <UnitForm
            businessId={businessId}
            successCallback={() => {
              setOpen(false); // close only on success
              onAdded?.(); // refresh checklist/counters
            }}
            // onCloseModal={() => {
            //   setOpen(false);
            // }} // still allow manual cancel to close
            errorCallback={(e) => {
              // optional: toast with your existing system
              // toast.error(getErrorMessage(e));
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InviteUserDialog({
  businessId,
  trigger,
  onInvited,
  forceRole,
}: {
  businessId: string;
  trigger: React.ReactNode;
  onInvited?: () => void;
  forceRole?: "USER" | "ADMIN" | "TECHNICIAN" | "OWNER";
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
        </DialogHeader>

        <UserForm
          successCallback={() => {
            setOpen(false); // close only on success
            onInvited?.(); // refresh checklist/counters
          }}
          onCloseModal={() => {
            setOpen(false);
          }} // still allow manual cancel to close
          errorCallback={(e) => {
            // optional: toast with your existing system
            // toast.error(getErrorMessage(e));
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function MultipleInviteUserDialog({
  businessId,
  trigger,
  onInvited,
}: {
  businessId: string;
  trigger: React.ReactNode;
  onInvited?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-screen h-screen max-w-none max-h-none rounded-none border-0 p-0">
        <DialogHeader>
          <DialogTitle>Invite multiple users</DialogTitle>
        </DialogHeader>
        <MultipleUserForm
          successCallback={() => {
            setOpen(false); // close only on success
            onInvited?.(); // refresh checklist/counters
          }}
          onCloseModal={() => {
            setOpen(false);
          }} // still allow manual cancel to close
          errorCallback={(e) => {
            // optional: toast with your existing system
            // toast.error(getErrorMessage(e));
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
