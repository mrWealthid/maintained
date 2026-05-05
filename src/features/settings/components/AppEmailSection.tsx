"use client";

import { ChevronRight, Eye, Mail } from "lucide-react";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useTypedSetValue } from "@/lib/rhf";

import { SettingsSection } from "./SettingsSection";
import { SettingsField } from "./SettingsField";
import { SettingsIconBadge } from "./SettingsIconBadge";
import {
  getAppEmailSettingsGroupsWithIcons,
  type AppEmailSettingsTemplateMeta,
} from "../data/email-template-registry-ui";
import type { AppSettingsFormValues } from "../models/app-settings-form.model";

export function AppEmailSection({
  onEditTemplate,
  onOpenGallery,
}: {
  onEditTemplate: (template: AppEmailSettingsTemplateMeta) => void;
  onOpenGallery: () => void;
}) {
  const { watch, setValue: rawSetValue } =
    useFormContext<AppSettingsFormValues>();
  const setValue = useTypedSetValue(rawSetValue);
  const email = watch("settings.email");

  const templateGroups = useMemo(
    () => getAppEmailSettingsGroupsWithIcons(),
    [],
  );

  return (
    <SettingsSection
      title="App Email Configuration"
      icon={Mail}
      description="Configure global application email sender details and template behavior"
    >
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">
          Sender Information
        </h4>

        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Sender Name" htmlFor="app-sender-name">
            <Input
              id="app-sender-name"
              value={email.senderName}
              onChange={(e) =>
                setValue("settings.email.senderName", e.target.value)
              }
            />
          </SettingsField>

          <SettingsField label="Sender Email" htmlFor="app-sender-email">
            <Input
              id="app-sender-email"
              type="email"
              value={email.senderEmail ?? ""}
              onChange={(e) =>
                setValue("settings.email.senderEmail", e.target.value)
              }
            />
          </SettingsField>

          <SettingsField label="Reply-To Email" htmlFor="app-reply-to">
            <Input
              id="app-reply-to"
              type="email"
              value={email.replyTo ?? ""}
              onChange={(e) =>
                setValue("settings.email.replyTo", e.target.value)
              }
            />
          </SettingsField>

          <SettingsField label="BCC Email (Optional)" htmlFor="app-bcc">
            <Input
              id="app-bcc"
              type="email"
              value={email.bcc ?? ""}
              onChange={(e) => setValue("settings.email.bcc", e.target.value)}
            />
          </SettingsField>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-sm font-medium text-foreground">
            Email Templates
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 self-start bg-transparent"
            onClick={onOpenGallery}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview Gallery
          </Button>
        </div>

        <div className="space-y-5">
          {templateGroups.map((group) => (
            <div
              key={group.id}
              className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4"
            >
              <div className="flex items-start gap-3">
                <SettingsIconBadge icon={group.icon} />
                <div className="space-y-1">
                  <h5 className="text-sm font-medium text-foreground">
                    {group.title}
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {group.templates.map((template) => {
                  const enabled =
                    email.templates?.[template.key]?.enabled ?? false;

                  return (
                    <div
                      key={template.key}
                      className="group flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:border-chart-2/30 hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        <SettingsIconBadge
                          icon={template.icon}
                          className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            {template.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) =>
                            setValue(
                              `settings.email.templates.${template.key}.enabled`,
                              checked,
                            )
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditTemplate(template)}
                          aria-label={`Edit ${template.name}`}
                          className="text-muted-foreground transition-colors group-hover:text-chart-2"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Email Footer</h4>

        <SettingsField label="Custom Footer Text" htmlFor="app-email-footer">
          <Textarea
            id="app-email-footer"
            rows={3}
            value={email.footer ?? ""}
            onChange={(e) => setValue("settings.email.footer", e.target.value)}
          />
        </SettingsField>
      </div>
    </SettingsSection>
  );
}
