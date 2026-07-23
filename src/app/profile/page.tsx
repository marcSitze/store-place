"use client"

import { authClient } from "@/lib/auth-client"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/login?callbackUrl=/profile");
    }
  }, [session, sessionLoading, router]);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const res = await axios.get("/api/orders");
      return res.data || [];
    }
  });

  if (sessionLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
          <p className="text-sm text-muted-foreground">Loading session details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return null; // redirecting
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="container mx-auto px-4 py-12 sm:px-6 flex-1 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Hello, {session.user.name}. View your past purchases and track deliveries.</p>
        </div>

        <div className="space-y-8">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Order History</h2>

          {ordersLoading ? (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading order history...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-2xl bg-zinc-50 dark:bg-zinc-900/10">
              <p className="text-sm text-muted-foreground text-foreground">You haven&apos;t placed any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <div key={order.id} className="border rounded-2xl p-6 bg-white dark:bg-zinc-900/10 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4 gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Order Number</span>
                      <p className="font-semibold text-sm text-foreground">{order.orderNumber}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Date Placed</span>
                      <p className="font-medium text-sm text-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Total Amount</span>
                      <p className="font-bold text-sm text-foreground">{formatPrice(Number(order.total))}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-0.5">Status</span>
                      <Badge variant={order.status === "DELIVERED" ? "success" : order.status === "PAID" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="divide-y">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between py-3 text-sm items-center text-foreground">
                        <div>
                          <p className="font-semibold text-foreground">{item.variant?.product?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.variant?.color && `Color: ${item.variant.color}`} {item.variant?.size && `| Size: ${item.variant.size}`} | Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="font-medium text-foreground">{formatPrice(Number(item.price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
