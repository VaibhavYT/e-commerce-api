import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/apiError";
import { calculateCartTotal } from "./cart.services";
import { PrismaClientExtends } from "@prisma/client/extension";

/**
 * Create order from user's active cart.
 * This does:
 * - validate stock
 * - create Order
 * - create OrderItem rows
 * - decrement product stock
 * - create Payment record (initiated)
 * - deactivate cart
 *
 * Runs inside a transaction.
 */

export async function createOrderFromCart(
  userId: number,
  opts: {
    shipping_address?: string;
    payment_method?: "stripe" | "razorpay" | "paypal" | undefined;
  }
) {
  // Fetch active cart with items
  const cart = await prisma.cart.findFirst({
    where: {
      userId,
      is_active: true,
    },
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

  // Validate stock before starting transaction
  for (const ci of cart.cartItems) {
    const product = ci.product;
    if (!product) throw ApiError.notFound("Product for cart item not found");
    if (product.stock < ci.quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for product ${product.name}`
      );
    }
  }
  // Calculate total
  const total_amount = calculateCartTotal(cart);
  // Transaction: create order, order items, decrement stock, create payment, deactivate cart
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        total_amount,
        status: "pending",
        shipping_address: opts.shipping_address ?? null,
      },
    });
    // Create order items and decrement stock
    for (const ci of cart.cartItems) {
      const price = Number(ci.product!.price.toString());
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: ci.product.id,
          quantity: ci.quantity,
          price,
          subtotal: Number((price * ci.quantity).toFixed(2)),
        },
      });
      // decrement stock
      await tx.product.update({
        where: { id: ci.product!.id },
        data: { stock: { decrement: ci.quantity } },
      });
    }
    // Create a Payment placeholder (initiated)
    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        userId,
        payment_method: opts.payment_method ?? "stripe",
        amount: total_amount,
        status: "initiated",
      },
    });
    // Deactivate cart
    await tx.cart.update({
      where: { id: cart.id },
      data: {
        is_active: false,
      },
    });
    return { order, payment };
  });
  return result;
}
/**
 * Get orders: admin sees all; customer sees own orders
 */

export async function getOrderForUser(decode: { id: number; role: string }) {
  if (decode.role === "admin") {
    return prisma.order.findMany({
      include: { orderItems: true, payments: true },
      orderBy: { created_at: "desc" },
    });
  }
  return prisma.order.findMany({
    where: { userId: decode.id },
    include: { orderItems: true, payments: true },
    orderBy: { created_at: "desc" },
  });
}
