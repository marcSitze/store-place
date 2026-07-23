import { NextResponse } from "next/server";
import { createOrder, getOrders, getAllOrders } from "@/actions/orders";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role === "ADMIN") {
      const orders = await getAllOrders();
      return NextResponse.json(orders);
    } else {
      const orders = await getOrders(session.user.id);
      return NextResponse.json(orders);
    }
  } catch (error) {
    console.error("Orders GET API error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createOrder(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.order);
  } catch (error: any) {
    console.error("Orders POST API error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
