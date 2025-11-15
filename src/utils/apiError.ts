export type ErrorPayload = {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
};

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;
  constructor(payload: ErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status ?? 500;
    this.code = payload.code;
    this.details = payload.details;
    // maintain proper stack trace
    if (Error.captureStackTrace) Error.captureStackTrace(this, ApiError);
  }
  static badRequest(message = "Bad Request", details?: unknown) {
    return new ApiError({ message, status: 400, code: "BAD_REQUEST", details });
  }

  static unauthorized(message = "Unauthorized", details?: unknown) {
    return new ApiError({
      message,
      status: 401,
      code: "UNAUTHORIZED",
      details,
    });
  }

  static forbidden(message = "Forbidden", details?: unknown) {
    return new ApiError({ message, status: 403, code: "FORBIDDEN", details });
  }

  static notFound(message = "Not Found", details?: unknown) {
    return new ApiError({ message, status: 404, code: "NOT_FOUND", details });
  }

  static conflict(message = "Conflict", details?: unknown) {
    return new ApiError({ message, status: 409, code: "CONFLICT", details });
  }

  static internal(message = "Internal Server Error", details?: unknown) {
    return new ApiError({
      message,
      status: 500,
      code: "INTERNAL_ERROR",
      details,
    });
  }
}
