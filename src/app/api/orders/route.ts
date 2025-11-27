import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/utils/authorize";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const decoded = authorize(req, ["admin", "customer"]);
    const orders =
      decoded.role === "admin"
        ? await prisma.order.findMany()
        : await prisma.order.findMany({ where: { userId: decoded.id } });
    return apiSuccess(orders);
  } catch (error) {
    return apiError(error);
  }
}
