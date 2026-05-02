import { z } from "zod";

export const TABLE_EXPORT_SCOPE = {
  CURRENT_PAGE: "current_page",
  ALL_FILTERED: "all_filtered",
} as const;
export const CERTIFIED_DOCUMENT_TYPE = {
  TABLE_EXPORT: "table_export",
  POST_EVENT_REPORT: "post_event_report",
  EXECUTIVE_OVERVIEW_REPORT: "executive_overview_report",
} as const;
export const TABLE_EXPORT_MAX_ROWS = 5000;

const TableExportCellSchema = z.string().max(2000);

export const TablePdfExportRequestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  scope: z.enum([
    TABLE_EXPORT_SCOPE.CURRENT_PAGE,
    TABLE_EXPORT_SCOPE.ALL_FILTERED,
  ]),
  headers: z.array(TableExportCellSchema).min(1).max(20),
  rows: z.array(z.array(TableExportCellSchema).max(20)).max(TABLE_EXPORT_MAX_ROWS),
  summary: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  exportedAt: z.string().datetime(),
});

export type TableExportScope =
  (typeof TABLE_EXPORT_SCOPE)[keyof typeof TABLE_EXPORT_SCOPE];
export type CertifiedDocumentType =
  (typeof CERTIFIED_DOCUMENT_TYPE)[keyof typeof CERTIFIED_DOCUMENT_TYPE];

export type TablePdfExportRequest = z.infer<typeof TablePdfExportRequestSchema>;

export type TablePdfExportCertificate = {
  platformName: string;
  platformLogoSrc: string;
  businessName: string;
  generatedAt: string;
  generatedAtLabel: string;
  generatedTimeZone: string;
  exportId: string;
  authenticityCode: string;
  fingerprint: string;
  fingerprintPreview: string;
  certifiedLabel: string;
  verificationUrl: string;
};

export type TablePdfExportDocument = TablePdfExportRequest & {
  certificate: TablePdfExportCertificate;
};

export const TableExportVerificationRequestSchema = z.object({
  exportId: z.string().trim().min(1).max(80),
  authenticityCode: z.string().trim().min(1).max(40),
});

export const TableExportVerificationResultSchema = z.object({
  exportId: z.string(),
  authenticityCode: z.string(),
  documentType: z.enum([
    CERTIFIED_DOCUMENT_TYPE.TABLE_EXPORT,
    CERTIFIED_DOCUMENT_TYPE.POST_EVENT_REPORT,
    CERTIFIED_DOCUMENT_TYPE.EXECUTIVE_OVERVIEW_REPORT,
  ]),
  title: z.string(),
  scope: z.enum([
    TABLE_EXPORT_SCOPE.CURRENT_PAGE,
    TABLE_EXPORT_SCOPE.ALL_FILTERED,
  ]),
  rowCount: z.number().int().min(0),
  headerCount: z.number().int().min(0),
  businessName: z.string(),
  platformName: z.string(),
  generatedAt: z.string().datetime(),
  generatedAtLabel: z.string(),
  generatedTimeZone: z.string(),
  fingerprintPreview: z.string(),
  summary: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  verificationCount: z.number().int().min(0),
  lastVerifiedAt: z.string().datetime().optional(),
});

export type TableExportVerificationRequest = z.infer<
  typeof TableExportVerificationRequestSchema
>;
export type TableExportVerificationResult = z.infer<
  typeof TableExportVerificationResultSchema
>;
