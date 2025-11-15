import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/tokens";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return apiError(new Error("Unauthorized: Missing token"));

    const token = authHeader.split(" ")[1];
    const decoded: any = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) return apiError(new Error("User not found"));

    return apiSuccess(user);
  } catch (error: any) {
    return apiError(error);
  }
}
