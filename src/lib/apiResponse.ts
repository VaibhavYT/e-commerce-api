import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { ApiError } from "@/utils/apiError";

export const apiSuccess = (data: any, status = 200) => {
  // Log success at debug level (avoid verbose in production)
  logger.debug("apiSuccess", { status, data });
  return NextResponse.json({ success: true, data }, { status });
};

export const apiError = (err: unknown) => {
  // map unknown errors to ApiError
  let errorObj: ApiError;

  if (err instanceof ApiError) {
    errorObj = err;
  } else if (err instanceof Error) {
    // Non-ApiError: don't leak stack to client, but log stack
    logger.error("UnhandledError", {
      message: err.message,
      stack: (err as Error).stack,
    });
    errorObj = ApiError.internal("Internal Server Error");
  } else {
    logger.error("UnknownError", { error: err });
    errorObj = ApiError.internal("Internal Server Error");
  }

  const payload = {
    success: false,
    error: {
      message: errorObj.message,
      code: errorObj.code ?? null,
    },
  };

  // Log at appropriate level
  const logLevel = errorObj.status >= 500 ? "error" : "warn";
  logger.log(logLevel, "apiError", {
    status: errorObj.status,
    code: errorObj.code,
    message: errorObj.message,
    details: errorObj.details ?? null,
  });

  return NextResponse.json(payload, { status: errorObj.status });
};
