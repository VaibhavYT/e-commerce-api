import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/apiResponse";
import { withErrorHandling } from "@/utils/withErrorHandling";
import { authorize } from "@/utils/authorize";
import {
  addCartItemsSchema,
  removeCartItemSchema,
} from "@/lib/validation/cart";
import { addOrUpdateCartItem, removeCartItem } from "@/services/cart.services";
export const POST = withErrorHandling(async (req: NextRequest) => {
  const decoded = authorize(req, ["admin", "customer"]);
  const body = await req.json();
  const parsed = addCartItemsSchema.parse(body);
  const item = await addOrUpdateCartItem(
    decoded.id,
    parsed.productId,
    parsed.quantity
  );
  return apiSuccess(item, 201);
});

export const DELETE = withErrorHandling(async (req: NextRequest) => {
  const decoded = authorize(req, ["admin", "customer"]);
  const body = await req.json();
  const parsed = removeCartItemSchema.parse(body);
  const result = await removeCartItem(decoded.id, parsed.productId);
  return apiSuccess(result, 200);
});
