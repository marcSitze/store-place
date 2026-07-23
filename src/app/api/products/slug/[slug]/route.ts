import { NextResponse } from "next/server";
import { getProductBySlug } from "@/actions/products";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Product slug GET API error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
