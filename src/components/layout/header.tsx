"use client"

import Link from "next/link"
import { ShoppingBag, User, LogOut, Menu, X } from "lucide-react"
import { useCartStore } from "@/features/cart/store/cart-store"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function Header() {
  const { data: session } = authClient.useSession()
  const items = useCartStore((state) => state.items)
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold tracking-widest text-foreground">
          <span>AURA</span>
        </Link>

        <nav className="hidden md:flex space-x-8 text-sm font-medium text-muted-foreground">
          <Link href="/shop" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <Link href="/shop?featured=true" className="hover:text-foreground transition-colors">
            Featured
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors" id="cart-button">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {session ? (
            <div className="flex items-center space-x-3">
              <Link href={(session.user as any).role === "ADMIN" ? "/admin" : "/profile"} className="flex items-center space-x-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{session.user.name}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground h-9 w-9">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-4">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/shop?featured=true"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Featured
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
