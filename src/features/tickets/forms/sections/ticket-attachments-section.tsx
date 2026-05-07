"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FileText,
  Image as ImageIcon,
  Paperclip,
  Video,
} from "lucide-react";

import { cn } from "@/lib/utils";
import FileUpload from "@/shared/components/form-elements/File-Upload";
import type { TicketCreateFormValues } from "../../models/ticket-form.model";
import { TicketFormSectionCard } from "./ticket-form-section-card";

export type ExistingTicketAsset = {
  url: string;
  type: string;
  id?: string | number;
};

export function TicketAttachmentsSection({
  disabled,
  uploadProgress,
  initialImages,
  initialVideos,
  initialDocuments,
  onRemoveInitialAsset,
}: {
  disabled?: boolean;
  uploadProgress: Record<string, number>;
  initialImages: ExistingTicketAsset[];
  initialVideos: ExistingTicketAsset[];
  initialDocuments: ExistingTicketAsset[];
  onRemoveInitialAsset: (
    file: ExistingTicketAsset,
    resourceType: "image" | "video" | "raw",
  ) => void;
}) {
  const { setValue } = useFormContext<TicketCreateFormValues>();

  function setAttachmentValue(
    field: "images" | "videos" | "documents",
    files: File[],
  ) {
    setValue(field, files.length > 0 ? files : null, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  }

  return (
    <TicketFormSectionCard
      step={4}
      icon={<Paperclip className="h-4 w-4" />}
      title="Attachments"
      subtitle="Photos, videos, or documents that help describe the issue"
    >
      <div className="grid gap-4 xl:grid-cols-3">
        <TicketAttachmentField
          id="ticket-images"
          label="Images"
          hint="PNG, JPG, WEBP up to 10 MB each"
          accept="image/*"
          resourceType="image"
          icon={<ImageIcon className="h-3.5 w-3.5" />}
          disabled={disabled}
          uploadProgress={uploadProgress}
          initialFiles={initialImages}
          onFilesChange={(files) => setAttachmentValue("images", files)}
          onRemoveInitialFile={onRemoveInitialAsset}
        />
        <TicketAttachmentField
          id="ticket-videos"
          label="Videos"
          hint="MP4, MOV up to 50 MB each"
          accept="video/*"
          resourceType="video"
          icon={<Video className="h-3.5 w-3.5" />}
          disabled={disabled}
          uploadProgress={uploadProgress}
          initialFiles={initialVideos}
          onFilesChange={(files) => setAttachmentValue("videos", files)}
          onRemoveInitialFile={onRemoveInitialAsset}
        />
        <TicketAttachmentField
          id="ticket-documents"
          label="Documents"
          hint="PDF, DOC, TXT, CSV up to 20 MB each"
          accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,application/pdf,text/plain"
          resourceType="raw"
          icon={<FileText className="h-3.5 w-3.5" />}
          disabled={disabled}
          uploadProgress={uploadProgress}
          initialFiles={initialDocuments}
          onFilesChange={(files) => setAttachmentValue("documents", files)}
          onRemoveInitialFile={onRemoveInitialAsset}
        />
      </div>
    </TicketFormSectionCard>
  );
}

function TicketAttachmentField({
  id,
  label,
  hint,
  accept,
  resourceType,
  icon,
  disabled,
  uploadProgress,
  initialFiles,
  onFilesChange,
  onRemoveInitialFile,
}: {
  id: string;
  label: string;
  hint: string;
  accept: string;
  resourceType: "image" | "video" | "raw";
  icon: React.ReactNode;
  disabled?: boolean;
  uploadProgress: Record<string, number>;
  initialFiles: ExistingTicketAsset[];
  onFilesChange: (files: File[]) => void;
  onRemoveInitialFile: (
    file: ExistingTicketAsset,
    resourceType: "image" | "video" | "raw",
  ) => void;
}) {
  return (
    <div className={cn(disabled && "pointer-events-none opacity-60")}>
      <FileUpload
        id={id}
        label={label}
        hint={hint}
        accept={accept}
        resourceType={resourceType}
        multiple
        icon={icon}
        uploadProgress={uploadProgress}
        initialFiles={initialFiles}
        onFilesChange={onFilesChange}
        onRemoveInitialFile={onRemoveInitialFile}
      />
    </div>
  );
}
