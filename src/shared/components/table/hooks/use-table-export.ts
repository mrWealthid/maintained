"use client";

import { useMutation } from "@tanstack/react-query";
import type { TablePdfExportRequest } from "../models/table-export.model";
import { downloadTablePdf } from "../services/table-export-service";

export function useTableExport() {
  return useMutation({
    mutationFn: (args: {
      payload: TablePdfExportRequest;
      onProgress?: (percent: number | null) => void;
    }) => downloadTablePdf(args),
  });
}
