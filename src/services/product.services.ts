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