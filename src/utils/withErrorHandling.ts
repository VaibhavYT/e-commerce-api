// src/utils/withErrorHandling.ts
import type { NextRequest } from "next/server";
import { apiError } from "@/lib/apiResponse";
import { ApiError } from "./apiError";

// For routes without dynamic params
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async function (req: NextRequest) {
    try {
      return await handler(req);
    } catch (error: unknown) {
      return handleError(error);
    }
  };
}

// For routes with dynamic params
export function withErrorHandlingAndParams(
  handler: (req: NextRequest, context: { params: any }) => Promise<Response>
) {
  return async function (req: NextRequest, context: { params: any }) {
    try {
      return await handler(req, context);
    } catch (error: unknown) {
      return handleError(error);
    }
  };
}

// Shared error handling logic
function handleError(error: unknown): Response {
  // Handle Zod validation errors
  if (
    !(error instanceof ApiError) &&
    (error as any)?.message?.includes?.("Zod")
  ) {
    return apiError(ApiError.badRequest("Validation failed", { raw: error }));
  }

  // Handle Prisma unique constraint errors
  if (error instanceof Error && (error as any)?.code === "P2002") {
    const target = (error as any)?.meta?.target as string[];
    if (target?.includes("email")) {
      return apiError(ApiError.conflict("Email already exists"));
    }
  }

  // Handle other known error types
  if (error instanceof ApiError) {
    return apiError(error);
  }

  // Fallback to generic error
  return apiError(error);
}
