import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/apiResponse";
import { withErrorHandling } from "@/utils/withErrorHandling";
import { authorize } from "@/utils/authorize";
import {
  getCartByUser,
  getOrCreateCartForUser,
  calculateCartTotal,
} from "@/services/cart.services";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const decode = authorize(req, ["admin", "customer"]);
  // return active cart (create if none exists)
  const cart = await getOrCreateCartForUser(decode.id);
  const total = calculateCartTotal(cart);
  return apiSuccess({ cart, total });
});
