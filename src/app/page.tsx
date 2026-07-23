"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Loader2 } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export default function Home() {
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get("/api/categories");
      // Filter featured ones
      return (res.data || []).filter((c: any) => c.isFeatured).slice(0, 3);
    }
  });

  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await axios.get("/api/products?isFeatured=true&limit=4");
      return res.data?.products || [];
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-950 text-white py-32 px-6 sm:px-12 lg:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black opacity-80" />
        <div className="relative container mx-auto flex flex-col justify-center max-w-4xl text-center space-y-8 z-10">
          <span className="text-sm font-semibold tracking-[0.2em] uppercase text-zinc-400">New Collection</span>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-tight">
            Designed for <br />
            <span className="bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-400 bg-clip-text text-transparent">the Modern Era</span>
          </h1>
          <p className="max-w-xl mx-auto text-lg text-zinc-400 leading-relaxed font-light">
            Minimal aesthetics. Uncompromising quality. Sustainably made apparel and lifestyle essentials.
          </p>
          <div className="flex justify-center space-x-4 pt-4">
            <Link href="/shop">
              <Button size="lg" className="rounded-full px-8 bg-white text-black hover:bg-zinc-200 border-none transition-all">
                Shop The Collection
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Badges */}
      <section className="border-b py-8 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm">
              <Truck className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Free Shipping</h3>
              <p className="text-xs text-muted-foreground">On all orders over $150</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm">
              <RefreshCw className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">30-Day Returns</h3>
              <p className="text-xs text-muted-foreground">Hassle-free exchange policy</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm">
              <ShieldCheck className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Secure Checkout</h3>
              <p className="text-xs text-muted-foreground">Encrypted payments & support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto py-20 px-6">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Categories</span>
            <h2 className="text-3xl font-bold tracking-tight mt-1">Shop by Category</h2>
          </div>
          <Link href="/shop" className="text-sm font-medium hover:underline flex items-center mt-2 md:mt-0">
            View All Categories
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(categories || []).map((cat: any) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative h-96 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 transition-all hover:shadow-lg block"
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors z-10" />
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-zinc-700 to-zinc-950" />
                )}
                <div className="absolute inset-0 flex flex-col justify-end text-left h-full items-start text-white z-20 p-8">
                  <h3 className="text-2xl font-bold">{cat.name}</h3>
                  <p className="text-sm text-zinc-200 mt-1 font-light">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="bg-zinc-50 dark:bg-zinc-900/20 py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Featured</span>
              <h2 className="text-3xl font-bold tracking-tight mt-1">Featured Products</h2>
            </div>
            <Link href="/shop" className="text-sm font-medium hover:underline flex items-center mt-2 md:mt-0">
              Browse Entire Shop
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex flex-col space-y-4 animate-pulse">
                  <div className="aspect-square rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                  </div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {(featuredProducts || []).map((prod: any) => {
                const mainImage = prod.images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60";
                return (
                  <div key={prod.id} className="group flex flex-col justify-between">
                    <Link href={`/product/${prod.slug}`} className="block relative aspect-square overflow-hidden rounded-2xl bg-white border dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                      <img
                        src={mainImage}
                        alt={prod.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>
                    <div className="mt-4 flex flex-col">
                      <span className="text-xs text-muted-foreground">{prod.brand?.name}</span>
                      <Link href={`/product/${prod.slug}`} className="font-semibold text-base mt-1 hover:underline line-clamp-1 text-foreground">
                        {prod.name}
                      </Link>
                      <div className="flex items-center space-x-2 mt-2">
                        {prod.discountPrice ? (
                          <>
                            <span className="font-bold text-sm text-foreground">{formatPrice(Number(prod.discountPrice))}</span>
                            <span className="text-xs line-through text-muted-foreground">{formatPrice(Number(prod.price))}</span>
                          </>
                        ) : (
                          <span className="font-bold text-sm text-foreground">{formatPrice(Number(prod.price))}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto py-24 px-6 text-center max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Stay updated</h2>
        <p className="text-muted-foreground mt-4 font-light">
          Subscribe to our newsletter to receive updates on new arrivals, exclusive discounts, and special collection launches.
        </p>
        <form className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email"
            className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
            required
            id="newsletter-email"
          />
          <Button type="submit" className="rounded-full px-6">
            Subscribe
          </Button>
        </form>
      </section>

      <Footer />
    </div>
  )
}
