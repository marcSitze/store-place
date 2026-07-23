"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function createReview(rawData: any) {
  try {
    const reviewSchema = z.object({
      userId: z.string().uuid(),
      productId: z.string().uuid(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().optional().nullable(),
    });

    const data = reviewSchema.parse(rawData);

    const review = await prisma.review.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment,
      }
    });

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { slug: true }
    });

    if (product) {
      revalidatePath(`/product/${product.slug}`);
    }

    return { success: true, review: JSON.parse(JSON.stringify(review)) };
  } catch (error: any) {
    console.error("Failed to create review:", error);
    return { success: false, error: error.message || "Failed to submit review" };
  }
}
