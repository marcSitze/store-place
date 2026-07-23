"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"

function ShopContent() {
  const searchParams = useSearchParams();
  
  const currentCategorySlug = searchParams.get("category") || "";
  const query = searchParams.get("query") || "";
  const sortBy = searchParams.get("sortBy") || "created_at_desc";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const page = searchParams.get("page") || "1";

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get("/api/categories");
      return res.data || [];
    }
  });

  const activeCategory = categories.find((c: any) => c.slug === currentCategorySlug);

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products", activeCategory?.id, query, sortBy, minPrice, maxPrice, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory?.id) params.set("categoryId", activeCategory.id);
      if (query) params.set("query", query);
      if (sortBy) params.set("sortBy", sortBy);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      params.set("page", page);
      params.set("limit", "12");

      const res = await axios.get(`/api/products?${params.toString()}`);
      return res.data;
    }
  });

  const products = productsData?.products || [];
  const pages = productsData?.pages || 1;
  const total = productsData?.total || 0;

  // Build navigation helper links
  const getFilterUrl = (opts: { category?: string | null; sortBy?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (opts.category !== undefined) {
      if (opts.category === null) params.delete("category");
      else params.set("category", opts.category);
    }
    if (opts.sortBy) params.set("sortBy", opts.sortBy);
    if (opts.page) params.set("page", opts.page.toString());
    else params.delete("page"); // reset pagination on filter change
    return `/shop?${params.toString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="container mx-auto px-4 py-8 sm:px-6 flex-1">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b dark:border-zinc-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Shop All Products</h1>
            {productsLoading ? (
              <p className="text-sm text-muted-foreground mt-2">Loading products...</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">Showing {products.length} of {total} products</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="space-y-6">
            <div>
              <h3 className="font-semibold text-sm mb-3 text-foreground">Categories</h3>
              {categoriesLoading ? (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading categories...</span>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 text-sm">
                  <Link
                    href={getFilterUrl({ category: null })}
                    className={`hover:underline transition-colors ${!currentCategorySlug ? "font-bold text-foreground" : "text-muted-foreground"}`}
                  >
                    All Categories
                  </Link>
                  {categories.map((cat: any) => (
                    <Link
                      key={cat.id}
                      href={getFilterUrl({ category: cat.slug })}
                      className={`hover:underline transition-colors ${currentCategorySlug === cat.slug ? "font-bold text-foreground" : "text-muted-foreground"}`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 text-foreground">Sort By</h3>
              <div className="flex flex-col space-y-2 text-sm font-medium">
                <Link
                  href={getFilterUrl({ sortBy: "created_at_desc" })}
                  className={`hover:underline transition-colors ${sortBy === "created_at_desc" ? "font-bold text-foreground" : "text-muted-foreground"}`}
                >
                  Newest
                </Link>
                <Link
                  href={getFilterUrl({ sortBy: "price_asc" })}
                  className={`hover:underline transition-colors ${sortBy === "price_asc" ? "font-bold text-foreground" : "text-muted-foreground"}`}
                >
                  Price: Low to High
                </Link>
                <Link
                  href={getFilterUrl({ sortBy: "price_desc" })}
                  className={`hover:underline transition-colors ${sortBy === "price_desc" ? "font-bold text-foreground" : "text-muted-foreground"}`}
                >
                  Price: High to Low
                </Link>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="flex flex-col space-y-4 animate-pulse">
                    <div className="aspect-square rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                    </div>
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 border dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/10">
                <h3 className="text-lg font-semibold text-foreground">No products found</h3>
                <p className="text-muted-foreground mt-1">Try clearing your filters or search terms.</p>
                <Link href="/shop">
                  <Button className="mt-4" variant="outline">Reset Filters</Button>
                </Link>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((prod: any) => {
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

                {pages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-16">
                    {Array.from({ length: pages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const active = parseInt(page) === pageNum;
                      return (
                        <Link
                          key={pageNum}
                          href={getFilterUrl({ page: pageNum })}
                        >
                          <Button variant={active ? "default" : "outline"} size="sm" className="h-8 w-8 p-0 rounded-md">
                            {pageNum}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
          <p className="text-sm text-muted-foreground">Loading catalog...</p>
        </div>
        <Footer />
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
