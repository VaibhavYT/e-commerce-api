import { NextRequest } from "next/server";
import { authorize } from "@/utils/authorize";
import { withErrorHandling } from "@/utils/withErrorHandling";
import {
  getAllProducts,
  createProduct,
} from "@/services/product.services";
import {
  createProductSchema,
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

