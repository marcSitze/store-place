"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { activePaymentService } from "@/services/payment"
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "@/services/email"

const orderItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
})

const checkoutSchema = z.object({
  userId: z.string().optional().nullable(),
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().min(5),
  shippingAddress: z.object({
    street: z.string().min(1),
    apartment: z.string().optional().nullable(),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    postalCode: z.string().min(1),
  }),
  billingAddress: z.object({
    street: z.string().min(1),
    apartment: z.string().optional().nullable(),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    postalCode: z.string().min(1),
  }),
  items: z.array(orderItemSchema),
  couponCode: z.string().optional().nullable(),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  shippingCost: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  total: z.number().nonnegative(),
  paymentProvider: z.string().default("MOCK"),
})

export async function createOrder(rawData: any) {
  try {
    const data = checkoutSchema.parse(rawData);

    // 1. Double check and deduct stock within a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Validate inventory for each item
      for (const item of data.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, sku: true }
        });

        if (!variant || variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for variant with SKU: ${variant?.sku || item.variantId}`);
        }

        // Deduct stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity }
          }
        });

        // Record inventory change log
        await tx.inventory.create({
          data: {
            productVariantId: item.variantId,
            quantityChange: -item.quantity,
            reason: "PURCHASE"
          }
        });
      }

      // 2. Ensure customer user exists, or create a guest customer on the fly
      let finalUserId = data.userId;
      if (!finalUserId) {
        const existingUser = await tx.user.findUnique({
          where: { email: data.email }
        });
        if (existingUser) {
          finalUserId = existingUser.id;
        } else {
          const guestUser = await tx.user.create({
            data: {
              email: data.email,
              name: data.name,
              role: "CUSTOMER",
            }
          });
          finalUserId = guestUser.id;
        }
      }

      // Create addresses
      const shippingAddressObj = await tx.address.create({
        data: {
          userId: finalUserId,
          type: "SHIPPING",
          name: data.name,
          phone: data.phone,
          street: data.shippingAddress.street,
          apartment: data.shippingAddress.apartment,
          city: data.shippingAddress.city,
          state: data.shippingAddress.state,
          country: data.shippingAddress.country,
          postalCode: data.shippingAddress.postalCode,
        }
      });

      const billingAddressObj = await tx.address.create({
        data: {
          userId: finalUserId,
          type: "BILLING",
          name: data.name,
          phone: data.phone,
          street: data.billingAddress.street,
          apartment: data.billingAddress.apartment,
          city: data.billingAddress.city,
          state: data.billingAddress.state,
          country: data.billingAddress.country,
          postalCode: data.billingAddress.postalCode,
        }
      });

      const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: finalUserId,
          status: "PAID",
          subtotal: data.subtotal,
          tax: data.tax,
          shippingCost: data.shippingCost,
          discount: data.discount,
          total: data.total,
          couponCode: data.couponCode,
          shippingAddressId: shippingAddressObj.id,
          billingAddressId: billingAddressObj.id,
          items: {
            create: data.items.map(item => ({
              productVariantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            }))
          },
          payments: {
            create: {
              provider: data.paymentProvider,
              amount: data.total,
              status: "PAID",
              reference: `pay_${Math.random().toString(36).substring(2, 11)}`
            }
          }
        },
        include: {
          items: true,
          payments: true
        }
      });

      if (data.couponCode) {
        await tx.coupon.update({
          where: { code: data.couponCode },
          data: { usageCount: { increment: 1 } }
        });
      }

      return newOrder;
    });

    await sendOrderConfirmationEmail(data.email, order.orderNumber, Number(order.total));

    return { success: true, order: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    console.error("Failed to place order:", error);
    return { success: false, error: error.message || "Failed to place order" };
  }
}

export async function getOrders(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { take: 1 }
                  }
                }
              }
            }
          }
        },
        shippingAddress: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error("Failed to fetch user orders:", error);
    return [];
  }
}

export async function getAllOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        },
        shippingAddress: true,
        payments: true,
        shipments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error("Failed to fetch all orders:", error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: any) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: { select: { email: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "ORDER_STATUS_UPDATE",
        entity: "ORDER",
        entityId: orderId,
        details: `Updated status to ${status}`
      }
    });

    const email = order.user?.email;
    if (email) {
      await sendOrderStatusUpdateEmail(email, order.orderNumber, status);
    }

    revalidatePath("/admin/orders");
    return { success: true, order: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return { success: false, error: error.message || "Failed to update order status" };
  }
}
