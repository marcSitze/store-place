import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessPageProps {
  searchParams: Promise<{
    orderNumber?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderNumber = params.orderNumber || "ORD-UNKNOWN";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-24 text-center flex-1 max-w-md flex flex-col justify-center items-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-6" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Order Confirmed!</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Thank you for shopping with Aura. We have received your order and are processing it.
        </p>

        <div className="bg-zinc-50 dark:bg-zinc-900/40 border rounded-2xl p-4 w-full my-8 text-sm">
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Order Number</span>
            <span className="font-semibold text-foreground">{orderNumber}</span>
          </div>
          <div className="flex justify-between py-1 pt-3">
            <span className="text-muted-foreground">Status</span>
            <span className="text-emerald-500 font-medium">Paid & Pending Fulfillment</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-8">
          A confirmation email has been sent to your inbox.
        </p>

        <div className="flex gap-4 w-full">
          <Link href="/shop" className="flex-1">
            <Button variant="outline" className="w-full rounded-full">
              Shop More
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full rounded-full">
              Home
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
