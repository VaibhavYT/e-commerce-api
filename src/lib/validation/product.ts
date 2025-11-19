import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  description: z.string(),
});

export const updateProductSchema = createProductSchema.partial();
