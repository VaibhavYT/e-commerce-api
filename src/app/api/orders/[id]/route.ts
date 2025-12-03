import { NextRequest } from "next/server";
import { withErrorHandling } from "@/utils/withErrorHandling";
import { authorize } from "@/utils/authorize";
import { apiSuccess } from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/apiError";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const decoded = authorize(req, ["admin", "customer"]);
  const { pathname } = req.nextUrl;
  const parts = pathname.split("/");
  const idStr = parts[parts.length - 1];
  const id = Number(idStr);
  if (!Number.isInteger(id)) throw ApiError.badRequest("Invalid order id");
  const order = await prisma.order.findUnique({
    where: { id },
    include: { orderItems: true, payments: true },
  });
  if (!order) throw ApiError.notFound("Order not found");
  // Admin can view any order; customers only their own
  if (decoded.role !== "admin" && order.userId !== decoded.id) {
    throw ApiError.forbidden("Access denied");
  }
  return apiSuccess(order);
});
