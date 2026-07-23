"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  shortDescription: z.string().max(200),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  weight: z.number().optional().nullable(),
  length: z.number().optional().nullable(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid(),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().optional() })),
  variants: z.array(z.object({
    sku: z.string().min(2),
    price: z.number().positive().optional().nullable(),
    discountPrice: z.number().positive().optional().nullable(),
    stock: z.number().int().nonnegative().default(0),
    color: z.string().optional().nullable(),
    size: z.string().optional().nullable(),
    material: z.string().optional().nullable(),
  }))
})

export async function getProducts(options?: {
  categoryId?: string;
  brandId?: string;
  query?: string;
  status?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'created_at_desc';
  page?: number;
  limit?: number;
}) {
  const {
    categoryId,
    brandId,
    query,
    status = "PUBLISHED",
    isFeatured,
    minPrice,
    maxPrice,
    sortBy = 'created_at_desc',
    page = 1,
    limit = 12
  } = options || {};

  const skip = (page - 1) * limit;

  const where: any = {
    status
  };

  if (categoryId) where.categoryId = categoryId;
  if (brandId) where.brandId = brandId;
  if (isFeatured !== undefined) where.isFeatured = isFeatured;

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { shortDescription: { contains: query, mode: 'insensitive' } },
      { sku: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sortBy === 'price_asc') {
    orderBy = { price: 'asc' };
  } else if (sortBy === 'price_desc') {
    orderBy = { price: 'desc' };
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { position: 'asc' } },
          variants: true,
          category: true,
          brand: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: JSON.parse(JSON.stringify(products)),
      total,
      pages: Math.ceil(total / limit),
      page,
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { products: [], total: 0, pages: 1, page };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
        category: true,
        brand: true,
        reviews: {
          include: {
            user: { select: { name: true, image: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch (error) {
    console.error("Failed to fetch product by slug:", error);
    return null;
  }
}

export async function createProduct(rawData: any) {
  try {
    const data = productSchema.parse(rawData);
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sku = `sku_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        sku,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        discountPrice: data.discountPrice,
        status: data.status,
        isFeatured: data.isFeatured,
        weight: data.weight,
        length: data.length,
        width: data.width,
        height: data.height,
        categoryId: data.categoryId,
        brandId: data.brandId,
        images: {
          create: data.images.map((img, idx) => ({
            url: img.url,
            alt: img.alt || data.name,
            position: idx
          }))
        },
        variants: {
          create: data.variants.map(v => ({
            sku: v.sku,
            price: v.price,
            discountPrice: v.discountPrice,
            stock: v.stock,
            color: v.color,
            size: v.size,
            material: v.material
          }))
        }
      }
    });

    revalidatePath("/");
    revalidatePath("/shop");
    return { success: true, product: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return { success: false, error: error.message || "Validation failed" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    });
    revalidatePath("/");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return { success: false, error: error.message || "Failed to delete product" };
  }
}

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
        category: true,
        brand: true,
      }
    });

    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch (error) {
    console.error("Failed to fetch product by id:", error);
    return null;
  }
}

export async function updateProduct(id: string, rawData: any) {
  try {
    const data = productSchema.parse(rawData);
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = await prisma.$transaction(async (tx) => {
      // Delete old images and variants to prevent orphans/duplicates
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productVariant.deleteMany({ where: { productId: id } });

      const updated = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug,
          description: data.description,
          shortDescription: data.shortDescription,
          price: data.price,
          discountPrice: data.discountPrice,
          status: data.status,
          isFeatured: data.isFeatured,
          weight: data.weight,
          length: data.length,
          width: data.width,
          height: data.height,
          categoryId: data.categoryId,
          brandId: data.brandId,
          images: {
            create: data.images.map((img, idx) => ({
              url: img.url,
              alt: img.alt || data.name,
              position: idx
            }))
          },
          variants: {
            create: data.variants.map(v => ({
              sku: v.sku,
              price: v.price,
              discountPrice: v.discountPrice,
              stock: v.stock,
              color: v.color,
              size: v.size,
              material: v.material
            }))
          }
        }
      });
      return updated;
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${product.slug}`);
    return { success: true, product: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return { success: false, error: error.message || "Validation failed" };
  }
}
