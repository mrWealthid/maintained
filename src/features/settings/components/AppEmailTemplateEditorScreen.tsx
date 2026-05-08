"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Eye,
  Code,
  Variable,
  Send,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Link2,
  Image as ImageIcon,
  List,
  AlignLeft,
  AlignCenter,
  Type,
  CheckCircle2,
  AlertCircle,
  Mail,
  Loader2,
  X,
} from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";

import type {
  AppEmailTemplateKey,
  AppSettingsFormValues,
} from "../models/app-settings-form.model";
import {
  APP_EMAIL_TEMPLATE_KEYS,
  DEFAULT_APP_EMAIL_SETTINGS,
  DEFAULT_APP_EMAIL_TEMPLATES,
} from "@/lib/email/defaults/default-app-email-template";
import { getAppEmailTemplatePreviewConfig } from "@/lib/email/email-template-preview";
import { normalizeSupportEmailFooterTemplate } from "@/lib/email/helpers/support-email";
import {
  isValidEmail,
  renderFormattedPreview,
  replaceMergeVars,
} from "../helpers/helper";
import { delayOptions } from "../data/settings.data";
import { useSendAppTestEmail } from "../hooks/settingsHooks";
import { useTypedSetValue } from "@/lib/rhf";
import { SettingsIconBadge } from "./SettingsIconBadge";
import type { AppEmailSettingsTemplateMeta } from "../data/email-template-registry-ui";

type DefaultTemplate = {
  subject: string;
  body: string;
  preheader: string;
  triggerDescription: string;
  delay: "immediate" | "1h" | "24h" | "48h" | "custom";
};

/**
 * IMPORTANT:
 * This drop-in binds directly to RHF: settings.email.templates.<key>.*
 * It does NOT keep separate local state for subject/body/preheader.
 * Local state is only used for preview mode, dialogs, undo stack, send-test panel.
 */

const DEFAULT_TEMPLATES_BY_KEY: Record<AppEmailTemplateKey, DefaultTemplate> =
  APP_EMAIL_TEMPLATE_KEYS.reduce(
    (acc, key) => {
      const template = DEFAULT_APP_EMAIL_TEMPLATES[key];
      acc[key] = {
        subject: template.subject,
        body: template.body,
        preheader: template.preheader,
        triggerDescription: template.triggerDescription,
        delay: template.delay,
      };
      return acc;
    },
    {} as Record<AppEmailTemplateKey, DefaultTemplate>,
  );

const MERGE_VARIABLE_CATEGORIES = [
  {
    category: "Recipient",
    variables: [
      {
        label: "Name",
        value: "{{attendee_name}}",
        description: "Full name of the recipient",
      },
      {
        label: "First Name",
        value: "{{attendee_first_name}}",
        description: "First name only",
      },
    ],
  },
  {
    category: "Application",
    variables: [
      {
        label: "App Name",
        value: "{{app_name}}",
        description: "Application display name",
      },
      {
        label: "Support Email",
        value: "{{support_email}}",
        description: "Application support email address",
      },
    ],
  },
  {
    category: "Authentication",
    variables: [
      {
        label: "Reset URL",
        value: "{{reset_url}}",
        description: "Secure password reset URL",
      },
      {
        label: "Reset Expiry",
        value: "{{reset_token_expires_minutes}}",
        description: "Reset token validity in minutes",
      },
      {
        label: "Magic Link URL",
        value: "{{magic_link_url}}",
        description: "Secure passwordless sign-in URL",
      },
      {
        label: "Magic Link Revoke URL",
        value: "{{magic_link_revoke_url}}",
        description: "Security link that revokes the passwordless sign-in link",
      },
      {
        label: "Magic Link Expiry",
        value: "{{magic_link_expires_minutes}}",
        description: "Passwordless sign-in link validity in minutes",
      },
      {
        label: "Passcode",
        value: "{{passcode}}",
        description: "Password change verification code",
      },
      {
        label: "Passcode Expiry",
        value: "{{passcode_expires_minutes}}",
        description: "Passcode validity window in minutes",
      },
    ],
  },
  {
    category: "Workspace",
    variables: [
      {
        label: "Business Name",
        value: "{{business_name}}",
        description: "Workspace or business name",
      },
      {
        label: "Dashboard URL",
        value: "{{dashboard_url}}",
        description: "Link to the application dashboard",
      },
      {
        label: "Login URL",
        value: "{{login_url}}",
        description: "Application login URL",
      },
      {
        label: "Invite URL",
        value: "{{invite_url}}",
        description: "Team invite completion URL",
      },
      {
        label: "Invite Expiry",
        value: "{{invite_expires_hours}}",
        description: "Invite validity in hours",
      },
    ],
  },
];

export function AppEmailTemplateEditorScreen({
  template,
  onBack,
}: {
  template: AppEmailSettingsTemplateMeta;
  onBack: () => void;
}) {
  const { watch, setValue: rawSetValue } = useFormContext<AppSettingsFormValues>();
  const setValue = useTypedSetValue(rawSetValue);

  const email = watch("settings.email");
  const t = email.templates?.[template.key];

  const defaults = DEFAULT_TEMPLATES_BY_KEY[template.key];

  // Ensure the template object exists with defaults (older records may be missing)
  // NOTE: done in render-safe way; avoid setValue loops by only writing when missing.
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    if (t && t.subject != null) return;

    didInitRef.current = true;
    setValue(`settings.email.templates.${template.key}.enabled`, t?.enabled ?? false);
    setValue(`settings.email.templates.${template.key}.subject`, t?.subject ?? defaults.subject);
    setValue(`settings.email.templates.${template.key}.preheader`, t?.preheader ?? defaults.preheader);
    setValue(
      `settings.email.templates.${template.key}.triggerDescription`,
      t?.triggerDescription ?? defaults.triggerDescription,
    );
    setValue(`settings.email.templates.${template.key}.delay`, t?.delay ?? defaults.delay);
    setValue(`settings.email.templates.${template.key}.body`, t?.body ?? defaults.body);
    setValue(`settings.email.templates.${template.key}.includeUnsubscribe`, t?.includeUnsubscribe ?? false);
    setValue(`settings.email.templates.${template.key}.replyToOverride`, t?.replyToOverride ?? "");
  }, [defaults, setValue, t, template.key]);

  const enabled = t?.enabled ?? false;
  const subject = t?.subject ?? defaults.subject;
  const preheader = t?.preheader ?? defaults.preheader;
  const body = t?.body ?? defaults.body;
  const delay = (t?.delay) ?? defaults.delay;
  const triggerDescription = t?.triggerDescription ?? defaults.triggerDescription;

  const [view, setView] = useState<"edit" | "preview">("edit");
  const [showMergeVars, setShowMergeVars] = useState(false);
  const [insertedVar, setInsertedVar] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<"subject" | "preheader" | "body">("body");
  const [searchVar, setSearchVar] = useState("");

  const subjectRef = useRef<HTMLInputElement>(null);
  const preheaderRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const cursorPositions = useRef<Record<string, number>>({
    subject: subject.length,
    preheader: preheader.length,
    body: body.length,
  });

  const trackCursor = useCallback((field: "subject" | "preheader" | "body") => {
    const refs = { subject: subjectRef, preheader: preheaderRef, body: bodyRef };
    const el = refs[field].current;
    if (el) {
      cursorPositions.current[field] = (el).selectionStart ?? 0;
      setActiveField(field);
    }
  }, []);

  const insertMergeVariable = useCallback(
    (variable: string) => {
      const pos = cursorPositions.current[activeField] ?? 0;
      let path:
        | `settings.email.templates.${AppEmailTemplateKey}.subject`
        | `settings.email.templates.${AppEmailTemplateKey}.preheader`
        | `settings.email.templates.${AppEmailTemplateKey}.body`;
      let current: string;

      switch (activeField) {
        case "subject":
          path = `settings.email.templates.${template.key}.subject`;
          current = subject;
          break;
        case "preheader":
          path = `settings.email.templates.${template.key}.preheader`;
          current = preheader;
          break;
        default:
          path = `settings.email.templates.${template.key}.body`;
          current = body;
          break;
      }

      const before = current.slice(0, pos);
      const after = current.slice(pos);
      const next = `${before}${variable}${after}`;

      setValue(path, next);

      cursorPositions.current[activeField] = pos + variable.length;
      setInsertedVar(variable);
      setTimeout(() => setInsertedVar(null), 1500);

      setTimeout(() => {
        const refs = { subject: subjectRef, preheader: preheaderRef, body: bodyRef };
        const el = refs[activeField].current;
        if (el) {
          el.focus();
          const newPos = pos + variable.length;
          el.setSelectionRange(newPos, newPos);
        }
      }, 50);
    },
    [activeField, body, preheader, subject, setValue, template.key],
  );

  const filteredCategories = useMemo(
    () =>
      MERGE_VARIABLE_CATEGORIES.map((cat) => ({
        ...cat,
        variables: cat.variables.filter(
          (v) =>
            v.label.toLowerCase().includes(searchVar.toLowerCase()) ||
            v.value.toLowerCase().includes(searchVar.toLowerCase()),
        ),
      })).filter((cat) => cat.variables.length > 0),
    [searchVar],
  );

  // --- Undo/redo (body only; local stack) ---
  const [history, setHistory] = useState<string[]>([body]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback(
    (newBody: string) => {
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        return [...trimmed, newBody];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex],
  );

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setValue(`settings.email.templates.${template.key}.body`, history[newIndex]);
  }, [history, historyIndex, setValue, template.key]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setValue(`settings.email.templates.${template.key}.body`, history[newIndex]);
  }, [history, historyIndex, setValue, template.key]);

  // Body selection helpers
  const getBodySelection = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return { start: 0, end: 0, selected: "" };
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    return { start, end, selected: body.slice(start, end) };
  }, [body]);

  const replaceBodyRange = useCallback(
    (start: number, end: number, replacement: string) => {
      const before = body.slice(0, start);
      const after = body.slice(end);
      const newBody = `${before}${replacement}${after}`;

      setValue(`settings.email.templates.${template.key}.body`, newBody);
      pushHistory(newBody);

      setTimeout(() => {
        const el = bodyRef.current;
        if (el) {
          el.focus();
          const cursorPos = start + replacement.length;
          el.setSelectionRange(cursorPos, cursorPos);
          cursorPositions.current.body = cursorPos;
        }
      }, 0);
    },
    [body, pushHistory, setValue, template.key],
  );

  const wrapSelection = useCallback(
    (prefix: string, suffix: string, placeholder: string) => {
      const { start, end, selected } = getBodySelection();
      const text = selected || placeholder;
      replaceBodyRange(start, end, `${prefix}${text}${suffix}`);
    },
    [getBodySelection, replaceBodyRange],
  );

  const prependToLine = useCallback(
    (prefix: string) => {
      const { start } = getBodySelection();
      const lineStart = body.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = body.indexOf("\n", start);
      const actualEnd = lineEnd === -1 ? body.length : lineEnd;
      const line = body.slice(lineStart, actualEnd);

      if (line.startsWith(prefix)) {
        replaceBodyRange(lineStart, actualEnd, line.slice(prefix.length));
      } else {
        replaceBodyRange(lineStart, actualEnd, `${prefix}${line}`);
      }
    },
    [body, getBodySelection, replaceBodyRange],
  );

  const formatBold = useCallback(() => wrapSelection("**", "**", "bold text"), [wrapSelection]);
  const formatItalic = useCallback(() => wrapSelection("_", "_", "italic text"), [wrapSelection]);
  const formatHeading = useCallback(() => prependToLine("## "), [prependToLine]);
  const formatList = useCallback(() => prependToLine("- "), [prependToLine]);

  const formatAlignLeft = useCallback(() => {
    const { start } = getBodySelection();
    const lineStart = body.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = body.indexOf("\n", start);
    const actualEnd = lineEnd === -1 ? body.length : lineEnd;
    const line = body.slice(lineStart, actualEnd);
    const cleaned = line.replace(/^>>>/, "").replace(/<<<$/, "");
    replaceBodyRange(lineStart, actualEnd, cleaned);
  }, [body, getBodySelection, replaceBodyRange]);

  const formatAlignCenter = useCallback(() => {
    const { start } = getBodySelection();
    const lineStart = body.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = body.indexOf("\n", start);
    const actualEnd = lineEnd === -1 ? body.length : lineEnd;
    const line = body.slice(lineStart, actualEnd);
    if (line.startsWith(">>>") && line.endsWith("<<<")) {
      replaceBodyRange(lineStart, actualEnd, line.slice(3, -3));
    } else {
      replaceBodyRange(lineStart, actualEnd, `>>>${line}<<<`);
    }
  }, [body, getBodySelection, replaceBodyRange]);

  // Link/Image dialogs (body only)
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const openLinkDialog = useCallback(() => {
    const { selected } = getBodySelection();
    setLinkText(selected || "");
    setLinkUrl("");
    setShowLinkDialog(true);
  }, [getBodySelection]);

  const insertLink = useCallback(() => {
    const { start, end } = getBodySelection();
    const text = linkText || linkUrl;
    replaceBodyRange(start, end, `[${text}](${linkUrl})`);
    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
  }, [getBodySelection, linkText, linkUrl, replaceBodyRange]);

  const openImageDialog = useCallback(() => {
    setImageUrl("");
    setImageAlt("");
    setShowImageDialog(true);
  }, []);

  const insertImage = useCallback(() => {
    const { start, end } = getBodySelection();
    replaceBodyRange(start, end, `![${imageAlt || "image"}](${imageUrl})`);
    setShowImageDialog(false);
    setImageUrl("");
    setImageAlt("");
  }, [getBodySelection, imageAlt, imageUrl, replaceBodyRange]);

  const handleBodyKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "b") {
        e.preventDefault();
        formatBold();
      } else if (mod && e.key === "i") {
        e.preventDefault();
        formatItalic();
      } else if (mod && e.key === "k") {
        e.preventDefault();
        openLinkDialog();
      } else if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    },
    [formatBold, formatItalic, openLinkDialog, redo, undo],
  );

  // --- Send Test panel (drop-in; wire to API later) ---
  const [showSendTest, setShowSendTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const testEmailInputRef = useRef<HTMLInputElement>(null);

  const openSendTest = useCallback(() => {
    setShowSendTest(true);
    setTestResult(null);
    setTestSending(false);
    setTimeout(() => testEmailInputRef.current?.focus(), 100);
  }, []);

  const closeSendTest = useCallback(() => {
    setShowSendTest(false);
    setTestEmail("");
    setTestResult(null);
    setTestSending(false);
  }, []);

  const sendTestEmail = useSendAppTestEmail();

  const handleSendTest = useCallback(() => {
    if (!isValidEmail(testEmail)) return;

    setTestSending(true);
    setTestResult(null);

    sendTestEmail.mutate(
      {
        templateKey: template.key,
        to: testEmail,
        sender: {
          senderName: email.senderName,
          senderEmail: email.senderEmail,
          replyTo: email.replyTo,
          bcc: email.bcc,
          footer: email.footer,
        },
        template: {
          subject,
          preheader,
          body,
          replyToOverride: t?.replyToOverride,
        },
      },
      {
        onSuccess: (response) => {
          setTestResult({
            success: true,
            message: response.message || `Test email sent to ${testEmail}`,
          });
        },
        onError: (err: Error) => {
          setTestResult({
            success: false,
            message: err.message || "Failed to send test email",
          });
        },
        onSettled: () => {
          setTestSending(false);
          setTimeout(() => setTestResult(null), 4000);
        },
      },
    );
  }, [
    sendTestEmail,
    testEmail,
    template.key,
    email.senderName,
    email.senderEmail,
    email.replyTo,
    email.bcc,
    email.footer,
    subject,
    preheader,
    body,
    t?.replyToOverride,
  ]);

  const previewVariables = useMemo(
    () =>
      getAppEmailTemplatePreviewConfig(template.key, {
        app_name: email.senderName?.trim() || undefined,
        support_email:
          t?.replyToOverride?.trim() ||
          email.replyTo?.trim() ||
          email.senderEmail?.trim() ||
          undefined,
      }).variables,
    [email.replyTo, email.senderEmail, email.senderName, t?.replyToOverride, template.key],
  );

  const renderPreviewValue = useCallback(
    (text: string) => replaceMergeVars(text, previewVariables),
    [previewVariables],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex md:items-center flex-col md:flex-row gap-2 md:gap-0 items-start justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h2 className="text-base font-semibold text-foreground">{template.name}</h2>
            <p className="text-xs text-muted-foreground">{template.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border p-0.5">
            <button
              type="button"
              onClick={() => setView("edit")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === "edit"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Code className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setView("preview")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === "preview"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          </div>

          <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={openSendTest}>
            <Send className="h-3.5 w-3.5" />
            Send Test
          </Button>
        </div>
      </div>

      {/* Send Test Email Panel */}
      {showSendTest && (
        <div className="border-b border-border bg-muted/20">
          <div className="px-6 py-4">
            <div className="flex items-start gap-4">
              <SettingsIconBadge icon={Mail} />

              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Send Test Email</h3>
                    <p className="text-xs text-muted-foreground">
                      Send a preview of this template to verify it looks correct
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeSendTest}
                    className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex gap-2">
                      <Input
                        ref={testEmailInputRef}
                        type="email"
                        value={testEmail}
                        onChange={(e) => {
                          setTestEmail(e.target.value);
                          setTestResult(null);
                        }}
                        placeholder="recipient@example.com"
                        className={`h-9 text-sm ${testEmail && !isValidEmail(testEmail)
                          ? "border-destructive/50 focus-visible:ring-destructive/30"
                          : ""
                          }`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && isValidEmail(testEmail) && !testSending) {
                            handleSendTest();
                          }
                          if (e.key === "Escape") closeSendTest();
                        }}
                        disabled={testSending}
                      />
                    </div>
                    {testEmail && !isValidEmail(testEmail) && (
                      <ErrorMessage errorMsg="Please enter a valid email address" />
                    )}
                  </div>

                  <Button
                    size="sm"
                    className="h-9 gap-2"
                    onClick={handleSendTest}
                    disabled={!isValidEmail(testEmail) || testSending}
                  >
                    {testSending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Send
                      </>
                    )}
                  </Button>
                </div>

                {testResult && (
                  <div
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${testResult.success
                      ? "bg-chart-2/10 text-chart-2"
                      : "bg-destructive/10 text-destructive"
                      }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                    {testResult.success && (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        Check your inbox (and spam folder)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {view === "edit" ? (
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Trigger info */}
            <div className="border-b border-border bg-muted/30 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-chart-2/30  text-chart-2"
                  >
                    Trigger
                  </Badge>
                  <span className="text-xs text-muted-foreground">{triggerDescription}</span>
                </div>

                <Select
                  value={delay}
                  onValueChange={(v) =>
                    setValue(
                      `settings.email.templates.${template.key}.delay`,
                      v as DefaultTemplate["delay"],
                    )
                  }
                >
                  <SelectTrigger className="h-7 w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>

                    {delayOptions.map((options: { key: string; value: string }) => (
                      <SelectItem key={options.value} value={options.value}>{options.key}</SelectItem>

                    ))}

                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-1 space-y-5 p-6">
              {/* Subject */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Subject Line
                  </Label>
                  {showMergeVars && activeField === "subject" && (
                    <span className="text-[10px] font-medium text-chart-2">Insert target</span>
                  )}
                </div>
                <Input
                  ref={subjectRef}
                  value={subject}
                  onChange={(e) => {
                    setValue(`settings.email.templates.${template.key}.subject`, e.target.value);
                    trackCursor("subject");
                  }}
                  onFocus={() => setActiveField("subject")}
                  onClick={() => trackCursor("subject")}
                  onKeyUp={() => trackCursor("subject")}
                  className={`text-sm transition-colors ${showMergeVars && activeField === "subject"
                    ? "border-chart-2/50 ring-1 ring-chart-2/20"
                    : ""
                    }`}
                  placeholder="Enter email subject..."
                />
              </div>

              {/* Preheader */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Preheader Text
                    </Label>
                    {showMergeVars && activeField === "preheader" && (
                      <span className="text-[10px] font-medium text-chart-2">Insert target</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{preheader.length}/120</span>
                </div>
                <Input
                  ref={preheaderRef}
                  value={preheader}
                  maxLength={120}
                  onChange={(e) => {
                    setValue(`settings.email.templates.${template.key}.preheader`, e.target.value);
                    trackCursor("preheader");
                  }}
                  onFocus={() => setActiveField("preheader")}
                  onClick={() => trackCursor("preheader")}
                  onKeyUp={() => trackCursor("preheader")}
                  className={`text-sm transition-colors ${showMergeVars && activeField === "preheader"
                    ? "border-chart-2/50 ring-1 ring-chart-2/20"
                    : ""
                    }`}
                  placeholder="Preview text shown in inbox..."
                />
              </div>

              <Separator />

              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <TooltipProvider delayDuration={200}>
                  <div className="flex items-center gap-0.5 rounded-lg border border-border p-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={formatBold}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Bold className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Bold (Ctrl+B)</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={formatItalic}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Italic className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Italic (Ctrl+I)</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={openLinkDialog}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Link2 className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Insert Link (Ctrl+K)</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={openImageDialog}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Insert Image</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={formatList}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <List className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Bullet List</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={formatAlignLeft}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <AlignLeft className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Align Left</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={formatAlignCenter}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <AlignCenter className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Center</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={formatHeading}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Type className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Heading</p>
                      </TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="mx-1 h-5" />

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={undo}
                          disabled={historyIndex <= 0}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                        >
                          <Undo2 className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Undo (Ctrl+Z)</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={redo}
                          disabled={historyIndex >= history.length - 1}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                        >
                          <Redo2 className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Redo (Ctrl+Shift+Z)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => setShowMergeVars(!showMergeVars)}
                >
                  <Variable className="h-3.5 w-3.5" />
                  Insert Variable
                </Button>
              </div>

              {/* Link dialog */}
              {showLinkDialog && (
                <div className="rounded-md border border-border bg-popover p-4 shadow-xs">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-chart-2" />
                      <span className="text-sm font-medium text-foreground">Insert Link</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLinkDialog(false)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Link Text</Label>
                      <Input
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                        placeholder="Display text..."
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">URL</Label>
                      <Input
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && linkUrl) insertLink();
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="font-mono text-[10px] text-muted-foreground">
                        [{linkText || "text"}]({linkUrl || "url"})
                      </p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowLinkDialog(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={insertLink} disabled={!linkUrl}>
                          Insert
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Image dialog */}
              {showImageDialog && (
                <div className="rounded-md border border-border bg-popover p-4 shadow-xs">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-chart-2" />
                      <span className="text-sm font-medium text-foreground">Insert Image</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowImageDialog(false)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Image URL</Label>
                      <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.png"
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Alt Text</Label>
                      <Input
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="Describe the image..."
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && imageUrl) insertImage();
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="font-mono text-[10px] text-muted-foreground">
                        ![{imageAlt || "image"}]({imageUrl || "url"})
                      </p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowImageDialog(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={insertImage} disabled={!imageUrl}>
                          Insert
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Merge variables */}
              {showMergeVars && (
                <div className="rounded-md border border-chart-2/20 bg-popover shadow-xs">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Variable className="h-4 w-4 text-chart-2" />
                      <span className="text-sm font-medium text-foreground">Merge Variables</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Inserting into:{" "}
                        <span className="capitalize text-chart-2">{activeField}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMergeVars(false);
                          setSearchVar("");
                        }}
                        className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="border-b border-border px-4 py-2">
                    <Input
                      value={searchVar}
                      onChange={(e) => setSearchVar(e.target.value)}
                      placeholder="Search variables..."
                      className="h-8 border-0 bg-muted/50 px-3 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-chart-2/30"
                    />
                  </div>

                  {insertedVar && (
                    <div className="mx-4 mt-2 flex items-center gap-2 rounded-md bg-chart-2/10 px-3 py-1.5 text-xs text-chart-2">
                      <CheckCircle2 className="h-3 w-3" />
                      Inserted{" "}
                      <code className="font-mono text-[10px]">{insertedVar}</code> into{" "}
                      {activeField}
                    </div>
                  )}

                  <div className="max-h-[280px] overflow-y-auto p-3">
                    {filteredCategories.length === 0 ? (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        No variables match your search
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {filteredCategories.map((cat) => (
                          <div key={cat.category}>
                            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                              {cat.category}
                            </p>
                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                              {cat.variables.map((v) => (
                                <button
                                  key={v.value}
                                  type="button"
                                  onClick={() => insertMergeVariable(v.value)}
                                  className="group flex flex-col gap-0.5 rounded-md border border-transparent px-3 py-2 text-left transition-all hover:border-chart-2/20 hover:bg-chart-2/5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-foreground">
                                      {v.label}
                                    </span>
                                    <span className="text-[10px] text-transparent transition-colors group-hover:text-chart-2">
                                      + Insert
                                    </span>
                                  </div>
                                  <span className="font-mono text-[10px] text-chart-2/60">
                                    {v.value}
                                  </span>
                                  <span className="text-[10px] leading-tight text-muted-foreground">
                                    {v.description}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border px-4 py-2">
                    <p className="text-[10px] text-muted-foreground">
                      Click a field above to change the insert target, then click a variable to insert
                      it at the cursor position.
                    </p>
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Email Body
                  </Label>
                  {showMergeVars && activeField === "body" && (
                    <span className="text-[10px] font-medium text-chart-2">Insert target</span>
                  )}
                </div>

                <Textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => {
                    setValue(`settings.email.templates.${template.key}.body`, e.target.value);
                    trackCursor("body");
                  }}
                  onFocus={() => setActiveField("body")}
                  onClick={() => trackCursor("body")}
                  onKeyUp={() => trackCursor("body")}
                  onKeyDown={handleBodyKeyDown}
                  onBlur={() => {
                    if (body !== history[historyIndex]) pushHistory(body);
                  }}
                  className={`min-h-[360px] font-mono text-sm leading-relaxed transition-colors ${showMergeVars && activeField === "body"
                    ? "border-chart-2/50 ring-1 ring-chart-2/20"
                    : ""
                    }`}
                  placeholder="Write your email content here..."
                />
              </div>

              {/* Template settings (saved inside templates.<key>.*) */}
              <Separator />
              <div className="space-y-4">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Template Settings
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Active</p>
                      <p className="text-xs text-muted-foreground">Enable this template</p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(v) =>
                        setValue(`settings.email.templates.${template.key}.enabled`, v)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Include Unsubscribe</p>
                      <p className="text-xs text-muted-foreground">Add unsubscribe link</p>
                    </div>
                    <Switch
                      checked={t?.includeUnsubscribe ?? true}
                      onCheckedChange={(v) =>
                        setValue(
                          `settings.email.templates.${template.key}.includeUnsubscribe`,
                          v,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reply-To Override</Label>
                  <Input
                    type="email"
                    placeholder="Use default reply-to address"
                    className="text-sm"
                    value={t?.replyToOverride ?? ""}
                    onChange={(e) =>
                      setValue(
                        `settings.email.templates.${template.key}.replyToOverride`,
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Preview
          <div className="flex flex-1 flex-col items-center overflow-y-auto bg-muted/20 p-6">
            <div className="w-full max-w-[600px]">
              <div className="rounded-t-lg border border-b-0 border-border bg-card px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive/40" />
                    <div className="h-3 w-3 rounded-full bg-chart-4/40" />
                    <div className="h-3 w-3 rounded-full bg-chart-2/40" />
                  </div>
                  <span className="ml-4 text-xs text-muted-foreground">Email Preview</span>
                </div>
              </div>

              <div className="space-y-2 border border-b-0 border-border bg-card px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">From:</span>
                  <span className="text-xs text-foreground">
                    {email.senderName} &lt;{email.senderEmail || "no-reply@maintainly.app"}&gt;
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">To:</span>
                  <span className="text-xs text-foreground">
                    {previewVariables.attendee_name} &lt;{previewVariables.attendee_email}&gt;
                  </span>
                </div>
                <Separator />
                <div className="text-sm font-semibold text-foreground">
                  {renderPreviewValue(subject)}
                </div>
                {preheader && (
                  <div className="text-xs italic text-muted-foreground">
                    {renderPreviewValue(preheader)}
                  </div>
                )}
              </div>

              <div className="rounded-b-lg border border-border bg-card px-6 py-6">
                <div className="text-sm leading-relaxed text-foreground/90">
                  {renderFormattedPreview(body, previewVariables)}
                </div>

                <Separator className="my-6" />

                <div className="text-center text-xs text-muted-foreground">
                  <p>
                    {renderPreviewValue(
                      normalizeSupportEmailFooterTemplate(
                        email.footer,
                        DEFAULT_APP_EMAIL_SETTINGS.footer,
                      ),
                    )}
                  </p>
                  {(t?.includeUnsubscribe ?? true) && (
                    <p className="mt-2 underline">Unsubscribe</p>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-3">
                <p className="text-center text-xs text-muted-foreground">
                  This is a preview with sample data. Merge variables like{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                    {"{{attendee_name}}"}
                  </code>{" "}
                  will be replaced with real data when sent.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
