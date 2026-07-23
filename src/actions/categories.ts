"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  icon: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  parentId: z.string().uuid().optional().nullable(),
})

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        parent: true,
      },
      orderBy: { name: 'asc' },
    });
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function createCategory(rawData: any) {
  try {
    const data = categorySchema.parse(rawData);
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: data.image,
        icon: data.icon,
        isFeatured: data.isFeatured,
        parentId: data.parentId,
      }
    });

    revalidatePath("/");
    revalidatePath("/shop");
    return { success: true, category: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return { success: false, error: error.message || "Validation failed" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id }
    });
    revalidatePath("/");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return { success: false, error: error.message || "Failed to delete category" };
  }
}

export async function getCategoryById(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
      }
    });
    return category ? JSON.parse(JSON.stringify(category)) : null;
  } catch (error) {
    console.error("Failed to fetch category by id:", error);
    return null;
  }
}

export async function updateCategory(id: string, rawData: any) {
  try {
    const data = categorySchema.parse(rawData);
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: data.image,
        icon: data.icon,
        isFeatured: data.isFeatured,
        parentId: data.parentId,
      }
    });

    revalidatePath("/");
    revalidatePath("/shop");
    return { success: true, category: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    console.error("Failed to update category:", error);
    return { success: false, error: error.message || "Validation failed" };
  }
}
