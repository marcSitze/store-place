"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useCartStore } from "@/features/cart/store/cart-store"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function CheckoutPage() {
  const { items, coupon, getTotals, clearCart } = useCartStore()
  const { subtotal, discount, tax, shipping, total } = getTotals()
  
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  
  const [street, setStreet] = useState("")
  const [apartment, setApartment] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [country, setCountry] = useState("")
  const [postalCode, setPostalCode] = useState("")

  const [cardHolder, setCardHolder] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")

  useEffect(() => {
    if (session?.user) {
      setEmail(session.user.email || "")
      setName(session.user.name || "")
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await axios.post("/api/orders", {
        userId: session?.user?.id || null,
        email,
        name,
        phone,
        shippingAddress: {
          street,
          apartment: apartment || null,
          city,
          state,
          country,
          postalCode,
        },
        billingAddress: {
          street,
          apartment: apartment || null,
          city,
          state,
          country,
          postalCode,
        },
        items: items.map(i => ({
          variantId: i.id,
          quantity: i.quantity,
          price: i.price,
        })),
        couponCode: coupon?.code || null,
        subtotal,
        tax,
        shippingCost: shipping,
        discount,
        total,
        paymentProvider: "MOCK",
      })

      if (res.data) {
        clearCart()
        router.push(`/checkout/success?orderNumber=${res.data.orderNumber}`)
      } else {
        setError("Failed to process order")
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "An unexpected error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center flex-1">
          <h3 className="text-lg font-semibold text-foreground">Your cart is empty</h3>
          <p className="text-muted-foreground mt-1">Please add items to your cart before checking out.</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12 sm:px-6 flex-1 max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8 text-foreground">Checkout</h1>
        
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2 text-foreground">Customer Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="text-foreground" />
                </div>
                <div>
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input id="name" required value={name} onChange={e => setName(e.target.value)} className="text-foreground" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <Input id="phone" required value={phone} onChange={e => setPhone(e.target.value)} className="text-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2 text-foreground">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="street" className="text-foreground">Street Address</Label>
                  <Input id="street" required value={street} onChange={e => setStreet(e.target.value)} className="text-foreground" />
                </div>
                <div>
                  <Label htmlFor="apartment" className="text-foreground">Apartment / Suite</Label>
                  <Input id="apartment" value={apartment} onChange={e => setApartment(e.target.value)} className="text-foreground" />
                </div>
                <div>
                  <Label htmlFor="city" className="text-foreground">City</Label>
                  <Input id="city" required value={city} onChange={e => setCity(e.target.value)} className="text-foreground" />
                </div>
                <div>
                  <Label htmlFor="state" className="text-foreground">State / Province</Label>
                  <Input id="state" required value={state} onChange={e => setState(e.target.value)} className="text-foreground" />
                </div>
                <div>
                  <Label htmlFor="postalCode" className="text-foreground">Postal Code</Label>
                  <Input id="postalCode" required value={postalCode} onChange={e => setPostalCode(e.target.value)} className="text-foreground" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="country" className="text-foreground">Country</Label>
                  <Input id="country" required value={country} onChange={e => setCountry(e.target.value)} className="text-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2 text-foreground">Payment Details (Mock Gateway)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="cardHolder" className="text-foreground">Cardholder Name</Label>
                  <Input id="cardHolder" required value={cardHolder} onChange={e => setCardHolder(e.target.value)} className="text-foreground" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="cardNumber" className="text-foreground">Card Number</Label>
                  <Input id="cardNumber" required placeholder="XXXX XXXX XXXX XXXX" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="text-foreground" />
                </div>
                <div>
                  <Label htmlFor="expiry" className="text-foreground">Expiration Date</Label>
                  <Input id="expiry" required placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} className="text-foreground" />
                </div>
                <div>
                  <Label htmlFor="cvc" className="text-foreground">CVC</Label>
                  <Input id="cvc" required placeholder="XXX" value={cvc} onChange={e => setCvc(e.target.value)} className="text-foreground" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="border rounded-2xl p-6 bg-zinc-50 dark:bg-zinc-900/10 space-y-6 sticky top-24">
              <h3 className="font-bold text-lg text-foreground">Your Order</h3>
              
              <div className="divide-y max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 text-sm text-foreground">
                    <span className="text-muted-foreground line-clamp-1">{item.name} x {item.quantity}</span>
                    <span>{formatPrice((item.discountPrice ?? item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t pt-4">
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

                <div className="border-t pt-4 flex justify-between font-bold text-base text-foreground font-sans">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button type="submit" className="w-full rounded-full" size="lg" disabled={submitting} id="pay-submit-button">
                {submitting ? "Processing Order..." : `Pay ${formatPrice(total)}`}
              </Button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  )
}
