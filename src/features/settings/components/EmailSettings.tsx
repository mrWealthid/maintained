"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Code,
  Eye,
  Info,
  Link2,
  Loader2,
  Mail,
  Save,
  Send,
  Type,
  Variable,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  BusinessEmailSettings,
  BusinessEmailTemplateKey,
  EmailTemplateDelay,
  EmailTemplateSetting,
} from "../models/settings.model";
import { useEmailSettings, useUpdateEmailSettings } from "../hooks/settingsHooks";
import {
  BusinessEmailSettingsTemplateMeta,
  getBusinessEmailSettingsGroupsWithIcons,
} from "../data/email-template-registry-ui";
import { SettingsField } from "./SettingsField";
import { SettingsIconBadge } from "./SettingsIconBadge";
import { SettingsSection } from "./SettingsSection";

type EmailView =
  | { mode: "list" }
  | { mode: "gallery" }
  | {
      mode: "edit";
      template: BusinessEmailSettingsTemplateMeta;
      returnTo: "list" | "gallery";
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

const previewVariables = {
  tenant_name: "Jordan Lee",
  ticket_id: "MT-1048",
  ticket_title: "Kitchen sink leak",
  property_name: "Harbor Point Apartments",
  unit_label: "Unit 4B",
  technician_name: "Avery Morgan",
  status: "In Progress",
  workspace_name: "Maintain",
  support_email: "support@example.com",
};

const mergeVariableGroups = [
  {
    category: "Ticket",
    variables: [
      ["Ticket ID", "{{ticket_id}}"],
      ["Ticket Title", "{{ticket_title}}"],
      ["Status", "{{status}}"],
    ],
  },
  {
    category: "People",
    variables: [
      ["Tenant Name", "{{tenant_name}}"],
      ["Technician Name", "{{technician_name}}"],
    ],
  },
  {
    category: "Workspace",
    variables: [
      ["Property Name", "{{property_name}}"],
      ["Unit Label", "{{unit_label}}"],
      ["Workspace Name", "{{workspace_name}}"],
      ["Support Email", "{{support_email}}"],
    ],
  },
] as const;

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

function renderPreview(value: string) {
  return Object.entries(previewVariables).reduce(
    (text, [key, replacement]) =>
      text.replaceAll(`{{${key}}}`, String(replacement)),
    value
  );
}

function getTemplate(
  settings: BusinessEmailSettings,
  key: BusinessEmailTemplateKey
) {
  return {
    ...EMPTY_TEMPLATE,
    ...settings.templates[key],
  };
}

const EmailSettings: React.FC = () => {
  const { data: settings, isLoading } = useEmailSettings();
  const updateEmailSettings = useUpdateEmailSettings();
  const [localSettings, setLocalSettings] =
    useState<BusinessEmailSettings | null>(null);
  const [savedSettings, setSavedSettings] =
    useState<BusinessEmailSettings | null>(null);
  const [view, setView] = useState<EmailView>({ mode: "list" });

  useEffect(() => {
    if (!settings) return;
    const nextSettings = cloneSettings(settings);
    setLocalSettings(nextSettings);
    setSavedSettings(nextSettings);
  }, [settings]);

  const updateTemplate = (
    key: BusinessEmailTemplateKey,
    patch: Partial<EmailTemplateSetting>
  ) => {
    setLocalSettings((current) => {
      if (!current) return current;

      return {
        ...current,
        templates: {
          ...current.templates,
          [key]: {
            ...getTemplate(current, key),
            ...patch,
          },
        },
      };
    });
  };

  const patchSettings = (patch: Partial<BusinessEmailSettings>) => {
    setLocalSettings((current) => (current ? { ...current, ...patch } : current));
  };

  const handleSave = async () => {
    if (!localSettings) return;

    const saved = await updateEmailSettings.mutateAsync({
      replyTo: localSettings.replyTo,
      bcc: localSettings.bcc,
      templates: localSettings.templates,
    });
    const nextSettings = cloneSettings(saved.data);
    setLocalSettings(nextSettings);
    setSavedSettings(nextSettings);
  };
  const hasChanges =
    Boolean(localSettings && savedSettings) &&
    JSON.stringify(localSettings) !== JSON.stringify(savedSettings);

  if (isLoading || !localSettings) {
    return (
      <SettingsSection
        title="Email Configuration"
        icon={Mail}
        description="Loading email settings..."
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading email configuration
        </div>
      </SettingsSection>
    );
  }

  if (view.mode === "edit") {
    return (
      <EmailTemplateEditorScreen
        settings={localSettings}
        template={view.template}
        saving={updateEmailSettings.isPending}
        hasChanges={hasChanges}
        onBack={() =>
          setView(view.returnTo === "gallery" ? { mode: "gallery" } : { mode: "list" })
        }
        onSave={handleSave}
        onUpdateTemplate={updateTemplate}
      />
    );
  }

  if (view.mode === "gallery") {
    return (
      <BusinessEmailPreviewGalleryScreen
        settings={localSettings}
        onBack={() => setView({ mode: "list" })}
        onEditTemplate={(template) =>
          setView({ mode: "edit", template, returnTo: "gallery" })
        }
      />
    );
  }

  return (
    <EmailSection
      settings={localSettings}
      saving={updateEmailSettings.isPending}
      hasChanges={hasChanges}
      onSave={handleSave}
      onPatchSettings={patchSettings}
      onUpdateTemplate={updateTemplate}
      onOpenGallery={() => setView({ mode: "gallery" })}
      onEditTemplate={(template) =>
        setView({ mode: "edit", template, returnTo: "list" })
      }
    />
  );
};

function EmailSection({
  settings,
  saving,
  hasChanges,
  onSave,
  onPatchSettings,
  onUpdateTemplate,
  onOpenGallery,
  onEditTemplate,
}: {
  settings: BusinessEmailSettings;
  saving: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onPatchSettings: (patch: Partial<BusinessEmailSettings>) => void;
  onUpdateTemplate: (
    key: BusinessEmailTemplateKey,
    patch: Partial<EmailTemplateSetting>
  ) => void;
  onOpenGallery: () => void;
  onEditTemplate: (template: BusinessEmailSettingsTemplateMeta) => void;
}) {
  const templateGroups = useMemo(
    () => getBusinessEmailSettingsGroupsWithIcons(),
    []
  );

  return (
    <SettingsSection
      title="Email Configuration"
      icon={Mail}
      description="Customize email templates and sender settings"
      actions={
        <Button type="button" onClick={onSave} disabled={saving || !hasChanges}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-foreground">
            Sender Information
          </h4>
          <p className="text-sm text-muted-foreground">
            Sender identity is visible here and managed at the platform level.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Sender Name" htmlFor="sender-name">
            <Input
              id="sender-name"
              value={settings.senderName}
              disabled
              readOnly
            />
          </SettingsField>

          <SettingsField label="Sender Email" htmlFor="sender-email">
            <Input
              id="sender-email"
              type="email"
              value={settings.senderEmail}
              disabled
              readOnly
            />
          </SettingsField>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/35 p-4">
          <SettingsIconBadge icon={Info} className="bg-muted text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Platform-managed sender identity
            </p>
            <p className="text-sm text-muted-foreground">
              Business settings can manage reply routing and template content,
              while the sender identity remains controlled centrally.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-foreground">Reply Routing</h4>
          <p className="text-sm text-muted-foreground">
            Configure where replies and support contact routing should go.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Reply-To Email" htmlFor="reply-to">
            <Input
              id="reply-to"
              type="email"
              value={settings.replyTo}
              onChange={(event) =>
                onPatchSettings({ replyTo: event.target.value })
              }
            />
          </SettingsField>

          <SettingsField label="BCC Email (Optional)" htmlFor="bcc">
            <Input
              id="bcc"
              type="email"
              placeholder="admin@example.com"
              value={settings.bcc ?? ""}
              onChange={(event) => onPatchSettings({ bcc: event.target.value })}
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
                    settings.templates?.[template.key]?.enabled ?? false;

                  return (
                    <div
                      key={template.key}
                      className="group flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:border-chart-2/30 hover:bg-muted/30"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <SettingsIconBadge
                          icon={template.icon}
                          className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        />
                        <div className="min-w-0">
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
                          onCheckedChange={(value) =>
                            onUpdateTemplate(template.key, { enabled: value })
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

      <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/35 p-4">
        <SettingsIconBadge icon={Info} className="bg-muted text-muted-foreground" />
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-foreground">Email Footer</h4>
          <p className="text-sm text-muted-foreground">
            Footer content is managed at the app level and applied across
            workspace emails automatically.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}

function BusinessEmailPreviewGalleryScreen({
  settings,
  onBack,
  onEditTemplate,
}: {
  settings: BusinessEmailSettings;
  onBack: () => void;
  onEditTemplate: (template: BusinessEmailSettingsTemplateMeta) => void;
}) {
  const groups = useMemo(() => getBusinessEmailSettingsGroupsWithIcons(), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button type="button" variant="ghost" className="px-0" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Email Configuration
          </Button>
          <h3 className="text-lg font-semibold text-foreground">
            Business Email Preview Gallery
          </h3>
          <p className="text-sm text-muted-foreground">
            Review every workspace email template with shared sample fixtures.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <SettingsIconBadge icon={group.icon} />
              <div>
                <h4 className="text-sm font-medium text-foreground">
                  {group.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {group.description}
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {group.templates.map((template) => {
                const config = getTemplate(settings, template.key);

                return (
                  <div
                    key={template.key}
                    className="rounded-xl border border-border/70 bg-muted/20 p-4"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <SettingsIconBadge icon={template.icon} />
                        <div>
                          <h5 className="text-sm font-medium text-foreground">
                            {template.name}
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant={config.enabled ? "outline" : "secondary"}>
                        {config.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-border bg-background">
                      <div className="border-b border-border bg-muted/35 px-4 py-3">
                        <p className="text-xs text-muted-foreground">
                          From: {settings.senderName} &lt;{settings.senderEmail}&gt;
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {renderPreview(config.subject)}
                        </p>
                        {config.preheader ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {renderPreview(config.preheader)}
                          </p>
                        ) : null}
                      </div>
                      <div className="max-h-64 overflow-auto whitespace-pre-wrap px-4 py-4 text-sm text-foreground">
                        {renderPreview(config.body)}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEditTemplate(template)}
                      >
                        Edit Template
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
  );
}

function EmailTemplateEditorScreen({
  settings,
  template,
  saving,
  hasChanges,
  onBack,
  onSave,
  onUpdateTemplate,
}: {
  settings: BusinessEmailSettings;
  template: BusinessEmailSettingsTemplateMeta;
  saving: boolean;
  hasChanges: boolean;
  onBack: () => void;
  onSave: () => void;
  onUpdateTemplate: (
    key: BusinessEmailTemplateKey,
    patch: Partial<EmailTemplateSetting>
  ) => void;
}) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const config = getTemplate(settings, template.key);
  const [view, setView] = useState<"edit" | "preview">("edit");

  const patchTemplate = (patch: Partial<EmailTemplateSetting>) => {
    onUpdateTemplate(template.key, patch);
  };

  const insertMergeVariable = (variable: string) => {
    const field = bodyRef.current;
    const start = field?.selectionStart ?? config.body.length;
    const end = field?.selectionEnd ?? config.body.length;
    const next = `${config.body.slice(0, start)}${variable}${config.body.slice(end)}`;
    patchTemplate({ body: next });

    requestAnimationFrame(() => {
      field?.focus();
      const cursor = start + variable.length;
      field?.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button type="button" variant="ghost" className="px-0" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Email Configuration
          </Button>
          <div className="flex items-center gap-3">
            <SettingsIconBadge icon={template.icon} />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {template.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={view === "edit" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("edit")}
          >
            <Code className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            type="button"
            variant={view === "preview" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("preview")}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button type="button" onClick={onSave} disabled={saving || !hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SettingsSection
          title="Template Content"
          description="Edit subject, delivery timing, and message body"
          icon={Mail}
        >
          {view === "edit" ? (
            <>
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 p-4">
                <div>
                  <Label>Enabled</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow this template to be sent by workspace workflows.
                  </p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(enabled) => patchTemplate({ enabled })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <SettingsField label="Delivery Delay">
                  <Select
                    value={config.delay}
                    onValueChange={(value) =>
                      patchTemplate({ delay: value as EmailTemplateDelay })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select delay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="48h">48 hours</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsField>

                <SettingsField label="Template Reply-To Override">
                  <Input
                    type="email"
                    value={config.replyToOverride ?? ""}
                    onChange={(event) =>
                      patchTemplate({ replyToOverride: event.target.value })
                    }
                    placeholder={settings.replyTo || "support@example.com"}
                  />
                </SettingsField>
              </div>

              {config.delay === "custom" ? (
                <SettingsField label="Custom Delay Minutes">
                  <Input
                    type="number"
                    min={1}
                    max={10080}
                    value={config.customDelayMinutes ?? 60}
                    onChange={(event) =>
                      patchTemplate({
                        customDelayMinutes: Number(event.target.value) || 60,
                      })
                    }
                  />
                </SettingsField>
              ) : null}

              <SettingsField label="Trigger">
                <Input value={config.triggerDescription} disabled readOnly />
              </SettingsField>

              <SettingsField label="Subject">
                <Input
                  value={config.subject}
                  onChange={(event) =>
                    patchTemplate({ subject: event.target.value })
                  }
                />
              </SettingsField>

              <SettingsField label="Preheader">
                <Input
                  value={config.preheader}
                  onChange={(event) =>
                    patchTemplate({ preheader: event.target.value })
                  }
                />
              </SettingsField>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMergeVariable("{{tenant_name}}")}
                  >
                    <Variable className="mr-2 h-4 w-4" />
                    Tenant
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMergeVariable("{{ticket_id}}")}
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Ticket ID
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMergeVariable("{{property_name}}")}
                  >
                    <Type className="mr-2 h-4 w-4" />
                    Property
                  </Button>
                </div>
                <Textarea
                  ref={bodyRef}
                  value={config.body}
                  onChange={(event) => patchTemplate({ body: event.target.value })}
                  className="min-h-[360px] font-mono text-sm"
                />
              </div>
            </>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              <div className="border-b border-border bg-muted/35 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  From: {settings.senderName} &lt;{settings.senderEmail}&gt;
                </p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {renderPreview(config.subject)}
                </p>
                {config.preheader ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {renderPreview(config.preheader)}
                  </p>
                ) : null}
              </div>
              <div className="min-h-[360px] whitespace-pre-wrap px-5 py-5 text-sm leading-6 text-foreground">
                {renderPreview(config.body)}
              </div>
            </div>
          )}
        </SettingsSection>

        <div className="space-y-6">
          <SettingsSection
            title="Merge Variables"
            description="Insert supported placeholders into the template body"
            icon={Variable}
          >
            <div className="space-y-5">
              {mergeVariableGroups.map((group) => (
                <div key={group.category} className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">
                    {group.category}
                  </h4>
                  <div className="space-y-2">
                    {group.variables.map(([label, variable]) => (
                      <Button
                        key={variable}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full justify-between gap-3 bg-transparent"
                        onClick={() => insertMergeVariable(variable)}
                      >
                        <span>{label}</span>
                        <code className="text-xs text-muted-foreground">
                          {variable}
                        </code>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SettingsSection>

          <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/35 p-4">
            <SettingsIconBadge icon={Send} className="bg-muted text-muted-foreground" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-foreground">
                Test Delivery
              </h4>
              <p className="text-sm text-muted-foreground">
                Template preview uses sample data here. SMTP test delivery can
                be wired to the platform email client when the endpoint is added.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailSettings;
