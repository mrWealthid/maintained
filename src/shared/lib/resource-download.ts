import type { AxiosProgressEvent } from "axios";
import { toast } from "sonner";

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export function getDownloadProgressPercent(
  event: AxiosProgressEvent,
): number | null {
  const total = event.total;

  if (!total || total <= 0) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round((event.loaded / total) * 100)));
}

export function createProgressToast(loadingMessage: string) {
  const toastId = toast.loading(loadingMessage);
  let lastProgressPercent: number | null = null;

  return {
    id: toastId,
    updateProgress(percent: number | null) {
      if (percent == null || percent === lastProgressPercent) {
        return;
      }

      lastProgressPercent = percent;
      toast.loading(`${loadingMessage} ${percent}%`, {
        id: toastId,
      });
    },
    success(message: string) {
      toast.success(message, { id: toastId });
    },
    error(message: string) {
      toast.error(message, { id: toastId });
    },
  };
}
