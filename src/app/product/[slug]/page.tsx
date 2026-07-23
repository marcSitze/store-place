"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductDetails } from "@/features/products/components/product-details"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { use } from "react"

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  // Fetch product by slug
  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await axios.get(`/api/products/slug/${slug}`);
      return res.data;
    }
  });

  // Fetch related products
  const { data: relatedData, isLoading: relatedLoading } = useQuery({
    queryKey: ["related-products", product?.categoryId],
    enabled: !!product?.categoryId,
    queryFn: async () => {
      const res = await axios.get(`/api/products?categoryId=${product.categoryId}&limit=5`);
      return res.data?.products || [];
    }
  });

  const related = relatedData || [];
  const filteredRelated = related.filter((p: any) => p.id !== product?.id).slice(0, 4);

  if (productLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
          <p className="text-sm text-muted-foreground">Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center p-6">
          <h2 className="text-xl font-semibold">Product Not Found</h2>
          <p className="text-sm text-muted-foreground">The product you are looking for does not exist or has been removed.</p>
          <Link href="/shop">
            <Button variant="outline">Back to Shop</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="container mx-auto px-4 py-8 sm:px-6 flex-1">
        <ProductDetails product={product} />

        {relatedLoading ? (
          <div className="mt-24 border-t dark:border-zinc-800 pt-16 flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : filteredRelated.length > 0 && (
          <section className="mt-24 border-t dark:border-zinc-800 pt-16">
            <h2 className="text-2xl font-bold tracking-tight mb-8 text-foreground">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredRelated.map((prod: any) => {
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
          </section>
        )}
      </div>
      <Footer />
    </div>
  )
}
import { Button } from "@/components/ui/button"
