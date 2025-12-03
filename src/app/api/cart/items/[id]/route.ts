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
  if (!Number.isInteger(id)) throw ApiError.badRequest("Invalid cart item id");
  const cart = await prisma.cart.findFirst({
    where: { userId: decoded.id, is_active: true },
  });
  if (!cart) throw ApiError.notFound("Active cart not found");
  const item = await prisma.cartItem.findUnique({
    where: { id },
    include: { product: true },
  });
  if (!item || item.cartId !== cart.id)
    throw ApiError.notFound("Cart item not found");
  return apiSuccess(item);
});
