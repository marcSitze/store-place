import { NextResponse } from "next/server";
import { verifyCoupon } from "@/actions/coupons";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Missing coupon code" }, { status: 400 });
    }

    const result = await verifyCoupon(code, subtotal || 0);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Coupon verify POST API error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify coupon" }, { status: 500 });
  }
}
