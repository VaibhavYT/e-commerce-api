import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/apiResponse";
import { withErrorHandling } from "@/utils/withErrorHandling";
import { authorize } from "@/utils/authorize";
import { checkoutSchema } from "@/lib/validation/cart";
import { createOrderFromCart } from "@/services/order.services";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/apiError";
import { calculateCartTotal } from "@/services/cart.services";
import { createStripePaymentIntent } from "@/services/payment.services";
export const POST = withErrorHandling(async (req: NextRequest) => {
  const decoded = authorize(req, ["admin", "customer"]);
  const body = await req.json();
  const parsed = checkoutSchema.parse(body);

  // Get active cart with items
  const cart = await prisma.cart.findFirst({
    where: { userId: decoded.id, is_active: true },
    include: {
      cartItems: {
        include: {
          product: true,
        },
      },
    },
  });
  if (!cart || !cart.cartItems?.length) {
    throw ApiError.badRequest("Cart is empty");
  }
  // validate stock
  for (const ci of cart.cartItems) {
    if (!ci.product) throw ApiError.notFound("Product not found");
    if (ci.product.stock < ci.quantity) {
      throw ApiError.badRequest(`Insufficient stock for ${ci.product.name}`);
    }
  }
  // Calculate total (in your currency; adjust accordingly)
  const total = calculateCartTotal(cart);

  // Create Order, OrderItems, decrement stock, create Payment (status initiated) inside transaction.
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId: decoded.id,
        total_amount: total,
        status: "pending",
        shipping_address: parsed.shipping_address ?? null,
      },
    });
    for (const ci of cart.cartItems) {
      const price = Number(ci.product!.price.toString());
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: ci.product!.id,
          quantity: ci.quantity,
          price,
          subtotal: Number((price * ci.quantity).toFixed(2)),
        },
      });
      await tx.product.update({
        where: { id: ci.product!.id },
        data: { stock: { decrement: ci.quantity } },
      });
    }
    // Create payment record with placeholder transactionId - we'll store stripe intent id once created

    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        userId: decoded.id,
        payment_method: parsed.payment_method ?? "stripe",
        amount: total,
        status: "initiated",
      },
    });
    // Deactivate cart
    await tx.cart.update({
      where: { id: cart.id },
      data: { is_active: false },
    });

    return { order, payment };
  });
  // Create Stripe PaymentIntent and associate its id with the payment record
  const intent = await createStripePaymentIntent(result.payment.amount, "usd", {
    orderId: String(result.order.id),
    paymentId: String(result.payment.id),
  });
  // Update payment record with transactionId (stripe paymentIntent id)
  await prisma.payment.update({
    where: { id: result.payment.id },
    data: { transactionId: intent.id },
  });
  // Return client_secret to frontend
  return apiSuccess(
    {
      client_secret: intent.client_secret,
      order: result.order,
      payment: result.payment,
    },
    201
  );
});
