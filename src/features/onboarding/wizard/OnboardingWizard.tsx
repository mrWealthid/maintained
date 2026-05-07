"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCompleteOnboarding } from "@/features/onboarding/hooks/onboardingHooks";
import StepNav, {
  type WizardStep,
} from "@/features/onboarding/wizard/StepNav";
import PropertyStep from "@/features/onboarding/wizard/steps/PropertyStep";
import UnitsStep from "@/features/onboarding/wizard/steps/UnitsStep";
import TeamStep from "@/features/onboarding/wizard/steps/TeamStep";

type WorkspaceType = "BUSINESS" | "INDIVIDUAL";

type Property = {
  id: string;
  name: string;
  type: "HOUSE" | "BUILDING" | "STATION";
};

type StepId = "property" | "units" | "team" | "review";

export type ResumeState = {
  property: Property;
  unitsCount: number;
};

type Props = {
  workspaceName: string;
  workspaceType: WorkspaceType;
  ownerFirstName: string | null;
  resume?: ResumeState | null;
};

const ALL_STEPS: Record<StepId, WizardStep> = {
  property: {
    id: "property",
    label: "Property",
    description: "Add your first address",
  },
  units: {
    id: "units",
    label: "Units",
    description: "Label what's inside",
  },
  team: {
    id: "team",
    label: "Team",
    description: "Invite teammates",
  },
  review: {
    id: "review",
    label: "Finish",
    description: "Confirm and launch",
  },
};

export default function OnboardingWizard({
  workspaceName,
  workspaceType,
  ownerFirstName,
  resume,
}: Props) {
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(
    resume?.property ?? null,
  );
  const [unitsCreated, setUnitsCreated] = useState(resume?.unitsCount ?? 0);
  const [completed, setCompleted] = useState<Set<StepId>>(() => {
    if (!resume) return new Set();
    const initial = new Set<StepId>(["property"]);
    if (resume.unitsCount > 0) initial.add("units");
    return initial;
  });
  const [stepIndex, setStepIndex] = useState(() => {
    if (!resume) return 0;
    // Step 0 was property; if it's done, advance.
    if (resume.property.type === "HOUSE" || resume.unitsCount > 0) {
      // Property + units done → land on team step.
      // Step list: [property, (units?), team, review]; team is index 1 if HOUSE, else 2.
      return resume.property.type === "HOUSE" ? 1 : 2;
    }
    // Property exists but no units yet → land on units step.
    return 1;
  });
  const { mutateAsync: complete, isPending: isCompleting } =
    useCompleteOnboarding();

  const steps = useMemo<WizardStep[]>(() => {
    const list: StepId[] = ["property"];
    if (property?.type !== "HOUSE") list.push("units");
    list.push("team");
    list.push("review");
    return list.map((id) => ALL_STEPS[id]);
  }, [property?.type]);

  const currentStep = steps[stepIndex];

  const markCompleted = (id: StepId) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const handlePropertyCreated = (created: Property) => {
    setProperty(created);
    markCompleted("property");
    // If HOUSE we skip the units step; advance to next step which is now team.
    setStepIndex(1);
  };

  const handleUnitsCreated = (count: number) => {
    setUnitsCreated((prev) => prev + count);
    markCompleted("units");
    goNext();
  };

  const handleUnitsSkip = () => {
    markCompleted("units");
    goNext();
  };

  const handleTeamContinue = () => {
    markCompleted("team");
    goNext();
  };

  const handleFinish = async () => {
    try {
      await complete();
      toast.success("Workspace ready");
      router.push("/dashboard");
    } catch {
      // toast surfaced by mutation hook
    }
  };

  return (
    <main
      id="onboarding-main"
      className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-8"
    >
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">
          {ownerFirstName ? `Welcome, ${ownerFirstName}` : "Welcome"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Let&apos;s set up {workspaceName}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          A few quick steps to get tickets, tenants, and your team wired up. You can
          revisit any of this later in <span className="font-medium">Settings</span>.
        </p>
      </header>

      <StepNav
        steps={steps}
        currentIndex={stepIndex}
        completed={
          new Set(
            Array.from(completed).filter((id) =>
              steps.some((step) => step.id === id),
            ),
          )
        }
      />

      <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        {currentStep.id === "property" ? (
          <PropertyStep onCreated={handlePropertyCreated} />
        ) : null}

        {currentStep.id === "units" && property ? (
          <UnitsStep
            propertyId={property.id}
            propertyName={property.name}
            onCreated={handleUnitsCreated}
            onSkip={handleUnitsSkip}
          />
        ) : null}

        {currentStep.id === "team" ? (
          <TeamStep
            workspaceType={workspaceType}
            onContinue={handleTeamContinue}
          />
        ) : null}

        {currentStep.id === "review" ? (
          <ReviewStep
            workspaceName={workspaceName}
            property={property}
            unitsCreated={unitsCreated}
            onFinish={handleFinish}
            isFinishing={isCompleting}
          />
        ) : null}
      </div>

      <footer className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={stepIndex === 0 || isCompleting}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <p className="text-xs text-muted-foreground">
          Step {stepIndex + 1} of {steps.length}
        </p>
      </footer>
    </main>
  );
}

function ReviewStep({
  workspaceName,
  property,
  unitsCreated,
  onFinish,
  isFinishing,
}: {
  workspaceName: string;
  property: Property | null;
  unitsCreated: number;
  onFinish: () => void;
  isFinishing: boolean;
}) {
  return (
    <section aria-labelledby="review-heading" className="space-y-6">
      <header className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 id="review-heading" className="text-xl font-semibold">
            You're ready
          </h2>
          <p className="text-sm text-muted-foreground">
            Here's what we set up for {workspaceName}.
          </p>
        </div>
      </header>

      <ul className="space-y-2">
        <ReviewItem
          label="Property"
          value={property ? `${property.name} (${property.type.toLowerCase()})` : "Pending"}
          done={Boolean(property)}
        />
        <ReviewItem
          label="Units"
          value={
            property?.type === "HOUSE"
              ? "Default unit auto-created"
              : unitsCreated
                ? `${unitsCreated} added`
                : "Skipped — add later in Settings"
          }
          done
        />
        <ReviewItem
          label="Team"
          value="Manage in Team settings any time"
          done
        />
      </ul>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onFinish}
          disabled={!property || isFinishing}
          className="px-10"
        >
          {isFinishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finishing…
            </>
          ) : (
            "Go to dashboard"
          )}
        </Button>
      </div>
    </section>
  );
}

function ReviewItem({
  label,
  value,
  done,
}: {
  label: string;
  value: string;
  done: boolean;
}) {
  return (
    <li className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            done
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
          aria-hidden="true"
        >
          <Check className="h-4 w-4" />
        </span>
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{value}</div>
        </div>
      </div>
    </li>
  );
}
