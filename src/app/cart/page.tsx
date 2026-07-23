"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useCartStore } from "@/features/cart/store/cart-store"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { Trash2, ArrowRight, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import axios from "axios"

export default function CartPage() {
  const { items, coupon, updateQuantity, removeItem, applyCoupon, removeCoupon, getTotals } = useCartStore()
  const { subtotal, discount, tax, shipping, total } = getTotals()

  const [couponCode, setCouponCode] = useState("")
  const [couponError, setCouponError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode) return
    setApplying(true)
    setCouponError(null)

    try {
      const res = await axios.post("/api/coupons/verify", {
        code: couponCode,
        subtotal
      })
      if (res.data && res.data.success && res.data.coupon) {
        applyCoupon(res.data.coupon as any)
        setCouponCode("")
      } else {
        setCouponError("Invalid coupon code")
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.error || "Failed to apply coupon")
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12 sm:px-6 flex-1 max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8 text-foreground">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-24 border rounded-2xl bg-zinc-50 dark:bg-zinc-900/10">
            <h3 className="text-lg font-semibold text-foreground">Your cart is empty</h3>
            <p className="text-muted-foreground mt-1">Looks like you haven&apos;t added anything to your cart yet.</p>
            <Link href="/shop">
              <Button className="mt-6 rounded-full px-6">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 border-b">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border bg-white flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <Link href={`/product/${item.productId}`} className="font-semibold text-sm hover:underline line-clamp-1 text-foreground">
                          {item.name}
                        </Link>
                        <span className="font-semibold text-sm text-foreground">{formatPrice((item.discountPrice ?? item.price) * item.quantity)}</span>
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                        {item.color && <span>Color: {item.color}</span>}
                        {item.size && <span>Size: {item.size}</span>}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full border flex items-center justify-center text-xs disabled:opacity-50 text-foreground"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold w-4 text-center text-foreground">{item.quantity}</span>
                        <button
                          disabled={item.quantity >= item.stock}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border flex items-center justify-center text-xs disabled:opacity-50 text-foreground"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="border rounded-2xl p-6 bg-zinc-50 dark:bg-zinc-900/10 space-y-4">
                <h3 className="font-bold text-lg text-foreground">Order Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-500 font-medium">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Tax</span>
                    <span className="text-foreground">{formatPrice(tax)}</span>
                  </div>

                  <div className="border-t pt-4 flex justify-between font-bold text-base text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  {coupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 px-3 py-2 rounded-lg text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Code <strong>{coupon.code}</strong> applied ({coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `$${coupon.value}`} off)</span>
                      </div>
                      <button onClick={removeCoupon} className="hover:text-emerald-700">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <Input
                        placeholder="Promo Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="h-8 text-xs text-foreground"
                      />
                      <Button type="submit" size="sm" className="h-8" disabled={applying}>
                        {applying ? "..." : "Apply"}
                      </Button>
                    </form>
                  )}
                  {couponError && <p className="text-[10px] text-destructive mt-1.5 font-medium">{couponError}</p>}
                </div>

                <Link href="/checkout" className="block w-full pt-2">
                  <Button className="w-full rounded-full" size="lg" id="checkout-button">
                    Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
