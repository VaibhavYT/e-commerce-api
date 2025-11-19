import { loginSchema } from "@/lib/validation/auth";
import { loginUser } from "@/services/auth.services";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.parse(body);
    const result = await loginUser(parsed.email, parsed.password);
    return apiSuccess({ message: "Login successful", ...result });
  } catch (error) {
    return apiError(error);
  }
}
