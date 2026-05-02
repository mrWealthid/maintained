// lib/errors/apiError.ts
import { NextResponse } from "next/server";
import type { ZodError, ZodIssue } from "zod";

// ---- Error taxonomy ---------------------------------------------------------

export type ErrorKind =
  | "BadRequest"
  | "Unauthorized"
  | "Forbidden"
  | "NotFound"
  | "Conflict"
  | "TooManyRequests"
  | "Validation"
  | "Database"
  | "Internal"
  | "ServiceUnavailable";

export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "TOO_MANY_REQUESTS"
  | "VALIDATION_FAILED"
  | "DB_VALIDATION_FAILED"
  | "DB_DUPLICATE_KEY"
  | "DB_CAST_ERROR"
  | "DB_ERROR"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

export type ValidationIssue = {
  path: (string | number)[];
  message: string;
  code?: string;
  expected?: string;
  received?: string;
  field?: string;
};

export interface ApiErrorBody<T = unknown> {
  ok: false;
  name: string;
  message: string;
  status: number;
  code: ErrorCode;
  kind: ErrorKind;
  issues?: ValidationIssue[];
  details?: T;
  requestId?: string;
  timestamp: string;
}

export class ApiError<TDetails = unknown> extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly kind: ErrorKind;
  public readonly issues?: ValidationIssue[];
  public readonly details?: TDetails;
  public readonly isTrusted: boolean;

  constructor(args: {
    message: string;
    status: number;
    code: ErrorCode;
    kind: ErrorKind;
    issues?: ValidationIssue[];
    details?: TDetails;
    cause?: unknown;
    isTrusted?: boolean;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.code = args.code;
    this.kind = args.kind;
    this.issues = args.issues;
    this.details = args.details;
    this.isTrusted = args.isTrusted ?? true;

    if (args.cause) {
      this.cause = args.cause;
    }
    Error.captureStackTrace?.(this, ApiError);
  }

  toJSON(requestId?: string): ApiErrorBody<TDetails> {
    return {
      ok: false,
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      kind: this.kind,
      issues: this.issues,
      details: this.details,
      requestId,
      timestamp: new Date().toISOString(),
    };
  }

  toNextResponse(requestId?: string) {
    return NextResponse.json(this.toJSON(requestId), { status: this.status });
  }

  static badRequest(message = "Bad request", details?: unknown) {
    return new ApiError({
      message,
      status: 400,
      code: "BAD_REQUEST",
      kind: "BadRequest",
      details,
    });
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError({
      message,
      status: 401,
      code: "UNAUTHORIZED",
      kind: "Unauthorized",
    });
  }

  static forbidden(message = "Forbidden") {
    return new ApiError({
      message,
      status: 403,
      code: "FORBIDDEN",
      kind: "Forbidden",
    });
  }

  static notFound(message = "Not found") {
    return new ApiError({
      message,
      status: 404,
      code: "NOT_FOUND",
      kind: "NotFound",
    });
  }

  static conflict(message = "Conflict", details?: unknown) {
    return new ApiError({
      message,
      status: 409,
      code: "CONFLICT",
      kind: "Conflict",
      details,
    });
  }

  static tooMany(message = "Too many requests") {
    return new ApiError({
      message,
      status: 429,
      code: "TOO_MANY_REQUESTS",
      kind: "TooManyRequests",
    });
  }

  static internal(message = "Internal server error", cause?: unknown) {
    return new ApiError({
      message,
      status: 500,
      code: "INTERNAL_ERROR",
      kind: "Internal",
      cause,
      isTrusted: false,
    });
  }

  static unavailable(message = "Service unavailable") {
    return new ApiError({
      message,
      status: 503,
      code: "SERVICE_UNAVAILABLE",
      kind: "ServiceUnavailable",
    });
  }
}

// ---- Normalizers -------------------------------------------------------------

export function fromZodError(err: ZodError): ApiError {
  const issues: ValidationIssue[] = err.issues.map((i: ZodIssue) => ({
    path: i.path as (string | number)[],
    message: i.message,
    code: i.code,
    field: i.path?.[i.path.length - 1]?.toString(),
  }));

  return new ApiError({
    message: "Validation failed",
    status: 422,
    code: "VALIDATION_FAILED",
    kind: "Validation",
    issues,
    details: { issueCount: issues.length },
  });
}

type AnyMongo =
  | import("mongoose").Error
  | import("mongoose").Error.ValidationError
  | import("mongoose").Error.CastError
  | (Error & {
      code?: number;
      keyPattern?: Record<string, number>;
      keyValue?: Record<string, unknown>;
    });

const isMongooseValidation = (
  e: unknown,
): e is import("mongoose").Error.ValidationError =>
  !!e &&
  typeof e === "object" &&
  "name" in e &&
  (e as { name?: unknown }).name === "ValidationError";

const isMongooseCast = (e: unknown): e is import("mongoose").Error.CastError =>
  !!e &&
  typeof e === "object" &&
  "name" in e &&
  (e as { name?: unknown }).name === "CastError";

const isMongoDuplicateKey = (
  e: unknown,
): e is AnyMongo & {
  code: number;
  keyPattern?: Record<string, number>;
  keyValue?: Record<string, unknown>;
} =>
  !!e &&
  typeof e === "object" &&
  "code" in e &&
  (e as { code?: unknown }).code === 11000;

export function fromMongooseError(err: AnyMongo): ApiError {
  if (isMongoDuplicateKey(err)) {
    const keys = Object.keys(
      (err as { keyPattern?: Record<string, number> }).keyPattern ?? {},
    );
    const issues: ValidationIssue[] = keys.map((k) => ({
      path: [k],
      field: k,
      message: "Duplicate value",
      code: "duplicate",
    }));
    return new ApiError({
      message: "Duplicate key",
      status: 409,
      code: "DB_DUPLICATE_KEY",
      kind: "Conflict",
      issues,
      details: { keys, keyValue: err.keyValue },
    });
  }

  if (isMongooseValidation(err)) {
    const issues: ValidationIssue[] = Object.values(err.errors ?? {}).map(
      (e) => ({
        path: [e.path].filter(Boolean),
        field: e.path,
        message: e.message,
        code: e.kind ?? e.name,
      }),
    );

    return new ApiError({
      message: "Database validation failed",
      status: 422,
      code: "DB_VALIDATION_FAILED",
      kind: "Validation",
      issues,
    });
  }

  if (isMongooseCast(err)) {
    const field = err.path ?? err.stringValue;
    const issues: ValidationIssue[] = [
      {
        path: [field].filter(Boolean),
        field,
        message: "Invalid identifier/format",
        code: "cast_error",
        expected: err.kind,
        received: err.value?.toString?.(),
      },
    ];
    return new ApiError({
      message: "Failed to cast value",
      status: 400,
      code: "DB_CAST_ERROR",
      kind: "BadRequest",
      issues,
    });
  }

  return new ApiError({
    message: err.message || "Database error",
    status: 500,
    code: "DB_ERROR",
    kind: "Database",
    details: { name: err.name },
  });
}

export function normalizeError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;

  if (
    typeof e === "object" &&
    e !== null &&
    "name" in e &&
    e.name === "ZodError"
  ) {
    return fromZodError(e as ZodError);
  }

  if (
    typeof e === "object" &&
    e !== null &&
    "name" in e &&
    typeof (e as { name?: unknown }).name === "string"
  ) {
    const name = (e as { name: string }).name;
    if (
      name === "ValidationError" ||
      name === "CastError" ||
      name.startsWith("Mongo") ||
      name.startsWith("Mongoose")
    ) {
      return fromMongooseError(e as AnyMongo);
    }
  }

  if (e instanceof Error) {
    return ApiError.internal(e.message, e);
  }

  return ApiError.internal("Unknown error", { value: e });
}

export function errorToNextResponse(err: unknown, requestId?: string | null) {
  return normalizeError(err).toNextResponse(requestId ?? undefined);
}

export function parseOrThrow<T>(
  schema: { parse: (x: unknown) => T },
  data: unknown,
): T {
  try {
    return schema.parse(data);
  } catch (e) {
    throw normalizeError(e);
  }
}
