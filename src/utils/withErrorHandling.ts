// src/utils/withErrorHandling.ts
import type { NextRequest } from "next/server";
import { apiError } from "@/lib/apiResponse";
import { ApiError } from "./apiError";

type Handler = (
  req: NextRequest
) => Promise<Response | ReturnType<typeof Response> | any>;

export function withErrorHandling(handler: Handler) {
  return async function (req: NextRequest) {
    try {
      const result = await handler(req);
      // If handler already returns a NextResponse, return it
      return result;
    } catch (error: unknown) {
      // If it's not ApiError but it's a string or other, we can wrap
      if (
        !(error instanceof ApiError) &&
        (error as any)?.message?.includes?.("Zod")
      ) {
        // example: treat Zod errors as 400
        return apiError(
          ApiError.badRequest("Validation failed", { raw: error })
        );
      }
      // delegate to global apiError which logs + formats
      return apiError(error);
    }
  };
}
