import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/utils/authorize";
import { apiError, apiSuccess } from "@/lib/apiResponse";

// Admin-only: list all products

export async function GET(req: NextRequest) {
  try {
    authorize(req, ["admin"]);
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        created_at: true,
      },
    });
    return apiSuccess(products);
  } catch (error) {
    return apiError(error);
  }
}
