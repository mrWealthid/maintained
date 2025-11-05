import axios, { AxiosRequestConfig } from "axios";

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

  const resp = await axios.post(endpoint, formData, {
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
      return "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100";
    case "PROCESSING":
      return "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100";
    case "ASSIGNED":
      return "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100";
    case "SCHEDULED":
      return "bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100";
    case "COMPLETED":
      return "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100";
    case "DECLINED":
      return "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100";
    default:
      return "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100";
  }
}

/** Colored pill classes for priority */
export function priorityPillClasses(priority?: string) {
  switch ((priority || "").toUpperCase()) {
    case "LOW":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100";
    case "MEDIUM":
      return "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100";
    case "HIGH":
      return "bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100";
    case "URGENT":
      return "bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-100";
    default:
      return "bg-muted text-foreground";
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
