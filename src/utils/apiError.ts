import axios, { AxiosError } from "axios";

/* ------------------------------------------------------------------ */
/*  Types — keep in sync with src/lib/errors/apiError.ts (server)      */
/* ------------------------------------------------------------------ */

export type ValidationIssue = {
  path: (string | number)[];
  message: string;
  code?: string;
  expected?: string;
  received?: string;
  field?: string;
};

export type ApiErrorBody<T = unknown> = {
  ok: false;
  name: string;
  message: string;
  status: number;
  code: string;
  kind: string;
  issues?: ValidationIssue[];
  details?: T;
  requestId?: string;
  timestamp: string;
};

/**
 * UI-friendly structured error for the ErrorList component:
 * - ApiErrorBody
 * - { message, issues?, requestId?, status?, code?, timestamp? }
 */
export type UIError = {
  message: string;
  issues?: ValidationIssue[];
  requestId?: string;
  status?: number;
  code?: string;
  timestamp?: string;
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isApiErrorBody(x: unknown): x is ApiErrorBody {
  if (!isRecord(x)) return false;
  return (
    x.ok === false &&
    typeof x.message === "string" &&
    typeof x.status === "number" &&
    typeof x.code === "string" &&
    typeof x.kind === "string"
  );
}

function formatIssue(issue: ValidationIssue): string {
  const field =
    issue.field ||
    (issue.path?.length
      ? String(issue.path[issue.path.length - 1])
      : undefined);

  const path = issue.path?.length ? issue.path.join(".") : undefined;

  const head = field ?? path ?? "Issue";
  const tail = issue.message;

  const extras: string[] = [];
  if (issue.code) extras.push(issue.code);
  if (issue.expected) extras.push(`expected ${issue.expected}`);
  if (issue.received) extras.push(`received ${issue.received}`);

  const extraText = extras.length ? ` (${extras.join(", ")})` : "";

  if (field && path && path !== field) {
    return `${head} (${path}): ${tail}${extraText}`;
  }
  return `${head}: ${tail}${extraText}`;
}

function joinIssues(
  issues: ValidationIssue[] | undefined,
  opts?: { max?: number; multiline?: boolean },
): string | undefined {
  if (!issues?.length) return undefined;

  const max = opts?.max ?? 6;
  const multiline = opts?.multiline ?? true;

  const sliced = issues.slice(0, max);
  const lines = sliced.map((i) =>
    multiline ? `- ${formatIssue(i)}` : formatIssue(i),
  );

  const more = issues.length > max ? `(+${issues.length - max} more)` : "";
  if (multiline) {
    return `\n${lines.join("\n")}${more ? `\n${more}` : ""}`;
  }
  return `${lines.join("; ")}${more ? `; ${more}` : ""}`;
}

export class ApiErrorHandler {
  /**
   * User-facing message string. Backward-compatible with the previous
   * `.parse(error)` signature; now also appends issues when present.
   */
  static parse(
    error: unknown,
    options?: {
      includeIssues?: boolean;
      maxIssues?: number;
      multilineIssues?: boolean;
      includeRequestId?: boolean;
    },
  ): string {
    const includeIssues = options?.includeIssues ?? true;
    const maxIssues = options?.maxIssues ?? 6;
    const multilineIssues = options?.multilineIssues ?? true;
    const includeRequestId = options?.includeRequestId ?? false;

    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError;
      const data = axiosErr.response?.data;

      if (isApiErrorBody(data)) {
        const base = data.message || "Request failed";
        const issuesText = includeIssues
          ? joinIssues(data.issues, {
              max: maxIssues,
              multiline: multilineIssues,
            })
          : undefined;
        const requestIdText =
          includeRequestId && data.requestId
            ? `\nRequest ID: ${data.requestId}`
            : "";
        return `${base}${issuesText ?? ""}${requestIdText}`;
      }

      if (isRecord(data)) {
        const msg =
          (typeof data.message === "string" && data.message) ||
          (typeof data.error === "string" && data.error) ||
          axiosErr.response?.statusText ||
          axiosErr.message ||
          "Request failed";

        const issuesMaybe = (data.issues as unknown) ?? undefined;
        const issuesText =
          includeIssues && Array.isArray(issuesMaybe)
            ? joinIssues(issuesMaybe as ValidationIssue[], {
                max: maxIssues,
                multiline: multilineIssues,
              })
            : undefined;

        return `${msg}${issuesText ?? ""}`;
      }

      return (
        axiosErr.response?.statusText ||
        axiosErr.message ||
        "A network error occurred."
      );
    }

    if (error instanceof Error) return `Error: ${error.message}`;
    return "An unexpected error occurred.";
  }

  /**
   * Structured details for UI rendering. Matches what <ErrorList /> expects.
   */
  static extract(error: unknown): UIError {
    const anyErr = error as Record<string, unknown>;

    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError;
      const data = axiosErr.response?.data;

      if (isApiErrorBody(data)) {
        return {
          message: data.message || "Request failed",
          issues: data.issues,
          requestId: data.requestId,
          status: data.status,
          code: data.code,
          timestamp: data.timestamp,
        };
      }

      if (isRecord(data)) {
        const msg =
          (typeof data.message === "string" && data.message) ||
          (typeof data.error === "string" && data.error) ||
          axiosErr.response?.statusText ||
          axiosErr.message ||
          "Request failed";

        const issuesMaybe = (data.issues as unknown) ?? undefined;

        return {
          message: msg,
          issues: Array.isArray(issuesMaybe)
            ? (issuesMaybe as ValidationIssue[])
            : undefined,
          requestId:
            typeof data.requestId === "string" ? data.requestId : undefined,
          status:
            typeof data.status === "number"
              ? (data.status as number)
              : axiosErr.response?.status,
          code:
            typeof data.code === "string" ? (data.code as string) : undefined,
          timestamp:
            typeof data.timestamp === "string"
              ? (data.timestamp as string)
              : undefined,
        };
      }

      return { message: axiosErr.message || "A network error occurred." };
    }

    if (isApiErrorBody(error)) {
      return {
        message: error.message || "Request failed",
        issues: error.issues,
        requestId: error.requestId,
        status: error.status,
        code: error.code,
        timestamp: error.timestamp,
      };
    }

    if (isRecord(error)) {
      const msg =
        (typeof anyErr.message === "string" && anyErr.message) ||
        (typeof anyErr.error === "string" && anyErr.error) ||
        "An error occurred";

      const issuesMaybe = anyErr.issues ?? undefined;

      return {
        message: msg,
        issues: Array.isArray(issuesMaybe)
          ? (issuesMaybe as ValidationIssue[])
          : undefined,
        requestId:
          typeof anyErr.requestId === "string" ? anyErr.requestId : undefined,
        status: typeof anyErr.status === "number" ? anyErr.status : undefined,
        code: typeof anyErr.code === "string" ? anyErr.code : undefined,
        timestamp:
          typeof anyErr.timestamp === "string" ? anyErr.timestamp : undefined,
      };
    }

    if (error instanceof Error) return { message: error.message };
    return { message: "An unexpected error occurred." };
  }

  /**
   * Use in service catch blocks so issues/requestId/etc. are preserved
   * for UI consumption:
   *   catch (err) { throw ApiErrorHandler.toUIError(err); }
   */
  static toUIError(error: unknown): UIError {
    return ApiErrorHandler.extract(error);
  }
}
