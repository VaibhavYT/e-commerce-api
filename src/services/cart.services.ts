import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/apiError";

/**
 * Get active cart for user, or create one if none exists
 */

export async function getOrCreateCartForUser(userId: number) {
  let cart = await prisma.cart.findFirst({
    where: { userId, is_active: true },
    include: {
      cartItems: {
        include: { product: true },
      },
    },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }
  return cart;
}

/**
 * Get cart by user (includes items and product details)
 */

export async function getCartByUser(userId: number) {
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      cartItems: {
        include: { product: true },
      },
    },
  });
  return cart;
}

/**
 * Add or update cart item for user's active cart
 */

export async function addOrUpdateCartItem(
  userId: number,
  productId: number,
  quantity: number
) {
  // Validate product
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound("Product not found");
  if (quantity <= 0)
    throw ApiError.badRequest("Quantity must be greater than zero");
  if (product.stock < quantity) {
    throw ApiError.badRequest("Insufficient stock for the requested quantity");
  }
  const cart = await getOrCreateCartForUser(userId);

  // if item exist, update quantity else create new
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity },
      include: { product: true },
    });
    return updated;
  }
  const item = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity,
    },
    include: { product: true },
  });
  return item;
}

/**
 * Remove cart item
 */

export async function removeCartItem(userId: number, productId: number) {
  const cart = await prisma.cart.findFirst({
    where: {
      userId,
    },
  });
  if (!cart) throw ApiError.notFound("Active cart not found");
  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });
  if (!existing) throw ApiError.notFound("Cart item not found");
  await prisma.cartItem.delete({
    where: {
      id: existing.id,
    },
  });
  return { message: "Item removed" };
}

/**
 * Calculate total for cart
 */

export function calculateCartTotal(
  cart: {
    cartItems?: Array<{ quantity: number; product?: { price: number } }>;
  } | null
) {
  if (!cart || !cart.cartItems) return 0;
  // product.price is Decimal from Prisma -> string in JS; convert to number safely
  const total = cart.cartItems.reduce((acc, ci) => {
    const price = ci.product?.price ? Number(ci.product.price.toString()) : 0;
    return acc + price * ci.quantity;
  }, 0);
  return Number(total.toFixed(2));
}

/**
 * Clear (deactivate) cart (used after checkout)
 */

export async function deactivateCart(cartId: number) {
  await prisma.cart.update({
    where: {
      id: cartId,
    },
    data: {
      is_active: false,
    },
  });
}
