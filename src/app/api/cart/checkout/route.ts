import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/apiResponse";
import { withErrorHandling } from "@/utils/withErrorHandling";
import { authorize } from "@/utils/authorize";
import { checkoutSchema } from "@/lib/validation/cart";
import { createOrderFromCart } from "@/services/order.services";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const decoded = authorize(req, ["admin", "customer"]);
  const body = await req.json();
  const parsed = checkoutSchema.parse(body);
  const { order, payment } = await createOrderFromCart(decoded.id, {
    shipping_address: parsed.shipping_address,
    payment_method: parsed.payment_method,
  });
  return apiSuccess({ message: "Order created", order, payment }, 201);
});
