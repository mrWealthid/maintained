"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCreatePropertyUnit } from "@/features/onboarding/hooks/onboardingHooks";

type Props = {
  propertyId: string;
  propertyName: string;
  onCreated: (count: number) => void;
  onSkip: () => void;
};

export default function UnitsStep({
  propertyId,
  propertyName,
  onCreated,
  onSkip,
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const { createUnit, isCreating } = useCreatePropertyUnit(false);

  const addDraft = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (labels.some((label) => label.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`"${trimmed}" already added`);
      return;
    }
    setLabels((prev) => [...prev, trimmed]);
    setDraft("");
    inputRef.current?.focus();
  };

  const remove = (label: string) =>
    setLabels((prev) => prev.filter((l) => l !== label));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addDraft();
    } else if (e.key === "Backspace" && !draft && labels.length) {
      setLabels((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    if (!labels.length) return;
    createUnit(
      {
        properties: [
          { propertyId, unitIds: [], newUnitLabels: labels },
        ],
      },
      {
        onSuccess: () => onCreated(labels.length),
        onError: (err: Error) => toast.error(err.message),
      },
    );
  };

  return (
    <section aria-labelledby="units-step-heading" className="space-y-6">
      <header className="space-y-1">
        <h2
          id="units-step-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-semibold focus:outline-none"
        >
          Add units to {propertyName}
        </h2>
        <p className="text-sm text-muted-foreground">
          Label each unit (e.g. <code className="rounded bg-muted px-1">3B</code>,
          <code className="rounded bg-muted px-1 ml-1">Suite 200</code>). Press Enter or comma after each label.
        </p>
      </header>

      <div className="space-y-2">
        <Label htmlFor="unit-label-input">Unit labels</Label>
        <div
          className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2 focus-within:ring-2 focus-within:ring-ring"
          onClick={() => inputRef.current?.focus()}
        >
          {labels.map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className="gap-1 px-2 py-1 text-sm"
            >
              {label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(label);
                }}
                aria-label={`Remove unit ${label}`}
                className="rounded-full p-0.5 hover:bg-background"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            id="unit-label-input"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={labels.length ? "" : "Add a unit and press Enter"}
            className="h-9 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            aria-describedby="unit-input-hint"
          />
        </div>
        <p id="unit-input-hint" className="text-xs text-muted-foreground">
          {labels.length
            ? `${labels.length} unit${labels.length === 1 ? "" : "s"} ready to add`
            : "You can also paste a comma-separated list."}
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="ghost" onClick={onSkip} disabled={isCreating}>
          I'll add units later
        </Button>
        <div className="flex gap-2">
          {draft.trim() ? (
            <Button type="button" variant="secondary" onClick={addDraft} disabled={isCreating}>
              <Plus className="mr-2 h-4 w-4" />
              Queue label
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!labels.length || isCreating}
            className="px-8"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              `Save ${labels.length || ""} unit${labels.length === 1 ? "" : "s"}`.trim()
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
