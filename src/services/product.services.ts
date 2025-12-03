  import { prisma } from "@/lib/prisma";
  import { ApiError } from "@/utils/apiError";

  export async function getAllProducts() {
    return await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        created_at: true,
      },
    });
  }

  export async function getProductById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        description: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!product) {
      throw ApiError.notFound("Product not found ");
    }
    return product;
  }

  export async function createProduct(productData: {
    name: string;
    price: number;
    stock: number;
    description: string;
  }) {
    // Add any business logic/validation here
    if (productData.price < 0) {
      throw ApiError.badRequest("Price cannot be negative");
    }

    if (productData.stock < 0) {
      throw ApiError.badRequest("Stock cannot be negative");
    }
    return await prisma.product.create({
      data: productData,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        description: true,
        created_at: true,
      },
    });
  }

  export async function updateProduct(
    id: number,
    updateData: Partial<{
      name: string;
      price: number;
      stock: number;
      description: string;
    }>
  ) {
    // Verify product exists
    await getProductById(id);
    return await prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        description: true,
        updated_at: true,
      },
    });
  }

  export async function deleteProduct(id: number) {
    // Verify product exists
    await getProductById(id);

    await prisma.product.delete({
      where: { id },
    });

    return { message: "Product deleted successfully" };
  }

  /**
 * Search and list products with pagination & filtering
 */

export async function searchProducts(opts: {
  q?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: "created_at" | "price" | "name";
  sortOrder?: "asc" | "desc";
}){
  const {
    q,
    categoryId,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "desc",
  } = opts;
  // Build where clause
  const where: any = {
    AND: [] as any[],
  };
  if (q) {
    where.AND.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (categoryId) where.AND.push({ categoryId });
  if (typeof minPrice === "number")
    where.AND.push({ price: { gte: minPrice } });
  if (typeof maxPrice === "number")
    where.AND.push({ price: { lte: maxPrice } });
  // If no filters added, remove AND wrapper (Prisma expects proper where)
   const finalWhere = where.AND.length ? where : {};
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where: finalWhere,
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          image_url: true,
          description: true,
          categoryId: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where: finalWhere }),
    ]);
     const totalPages = Math.ceil(total / limit);
      return {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
}