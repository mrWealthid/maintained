import type { AxiosProgressEvent } from "axios";
import { http } from "@/services/http";
import { ApiErrorHandler } from "@/utils/apiError";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import type { TablePdfExportRequest } from "../models/table-export.model";
import { getDownloadProgressPercent } from "@/shared/lib/resource-download";

export async function downloadTablePdf(
  args: {
    payload: TablePdfExportRequest;
    onProgress?: (percent: number | null) => void;
  },
): Promise<Blob> {
  try {
    const { data } = await http.post(
      API_ROUTES.dashboard.exports.table,
      args.payload,
      {
        responseType: "blob",
        onDownloadProgress: (event: AxiosProgressEvent) => {
          args.onProgress?.(getDownloadProgressPercent(event));
        },
      },
    );
    return data as Blob;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
