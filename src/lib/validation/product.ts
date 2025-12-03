import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  description: z.string(),
});

export const updateProductSchema = createProductSchema.partial();


export const productListQuerySchema = z.object({
  q: z.string().optional(), // search text
  categoryId: z.preprocess(
    (v) => (v ? Number(v) : undefined),
    z.number().int().positive().optional()
  ),
  minPrice: z.preprocess(
    (v) => (v ? Number(v) : undefined),
    z.number().nonnegative().optional()
  ),
  maxPrice: z.preprocess(
    (v) => (v ? Number(v) : undefined),
    z.number().nonnegative().optional()
  ),
  page: z.preprocess(
    (v) => (v ? Number(v) : 1),
    z.number().int().positive().default(1)
  ),
  limit: z.preprocess(
    (v) => (v ? Number(v) : 10),
    z.number().int().positive().max(100).default(10)
  ),
  sortBy: z
    .enum(["created_at", "price", "name"])
    .optional()
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});