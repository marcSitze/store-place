import { NextResponse } from "next/server";
import { getProducts, createProduct } from "@/actions/products";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const brandId = searchParams.get("brandId") || undefined;
    const query = searchParams.get("query") || undefined;
    const status = searchParams.get("status") || "PUBLISHED";
    const isFeaturedStr = searchParams.get("isFeatured");
    const isFeatured = isFeaturedStr !== null ? isFeaturedStr === "true" : undefined;
    
    const minPriceStr = searchParams.get("minPrice");
    const minPrice = minPriceStr !== null ? parseFloat(minPriceStr) : undefined;
    
    const maxPriceStr = searchParams.get("maxPrice");
    const maxPrice = maxPriceStr !== null ? parseFloat(maxPriceStr) : undefined;
    
    const sortBy = (searchParams.get("sortBy") as any) || "created_at_desc";
    
    const pageStr = searchParams.get("page");
    const page = pageStr !== null ? parseInt(pageStr) : 1;
    
    const limitStr = searchParams.get("limit");
    const limit = limitStr !== null ? parseInt(limitStr) : 12;

    const result = await getProducts({
      categoryId,
      brandId,
      query,
      status,
      isFeatured,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Products GET API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const result = await createProduct(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.product);
  } catch (error: any) {
    console.error("Products POST API error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
