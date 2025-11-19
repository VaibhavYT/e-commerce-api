import { NextRequest } from "next/server";
import { registerSchema } from "@/lib/validation/auth";
import { registerUser } from "@/services/auth.services";
import { ApiError } from "@/utils/apiError";
import { apiSuccess } from "@/lib/apiResponse";
import { withErrorHandling } from "@/utils/withErrorHandling";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = registerSchema.parse(body);
  // Use service; service will throw ApiError for domain issues (e.g., conflict)
  try {
    const user = await registerUser(parsed.name, parsed.email, parsed.password);
    return apiSuccess({ message: "User registered successfully", user }, 201);
  } catch (err: any) {
    // Example: map known Prisma/DB unique violation to conflict ApiError
    if (err?.code === "P2002" || err?.meta?.target?.includes?.("email")) {
      throw ApiError.conflict("Email already exists");
    }
    throw err; // let wrapper handle logging + mapping
  }
});
