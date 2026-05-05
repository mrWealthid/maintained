"use client";

import { useState } from "react";

import { AppEmailPreviewGalleryScreen } from "./AppEmailPreviewGalleryScreen";
import { AppEmailSection } from "./AppEmailSection";
import { AppEmailTemplateEditorScreen } from "./AppEmailTemplateEditorScreen";
import type { AppEmailSettingsTemplateMeta } from "../data/email-template-registry-ui";

export default function AppSettingsEmailFlowWrapper() {
  const [view, setView] = useState<
    | { mode: "list" }
    | { mode: "gallery" }
    | {
        mode: "edit";
        template: AppEmailSettingsTemplateMeta;
        returnTo: "list" | "gallery";
      }
  >({ mode: "list" });

  if (view.mode === "edit") {
    return (
      <AppEmailTemplateEditorScreen
        template={view.template}
        onBack={() =>
          setView(
            view.returnTo === "gallery" ? { mode: "gallery" } : { mode: "list" },
          )
        }
      />
    );
  }

  if (view.mode === "gallery") {
    return (
      <AppEmailPreviewGalleryScreen
        onBack={() => setView({ mode: "list" })}
        onEditTemplate={(template) =>
          setView({ mode: "edit", template, returnTo: "gallery" })
        }
      />
    );
  }

  return (
    <AppEmailSection
      onEditTemplate={(template) =>
        setView({ mode: "edit", template, returnTo: "list" })
      }
      onOpenGallery={() => setView({ mode: "gallery" })}
    />
  );
}
