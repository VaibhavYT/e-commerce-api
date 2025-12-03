import { NextRequest } from "next/server";
import { authorize } from "@/utils/authorize";
import { withErrorHandling } from "@/utils/withErrorHandling";
import {
  getAllProducts,
  createProduct,
  searchProducts,
} from "@/services/product.services";
import {
  createProductSchema,
  productListQuerySchema,
} from "@/lib/validation/product";
import { apiSuccess } from "@/lib/apiResponse";

// GET - List all products (admin only)
// POST - Create new product (admin only)
export const GET = withErrorHandling(async (req: NextRequest) => {
  authorize(req, ["admin"]);
  const products = await getAllProducts();
  return apiSuccess(products);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  authorize(req, ["admin"]);
  const body = await req.json();
  const parsed = createProductSchema.parse(body);
  const product = await createProduct(parsed);
  return apiSuccess(product, 201);
});

export const GET = withErrorHandling(async (req: NextRequest) => {
  // Parse query params
  const url = req.nextUrl;
  const qp: Record<string, string> = {};
  url.searchParams.forEach((value, key) => (qp[key] = value));

  const parsed = productListQuerySchema.parse(qp);
  const result = await searchProducts({
    q: parsed.q,
    categoryId: parsed.categoryId,
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    page: parsed.page,
    limit: parsed.limit,
    sortBy: parsed.sortBy,
    sortOrder: parsed.sortOrder,
  });
  return apiSuccess(result);
});
