"use client"

import { useState } from "react"
import { useCartStore } from "@/features/cart/store/cart-store"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Shield, Truck, RotateCcw, Check } from "lucide-react"

interface ProductDetailsProps {
  product: any;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const addItem = useCartStore((state) => state.addItem)
  
  // Gallery active image
  const [activeImage, setActiveImage] = useState(product.images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60")
  
  // Variant Selection State
  const [selectedColor, setSelectedColor] = useState<string | null>(product.variants[0]?.color || null)
  const [selectedSize, setSelectedSize] = useState<string | null>(product.variants[0]?.size || null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  // Find variant matching selected attributes
  const currentVariant = product.variants.find((v: any) => {
    const colorMatch = !selectedColor || v.color === selectedColor
    const sizeMatch = !selectedSize || v.size === selectedSize
    return colorMatch && sizeMatch
  }) || product.variants[0]

  const activePrice = currentVariant?.discountPrice ?? currentVariant?.price ?? product.discountPrice ?? product.price
  const originalPrice = currentVariant?.discountPrice ? (currentVariant?.price ?? product.price) : (product.discountPrice ? product.price : null)
  const stock = currentVariant?.stock ?? 0

  const handleAddToCart = () => {
    if (!currentVariant || stock <= 0) return

    addItem({
      id: currentVariant.id,
      productId: product.id,
      name: product.name,
      image: product.images[0]?.url || activeImage,
      price: Number(currentVariant.price ?? product.price),
      discountPrice: currentVariant.discountPrice ? Number(currentVariant.discountPrice) : (product.discountPrice ? Number(product.discountPrice) : undefined),
      color: currentVariant.color || undefined,
      size: currentVariant.size || undefined,
      sku: currentVariant.sku,
      stock: stock
    }, quantity)

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // Get unique colors and sizes available
  const colors = Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean))) as string[]
  const sizes = Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean))) as string[]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-8">
      {/* Product Gallery */}
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-2xl border bg-white shadow-sm">
          <img
            src={activeImage}
            alt={product.name}
            className="w-full h-full object-cover transition-all hover:scale-105 duration-300"
          />
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images.map((img: any, idx: number) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveImage(img.url)}
                className={`w-20 h-20 rounded-md overflow-hidden border-2 ${activeImage === img.url ? "border-primary" : "border-transparent"}`}
              >
                <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-col justify-between space-y-6">
        <div>
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{product.brand?.name}</span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mt-2">{product.name}</h1>
          
          <div className="flex items-baseline space-x-3 mt-4">
            <span className="text-2xl font-bold text-foreground">{formatPrice(Number(activePrice))}</span>
            {originalPrice && (
              <span className="text-sm line-through text-muted-foreground">{formatPrice(Number(originalPrice))}</span>
            )}
          </div>
          
          <p className="text-muted-foreground mt-6 text-sm leading-relaxed">{product.description}</p>
        </div>

        {/* Variant Selectors */}
        <div className="space-y-4 pt-4 border-t">
          {colors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Color</h3>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${selectedColor === color ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent text-foreground"}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Size</h3>
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${selectedSize === size ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent text-foreground"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Quantity</h3>
            <div className="flex items-center space-x-3">
              <button
                disabled={quantity <= 1}
                onClick={() => setQuantity(q => q - 1)}
                className="w-8 h-8 rounded-full border flex items-center justify-center text-sm disabled:opacity-50 text-foreground"
              >
                -
              </button>
              <span className="text-sm font-semibold text-foreground w-6 text-center">{quantity}</span>
              <button
                disabled={quantity >= stock}
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-full border flex items-center justify-center text-sm disabled:opacity-50 text-foreground"
              >
                +
              </button>
              <span className="text-xs text-muted-foreground pl-2">
                {stock > 0 ? `${stock} available` : "Out of stock"}
              </span>
            </div>
          </div>
        </div>

        {/* Add to Cart button */}
        <div className="pt-4 space-y-4">
          <Button
            size="lg"
            className="w-full rounded-full"
            disabled={stock <= 0}
            onClick={handleAddToCart}
          >
            {added ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added to Cart
              </>
            ) : stock > 0 ? (
              "Add to Cart"
            ) : (
              "Out of Stock"
            )}
          </Button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground pt-4">
            <div className="flex flex-col items-center">
              <Truck className="h-4 w-4 mb-1" />
              <span>Free Delivery</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="h-4 w-4 mb-1" />
              <span>30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="h-4 w-4 mb-1" />
              <span>Secure Warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
