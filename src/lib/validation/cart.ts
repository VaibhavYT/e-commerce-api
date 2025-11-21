import { z } from "zod";

export const addCartItemsSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});
export const removeCartItemSchema = z.object({
  productId: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  shipping_address: z.string().min(5).optional(),
  payment_method: z.enum(["stripe", "razorpay", "paypal"]).optional(),
});
