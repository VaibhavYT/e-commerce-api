import { NextRequest } from "next/server";
import { authorize } from "@/utils/authorize";
import {
  withErrorHandling,
  withErrorHandlingAndParams,
} from "@/utils/withErrorHandling";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/services/product.services";
import { updateProductSchema } from "@/lib/validation/product";
import { apiSuccess } from "@/lib/apiResponse";
import { ApiError } from "@/utils/apiError";
interface Context {
  params: { id: string };
}

// GET - Get single product
export const GET = withErrorHandling(async (req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const parts = pathname.split("/");
  const idStr = parts[parts.length - 1];
  const id = Number(idStr);
  if (!Number.isInteger(id)) throw ApiError.badRequest("Invalid product id");
  const product = await getProductById(id);
  return apiSuccess(product);
});


// PUT - Update product (admin only)
export const PUT = withErrorHandlingAndParams(
  async (req: NextRequest, context: Context) => {
    authorize(req, ["admin"]);
    const { id } = context.params;
    const body = await req.json();
    const parsed = updateProductSchema.parse(body);
    const productId = parseInt(id, 10);
    if (isNaN(productId) || productId <= 0) {
      throw ApiError.badRequest("Invalid product ID");
    }
    const product = await updateProduct(productId, parsed);
    return apiSuccess(product);
  }
);

// DELETE - Delete product (admin only)
export const DELETE = withErrorHandlingAndParams(
  async (req: NextRequest, context: Context) => {
    authorize(req, ["admin"]);
    const { id } = context.params;
    const productId = parseInt(id, 10);
    if (isNaN(productId) || productId <= 0) {
      throw ApiError.badRequest("Invalid product ID");
    }
    const result = await deleteProduct(productId);
    return apiSuccess(result);
  }
);
