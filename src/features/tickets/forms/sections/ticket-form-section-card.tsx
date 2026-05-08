"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function TicketFormSectionCard({
  step,
  icon,
  title,
  subtitle,
  children,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-lg shadow-none">
      <CardHeader className="px-6 pb-2 pt-5">
        <div className="mb-2 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {step}
              </span>
              <h2 className="text-base font-semibold">{title}</h2>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <Separator className="mx-6 w-auto" />
      <CardContent className="space-y-5 px-6 pb-6 pt-5">
        {children}
      </CardContent>
    </Card>
  );
}
