"use server"

import prisma from "@/lib/prisma"
import { z } from "zod"

export async function verifyCoupon(code: string, subtotal: number) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return { success: false, error: "Coupon not found" };
    }

    const now = new Date();
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return { success: false, error: "Coupon has expired" };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { success: false, error: "Coupon usage limit reached" };
    }

    if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) {
      return { success: false, error: `Minimum purchase of $${Number(coupon.minPurchase).toFixed(2)} required` };
    }

    return {
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : undefined
      }
    };
  } catch (error: any) {
    console.error("Failed to verify coupon:", error);
    return { success: false, error: "Error verifying coupon" };
  }
}

export async function createCoupon(rawData: any) {
  try {
    const couponSchema = z.object({
      code: z.string().min(3).toUpperCase(),
      type: z.enum(["PERCENTAGE", "FIXED"]),
      value: z.number().positive(),
      minPurchase: z.number().nonnegative().optional(),
      maxDiscount: z.number().nonnegative().optional(),
      usageLimit: z.number().int().positive().optional(),
      expiresAt: z.string().optional().nullable(),
    });

    const data = couponSchema.parse(rawData);

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minPurchase: data.minPurchase,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
      }
    });

    return { success: true, coupon: JSON.parse(JSON.stringify(coupon)) };
  } catch (error: any) {
    console.error("Failed to create coupon:", error);
    return { success: false, error: error.message || "Failed to create coupon" };
  }
}
