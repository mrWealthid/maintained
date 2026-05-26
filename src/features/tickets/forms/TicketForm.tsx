"use client";

import { useMemo, useState, type FC } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import type { ManageTicketFormProps } from "../models/ticket.model";
import type { TicketCreateFormValues } from "../models/ticket-form.model";
import type { CreateTicketPayload } from "@/shared/model/model";
import { batchUpload } from "../helpers/helpers";
import {
  TicketAttachmentsSection,
  TicketDetailsSection,
  TicketLocationTypeSection,
  TicketRelatedTicketSection,
  TicketSubmitActions,
  type ExistingTicketAsset,
} from "./TicketFormSections";

type MediaType = "image" | "video" | "raw";

const CLOUDINARY_PRESETS = {
  image: process.env.IMG_PRESET!,
  video: process.env.VIDEO_PRESET!,
  raw: process.env.DOCUMENT_PRESET!,
};

const TicketForm: FC<ManageTicketFormProps> = ({
  ticket,
  formId,
  showActions = true,
  showPropertyUnitFields = false,
  onCancel,
  onSubmit,
}) => {
  const router = useRouter();
  const isEditing = Boolean(ticket?.id);
  const {
    handleSubmit,
    getValues,
    setValue,
    formState: { isDirty, isValid },
  } = useFormContext<TicketCreateFormValues>();

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadResults, setUploadResults] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingImages, setRemainingImages] = useState<ExistingTicketAsset[]>(
    () => toExistingAssets(ticket?.images, "image/"),
  );
  const [remainingVideos, setRemainingVideos] = useState<ExistingTicketAsset[]>(
    () => toExistingAssets(ticket?.videos, "video/"),
  );
  const [remainingDocuments, setRemainingDocuments] = useState<
    ExistingTicketAsset[]
  >(() => toExistingAssets(ticket?.documents, "application/pdf"));

  const initialCategory = useMemo(() => {
    return typeof ticket?.category === "object" ? ticket.category : undefined;
  }, [ticket?.category]);
  const busy = isUploading || isSubmitting;

  async function uploadFiles(
    files: File[] | null | undefined,
    resourceType: MediaType,
  ) {
    if (!files?.length) return [];

    setIsUploading(true);
    try {
      const { urls, errors } = await batchUpload(files, resourceType, {
        cloudName: process.env.CLOUDINARY_NAME!,
        presets: CLOUDINARY_PRESETS,
        cache: uploadResults,
        onProgress: (fileName, percent) =>
          setUploadProgress((current) => ({ ...current, [fileName]: percent })),
        axiosConfig: { timeout: 60_000 },
      });

      setUploadResults((current) => ({ ...current, ...urls }));

      const failed = Object.keys(errors);
      if (failed.length) {
        toast.error(`Some files failed to upload: ${failed.join(", ")}`);
      }

      return files
        .map((file) => urls[file.name])
        .filter((url): url is string => Boolean(url));
    } finally {
      setIsUploading(false);
    }
  }

  async function formSubmit(data: TicketCreateFormValues) {
    setIsSubmitting(true);

    try {
      const { images, videos, documents } = getValues();
      const [imageUrls, videoUrls, documentUrls] = await Promise.all([
        uploadFiles(images, "image"),
        uploadFiles(videos, "video"),
        uploadFiles(documents, "raw"),
      ]);

      onSubmit(buildPayload(data, imageUrls, videoUrls, documentUrls), {
        onSuccess() {
          setIsSubmitting(false);
        },
        onError() {
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      console.error("Submit failed:", error);
      setIsSubmitting(false);
    }
  }

  function buildPayload(
    data: TicketCreateFormValues,
    imageUrls: string[],
    videoUrls: string[],
    documentUrls: string[],
  ): CreateTicketPayload {
    return {
      ...data,
      relatedTo: data.relatedTo || undefined,
      images: [...remainingImages.map((file) => file.url), ...imageUrls],
      videos: [...remainingVideos.map((file) => file.url), ...videoUrls],
      documents: [
        ...remainingDocuments.map((file) => file.url),
        ...documentUrls,
      ],
      ...(isEditing && { status: ticket?.status }),
    };
  }

  async function handleRemoveInitialAsset(
    file: ExistingTicketAsset,
    resourceType: MediaType,
  ) {
    const publicId = getCloudinaryPublicId(file.url);

    try {
      await fetch("/api/cloudinary", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, resourceType }),
      });

      if (resourceType === "image") {
        setRemainingImages((current) =>
          current.filter((item) => item.url !== file.url),
        );
        setValue("images", getValues("images") ?? null, { shouldDirty: true });
      } else if (resourceType === "video") {
        setRemainingVideos((current) =>
          current.filter((item) => item.url !== file.url),
        );
        setValue("videos", getValues("videos") ?? null, { shouldDirty: true });
      } else {
        setRemainingDocuments((current) =>
          current.filter((item) => item.url !== file.url),
        );
        setValue("documents", getValues("documents") ?? null, {
          shouldDirty: true,
        });
      }

      toast.success("Attachment removed");
    } catch (error) {
      toast.error(`Failed to delete attachment ${error}`);
    }
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(formSubmit, (error) => console.log(error))}
      className="w-full"
      noValidate
    >
      <div className="space-y-5">
        <TicketDetailsSection disabled={busy} initialCategory={initialCategory} />
        <TicketLocationTypeSection
          disabled={busy}
          showPropertyUnitFields={showPropertyUnitFields}
        />
        <TicketRelatedTicketSection
          disabled={busy}
          currentTicketId={ticket?.id}
        />
        <TicketAttachmentsSection
          disabled={busy}
          uploadProgress={uploadProgress}
          initialImages={remainingImages}
          initialVideos={remainingVideos}
          initialDocuments={remainingDocuments}
          onRemoveInitialAsset={handleRemoveInitialAsset}
        />
        {showActions ? (
          <TicketSubmitActions
            isEditing={isEditing}
            isSubmitting={busy}
            isValid={isValid}
            isDirty={isDirty}
            onCancel={onCancel ?? (() => router.back())}
          />
        ) : null}
      </div>
    </form>
  );
};

function toExistingAssets(urls: string[] | undefined, type: string) {
  return (urls ?? []).map((url) => ({
    url,
    type,
    id: url,
  }));
}

function getCloudinaryPublicId(url: string) {
  const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return matches ? matches[1] : "";
}

export default TicketForm;
