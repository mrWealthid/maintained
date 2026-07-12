"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorList from "@/components/ui/ErrorList";
import {
  TECHNICIAN_SPECIALTY_LABELS,
  TECHNICIAN_SPECIALTY_VALUES,
} from "@/features/technicians/models/technician-specialty.model";

type FormState = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  contact: string;
  businessName: string;
  specialties: string[];
};

const INITIAL: FormState = {
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  contact: "",
  businessName: "",
  specialties: [],
};

/**
 * Trade self-signup form. Renders chrome-less so the host page (the
 * unified `/auth/signup`) owns the surrounding Card. Posts to
 * `/api/trades/register`, then bounces the freshly-authed user to
 * `/trades`.
 *
 * Specialty enforcement: at least one must be selected. The Zod schema +
 * the Tradesperson model's `pre('validate')` hook are the canonical
 * gates; this just gives the user immediate feedback.
 */
export default function TradeSignupForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const router = useRouter();

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const toggleSpecialty = (s: string) =>
    setForm((state) => ({
      ...state,
      specialties: state.specialties.includes(s)
        ? state.specialties.filter((x) => x !== s)
        : [...state.specialties, s],
    }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.specialties.length === 0) {
      setError({
        message:
          "Pick at least one specialty so workspaces can match you to repair requests.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/trades/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          passwordConfirm: form.passwordConfirm,
          contact: form.contact || undefined,
          businessName: form.businessName,
          specialties: form.specialties,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body);
        return;
      }
      router.push("/trades");
      router.refresh();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <ErrorList title="Couldn't create your account" error={error as never} />
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="trade-name">Your name</Label>
          <Input
            id="trade-name"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="trade-businessName">Business / trading name</Label>
          <Input
            id="trade-businessName"
            required
            value={form.businessName}
            onChange={(e) => update("businessName", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="trade-email">Email</Label>
          <Input
            id="trade-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="trade-contact">Phone (optional)</Label>
          <Input
            id="trade-contact"
            type="tel"
            value={form.contact}
            onChange={(e) => update("contact", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="trade-password">Password</Label>
          <Input
            id="trade-password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="trade-passwordConfirm">Confirm password</Label>
          <Input
            id="trade-passwordConfirm"
            type="password"
            required
            minLength={8}
            value={form.passwordConfirm}
            onChange={(e) => update("passwordConfirm", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Specialties <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          Pick at least one. Workspaces broadcast repair requests by
          specialty — you only see jobs that match.
        </p>
        <div className="flex flex-wrap gap-2">
          {TECHNICIAN_SPECIALTY_VALUES.map((s) => {
            const active = form.specialties.includes(s);
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

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Creating…
          </>
        ) : (
          "Create my trade account"
        )}
      </Button>
    </form>
  );
}
