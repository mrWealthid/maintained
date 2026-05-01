"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Info, Mail, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { emailTemplateGroups } from "../data/settings.data";
import {
  BusinessEmailSettings,
  BusinessEmailTemplateKey,
  EmailTemplateSetting,
} from "../models/settings.model";
import { useEmailSettings, useUpdateEmailSettings } from "../hooks/settingsHooks";

type TemplateMeta = {
  key: BusinessEmailTemplateKey;
  name: string;
  description: string;
};

const EMPTY_TEMPLATE: EmailTemplateSetting = {
  enabled: false,
  subject: "",
  preheader: "",
  body: "",
  delay: "immediate",
  triggerDescription: "",
  includeUnsubscribe: false,
  replyToOverride: "",
};

function cloneSettings(settings: BusinessEmailSettings): BusinessEmailSettings {
  return {
    ...settings,
    templates: Object.fromEntries(
      Object.entries(settings.templates).map(([key, value]) => [
        key,
        { ...EMPTY_TEMPLATE, ...value },
      ])
    ) as BusinessEmailSettings["templates"],
  };
}

const EmailSettings: React.FC = () => {
  const { data: settings, isLoading } = useEmailSettings();
  const updateEmailSettings = useUpdateEmailSettings();
  const [localSettings, setLocalSettings] = useState<BusinessEmailSettings | null>(
    null
  );
  const [activeTemplate, setActiveTemplate] =
    useState<BusinessEmailTemplateKey>("team_invite");

  useEffect(() => {
    if (settings) setLocalSettings(cloneSettings(settings));
  }, [settings]);

  const allTemplateMeta = useMemo(
    () =>
      emailTemplateGroups.reduce<TemplateMeta[]>((templates, group) => {
        group.templates.forEach((template) => {
          templates.push({
            key: template.key,
            name: template.name,
            description: template.description,
          });
        });
        return templates;
      }, []),
    []
  );

  const templateMeta = useMemo(() => {
    return allTemplateMeta.find((template) => template.key === activeTemplate);
  }, [activeTemplate, allTemplateMeta]);

  const activeTemplateSettings = localSettings?.templates?.[activeTemplate];

  const updateTemplate = (
    key: BusinessEmailTemplateKey,
    patch: Partial<EmailTemplateSetting>
  ) => {
    setLocalSettings((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        templates: {
          ...prev.templates,
          [key]: {
            ...EMPTY_TEMPLATE,
            ...prev.templates[key],
            ...patch,
          },
        },
      };
    });
  };

  const handleSave = async () => {
    if (!localSettings) return;

    await updateEmailSettings.mutateAsync({
      replyTo: localSettings.replyTo,
      bcc: localSettings.bcc,
      templates: localSettings.templates,
    });
  };

  if (isLoading || !localSettings || !activeTemplateSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>Loading email settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Manage workspace email templates and reply routing.
              </CardDescription>
            </div>
            <Button
              onClick={handleSave}
              disabled={updateEmailSettings.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {updateEmailSettings.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Sender Information</h3>
              <p className="text-sm text-muted-foreground">
                Sender identity is managed at the platform level.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sender-name">Sender Name</Label>
                <Input
                  id="sender-name"
                  value={localSettings.senderName}
                  disabled
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-email">Sender Email</Label>
                <Input
                  id="sender-email"
                  value={localSettings.senderEmail}
                  disabled
                  readOnly
                />
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Business settings can manage reply routing and template content,
                while the sender identity stays controlled by the app.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Reply Routing</h3>
              <p className="text-sm text-muted-foreground">
                Leave reply-to blank to use the workspace email automatically.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reply-to">Reply-To Email</Label>
                <Input
                  id="reply-to"
                  type="email"
                  value={localSettings.replyTo}
                  onChange={(event) =>
                    setLocalSettings((prev) =>
                      prev ? { ...prev, replyTo: event.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bcc">BCC Email</Label>
                <Input
                  id="bcc"
                  type="email"
                  value={localSettings.bcc}
                  onChange={(event) =>
                    setLocalSettings((prev) =>
                      prev ? { ...prev, bcc: event.target.value } : prev
                    )
                  }
                />
              </div>
            </div>
          </section>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>
              Choose a template to edit its trigger, content, and enabled state.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {emailTemplateGroups.map((group) => (
              <div key={group.id} className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium">{group.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                </div>
                <div className="space-y-2">
                  {group.templates.map((template) => {
                    const key = template.key as BusinessEmailTemplateKey;
                    const enabled = localSettings.templates[key]?.enabled ?? false;
                    const isActive = activeTemplate === key;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveTemplate(key)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-colors ${
                          isActive
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-medium">
                            {template.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {enabled ? "Enabled" : "Disabled"}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{templateMeta?.name ?? activeTemplate}</CardTitle>
                <CardDescription>{templateMeta?.description}</CardDescription>
              </div>
              <Switch
                checked={activeTemplateSettings.enabled}
                onCheckedChange={(enabled) =>
                  updateTemplate(activeTemplate, { enabled })
                }
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-trigger">Trigger</Label>
              <Input
                id="template-trigger"
                value={activeTemplateSettings.triggerDescription}
                disabled
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject</Label>
              <Input
                id="template-subject"
                value={activeTemplateSettings.subject}
                onChange={(event) =>
                  updateTemplate(activeTemplate, { subject: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-preheader">Preheader</Label>
              <Input
                id="template-preheader"
                value={activeTemplateSettings.preheader}
                onChange={(event) =>
                  updateTemplate(activeTemplate, { preheader: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-reply-to">Template Reply-To Override</Label>
              <Input
                id="template-reply-to"
                type="email"
                value={activeTemplateSettings.replyToOverride ?? ""}
                onChange={(event) =>
                  updateTemplate(activeTemplate, {
                    replyToOverride: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-body">Body</Label>
              <Textarea
                id="template-body"
                value={activeTemplateSettings.body}
                onChange={(event) =>
                  updateTemplate(activeTemplate, { body: event.target.value })
                }
                className="min-h-[280px] font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailSettings;
