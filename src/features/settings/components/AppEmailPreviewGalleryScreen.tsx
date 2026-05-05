"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import {
  DEFAULT_APP_EMAIL_SETTINGS,
  DEFAULT_APP_EMAIL_TEMPLATES,
} from "@/lib/email/defaults/default-app-email-template";
import { getAppEmailTemplatePreviewConfig } from "@/lib/email/email-template-preview";
import { normalizeSupportEmailFooterTemplate } from "@/lib/email/helpers/support-email";

import type { AppSettingsFormValues } from "../models/app-settings-form.model";
import {
  getAppEmailSettingsGroupsWithIcons,
  type AppEmailSettingsTemplateMeta,
} from "../data/email-template-registry-ui";
import { replaceMergeVars } from "../helpers/helper";
import { EmailTemplatePreviewGallery } from "./EmailTemplatePreviewGallery";

export function AppEmailPreviewGalleryScreen({
  onBack,
  onEditTemplate,
}: {
  onBack: () => void;
  onEditTemplate: (template: AppEmailSettingsTemplateMeta) => void;
}) {
  const { watch } = useFormContext<AppSettingsFormValues>();
  const email = watch("settings.email");
  const footerText = useMemo(
    () =>
      replaceMergeVars(
        normalizeSupportEmailFooterTemplate(
          email.footer?.trim(),
          DEFAULT_APP_EMAIL_SETTINGS.footer,
        ),
        {
          support_email:
            email.replyTo?.trim() || email.senderEmail?.trim() || undefined,
        },
      ),
    [email.footer, email.replyTo, email.senderEmail],
  );

  const groups = useMemo(
    () =>
      getAppEmailSettingsGroupsWithIcons().map((group) => ({
        ...group,
        templates: group.templates.map((template) => {
          const currentTemplate = email.templates?.[template.key];
          const defaults = DEFAULT_APP_EMAIL_TEMPLATES[template.key];

          return {
            template,
            enabled: currentTemplate?.enabled ?? false,
            subject: currentTemplate?.subject ?? defaults.subject,
            preheader: currentTemplate?.preheader ?? defaults.preheader,
            body: currentTemplate?.body ?? defaults.body,
            includeUnsubscribe:
              currentTemplate?.includeUnsubscribe ??
              defaults.includeUnsubscribe ??
              false,
            previewVariables: getAppEmailTemplatePreviewConfig(template.key, {
              app_name: email.senderName?.trim() || undefined,
              support_email:
                currentTemplate?.replyToOverride?.trim() ||
                email.replyTo?.trim() ||
                email.senderEmail?.trim() ||
                undefined,
            }).variables,
          };
        }),
      })),
    [email],
  );

  return (
    <EmailTemplatePreviewGallery
      title="App Email Preview Gallery"
      description="Review every platform-level email with shared sample data before tweaking individual templates."
      groups={groups}
      senderName={email.senderName || "Maintainly"}
      senderEmail={email.senderEmail || "no-reply@maintainly.app"}
      footerText={footerText || undefined}
      footerNote={
        footerText ? undefined : "No custom app footer text is configured yet."
      }
      onBack={onBack}
      onEditTemplate={onEditTemplate}
    />
  );
}
