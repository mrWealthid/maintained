import type { AxiosRequestConfig } from "axios";
import { http } from "@/services/http";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB
export const MAX_DOC_SIZE = 25 * 1024 * 1024; // 25 MB

const IMG = /^image\//;
const VID = /^video\//;

const DOC_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const DOC_EXTS = new Set(["pdf", "doc", "docx"]);

function getFileExt(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// If you plan to support documents on Cloudinary, add 'raw' and a preset.
export type MediaType = "image" | "video" | "raw";

export type UploadOptions = {
  cloudName: string;
  presets: { image: string; video: string; raw: string };
  cache?: Record<string, string>; // cacheKey -> url
  onProgress?: (fileName: string, percent: number) => void;
  axiosConfig?: AxiosRequestConfig;
};

export type UploadResult = {
  urls: Record<string, string>; // filename -> url
  errors: Record<string, Error>; // filename -> error
};

// If you want inferSingleType to also accept File[], this overload helps.
type Bucket = "images" | "videos" | "documents";

export function inferSingleType(files: FileList | File[]): Bucket | null {
  // Narrow union to a concrete File[]
  const arr: File[] = Array.isArray(files)
    ? files
    : Array.from(files as FileList);

  let hasImg = false,
    hasVid = false,
    hasDoc = false;

  for (const f of arr) {
    if (IMG.test(f.type)) hasImg = true;
    else if (VID.test(f.type)) hasVid = true;
    else if (DOC_MIMES.has(f.type) || DOC_EXTS.has(getFileExt(f.name)))
      hasDoc = true;
    else return null;

    if ((hasImg ? 1 : 0) + (hasVid ? 1 : 0) + (hasDoc ? 1 : 0) > 1) return null;
  }

  if (hasVid) return "videos";
  if (hasImg) return "images";
  if (hasDoc) return "documents";
  return null;
}

export function withinLimit(
  file: File,
  target: "images" | "videos" | "documents"
): boolean {
  if (target === "images") return file.size <= MAX_IMAGE_SIZE;
  if (target === "videos") return file.size <= MAX_VIDEO_SIZE;
  if (target === "documents") return file.size <= MAX_DOC_SIZE;
  return false; // Should not happen
}

/**
 * Batch upload (pure):
 * - Input is File[] (no FileList; avoids union/unknown pitfalls).
 * - Uses cache when provided (by strong cache key; falls back to filename).
 * - Uploads the rest in parallel and returns new maps (no side effects).
 */
export async function batchUpload(
  files: File[],
  type: MediaType,
  options: UploadOptions
): Promise<UploadResult> {
  const cache = options.cache ?? {};

  const urls: Record<string, string> = {};
  const errors: Record<string, Error> = {};
  const pending: Promise<void>[] = [];

  for (const file of files) {
    const key = cacheKeyOf(file);
    const cached = cache[key] ?? cache[file.name]; // keep backward-compat with name-only caches
    if (cached) {
      urls[file.name] = cached;
      continue;
    }

    pending.push(
      uploadOne(file, type, options)
        .then((url) => {
          urls[file.name] = url;
        })
        .catch((err) => {
          errors[file.name] =
            err instanceof Error ? err : new Error(String(err));
        })
    );
  }

  if (pending.length) {
    await Promise.all(pending);
  }

  return { urls, errors };
}

/** Strong cache key to avoid collisions on same names. */
function cacheKeyOf(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

/** Upload a single file to Cloudinary (pure). */
async function uploadOne(
  file: File,
  type: MediaType,
  { cloudName, presets, onProgress, axiosConfig }: UploadOptions
): Promise<string> {
  const formData = new FormData();
  formData.append(
    "upload_preset",
    presets[type] || presets.image // default to image preset if not specified
  );
  formData.append("file", file);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;

  const resp = await http.post(endpoint, formData, {
    ...axiosConfig,
    onUploadProgress: (evt) => {
      const total = evt.total ?? 1;
      const percent = Math.round((evt.loaded * 100) / total);
      onProgress?.(file.name, percent);
    },
  });

  return resp?.data?.secure_url || resp?.data?.url;
}

// Optional: tiny utility for date formatting
export function formatDate(d: string | number | Date) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "";
  }
}

/** Colored pill classes for status */
export function statusPillClasses(status?: string) {
  switch ((status || "").toUpperCase()) {
    case "PENDING":
    case "PENDING_ASSIGNMENT":
      return "bg-status-open text-status-open-foreground";
    case "PROCESSING":
    case "ASSIGNED":
      return "bg-status-progress text-status-progress-foreground";
    case "SCHEDULED":
      return "bg-primary text-primary-foreground";
    case "COMPLETED":
      return "bg-status-resolved text-status-resolved-foreground";
    case "DECLINED":
      return "bg-status-overdue text-status-overdue-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/** Colored pill classes for priority */
export function priorityPillClasses(priority?: string) {
  switch ((priority || "").toUpperCase()) {
    case "EMERGENCY":
      return "bg-status-overdue text-status-overdue-foreground";
    case "LOW":
      return "bg-muted text-muted-foreground";
    case "MEDIUM":
      return "bg-status-open text-status-open-foreground";
    case "HIGH":
    case "URGENT":
      return "bg-status-overdue text-status-overdue-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/** Detect presence of any attachments across common fields */
export function hasAnyFiles(t: any) {
  const pools = [
    t?.attachments,
    t?.files,
    t?.media,
    t?.images,
    t?.videos,
    t?.documents,
  ];
  return pools.some((arr: any) =>
    Array.isArray(arr) ? arr.length > 0 : !!arr
  );
}
