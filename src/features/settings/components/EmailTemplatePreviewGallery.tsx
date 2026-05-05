"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Eye, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import {
  renderFormattedPreview,
  replaceMergeVars,
  type PreviewMergeVars,
} from "../helpers/helper";
import { SettingsIconBadge } from "./SettingsIconBadge";

export type EmailTemplatePreviewGalleryTemplateMeta = {
  key: string;
  name: string;
  description: string;
  icon: LucideIcon;
};

export type EmailTemplatePreviewGalleryItem<
  TTemplate extends EmailTemplatePreviewGalleryTemplateMeta,
> = {
  template: TTemplate;
  enabled: boolean;
  subject: string;
  preheader: string;
  body: string;
  includeUnsubscribe: boolean;
  previewVariables: PreviewMergeVars;
};

export type EmailTemplatePreviewGalleryGroup<
  TTemplate extends EmailTemplatePreviewGalleryTemplateMeta,
> = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  templates: Array<EmailTemplatePreviewGalleryItem<TTemplate>>;
};

type EmailTemplatePreviewGalleryProps<
  TTemplate extends EmailTemplatePreviewGalleryTemplateMeta,
> = {
  title: string;
  description: string;
  groups: Array<EmailTemplatePreviewGalleryGroup<TTemplate>>;
  senderName: string;
  senderEmail: string;
  footerText?: string;
  footerNote?: string;
  onBack: () => void;
  onEditTemplate: (template: TTemplate) => void;
};

function getPreviewRecipient(variables: PreviewMergeVars) {
  return {
    name: String(variables.attendee_name ?? "Jane Smith"),
    email: String(variables.attendee_email ?? "jane@example.com"),
  };
}

export function EmailTemplatePreviewGallery<
  TTemplate extends EmailTemplatePreviewGalleryTemplateMeta,
>({
  title,
  description,
  groups,
  senderName,
  senderEmail,
  footerText,
  footerNote,
  onBack,
  onEditTemplate,
}: EmailTemplatePreviewGalleryProps<TTemplate>) {
  const [activeGroupId, setActiveGroupId] = useState<string>("all");
  const [enabledOnly, setEnabledOnly] = useState(false);

  const filteredGroups = useMemo(() => {
    const visibleGroups =
      activeGroupId === "all"
        ? groups
        : groups.filter((group) => group.id === activeGroupId);

    return visibleGroups
      .map((group) => ({
        ...group,
        templates: enabledOnly
          ? group.templates.filter((template) => template.enabled)
          : group.templates,
      }))
      .filter((group) => group.templates.length > 0);
  }, [activeGroupId, enabledOnly, groups]);

  const totalTemplateCount = useMemo(
    () => groups.reduce((count, group) => count + group.templates.length, 0),
    [groups],
  );

  const visibleTemplateCount = useMemo(
    () =>
      filteredGroups.reduce(
        (count, group) => count + group.templates.length,
        0,
      ),
    [filteredGroups],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-4 border-b border-border px-6 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Separator orientation="vertical" className="hidden h-6 md:block" />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">
                  {title}
                </h2>
                <Badge variant="outline" className="font-normal">
                  {visibleTemplateCount} of {totalTemplateCount} templates
                </Badge>
              </div>
              <p className="max-w-3xl text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-lg border border-border bg-card px-3 py-2">
            <span className="text-xs text-muted-foreground">Enabled only</span>
            <Switch checked={enabledOnly} onCheckedChange={setEnabledOnly} />
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/25 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            These previews use shared sample fixture data from the email preview
            registry. Sender and reply-routing values reflect the current form
            state so you can sanity-check real configuration without sending mail.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={activeGroupId === "all" ? "default" : "outline"}
            onClick={() => setActiveGroupId("all")}
            className="gap-2"
          >
            <Eye className="h-3.5 w-3.5" />
            All Templates
          </Button>

          {groups.map((group) => (
            <Button
              key={group.id}
              type="button"
              size="sm"
              variant={activeGroupId === group.id ? "default" : "outline"}
              onClick={() => setActiveGroupId(group.id)}
              className="gap-2"
            >
              <group.icon className="h-3.5 w-3.5" />
              {group.title}
            </Button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/15 px-6 py-6">
        <div className="space-y-8">
          {filteredGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                No templates match the current filter.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try switching back to all templates or include disabled
                templates again.
              </p>
            </div>
          ) : null}

          {filteredGroups.map((group) => (
            <section key={group.id} className="space-y-4">
              <div className="flex items-start gap-3">
                <SettingsIconBadge icon={group.icon} />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {group.title}
                    </h3>
                    <Badge variant="outline" className="font-normal">
                      {group.templates.length}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {group.templates.map((item) => {
                  const recipient = getPreviewRecipient(item.previewVariables);
                  const subject = replaceMergeVars(
                    item.subject,
                    item.previewVariables,
                  );
                  const preheader = replaceMergeVars(
                    item.preheader,
                    item.previewVariables,
                  );

                  return (
                    <div
                      key={item.template.key}
                      className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                        <div className="flex items-start gap-3">
                          <SettingsIconBadge icon={item.template.icon} />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-semibold text-foreground">
                                {item.template.name}
                              </h4>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-normal",
                                  item.enabled
                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                                    : "border-border/80 bg-muted text-muted-foreground",
                                )}
                              >
                                {item.enabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.template.description}
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-transparent"
                          onClick={() => onEditTemplate(item.template)}
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </div>

                      <div className="space-y-2 border-b border-border bg-card px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-destructive/40" />
                            <div className="h-3 w-3 rounded-full bg-chart-4/40" />
                            <div className="h-3 w-3 rounded-full bg-chart-2/40" />
                          </div>
                          <span className="ml-2 text-xs text-muted-foreground">
                            Email Preview
                          </span>
                        </div>

                        <div className="space-y-2 rounded-xl border border-border/80 bg-muted/10 px-4 py-3">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="text-muted-foreground">From:</span>
                            <span className="truncate text-right text-foreground">
                              {senderName} &lt;{senderEmail}&gt;
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="text-muted-foreground">To:</span>
                            <span className="truncate text-right text-foreground">
                              {recipient.name} &lt;{recipient.email}&gt;
                            </span>
                          </div>
                          <Separator />
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">
                              {subject}
                            </p>
                            {preheader ? (
                              <p className="text-xs italic text-muted-foreground">
                                {preheader}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-4">
                        <div className="max-h-[22rem] overflow-y-auto rounded-xl border border-border/70 bg-background px-4 py-4 text-sm leading-relaxed text-foreground/90">
                          {renderFormattedPreview(
                            item.body,
                            item.previewVariables,
                          )}
                        </div>

                        <Separator className="my-4" />

                        <div className="text-center text-xs text-muted-foreground">
                          {footerText ? <p>{footerText}</p> : null}
                          {!footerText && footerNote ? (
                            <p>{footerNote}</p>
                          ) : null}
                          {item.includeUnsubscribe ? (
                            <p className="mt-2 underline">Unsubscribe</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
