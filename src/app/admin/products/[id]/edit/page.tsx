"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Save } from "lucide-react"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  // Form States
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [brandId, setBrandId] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [color, setColor] = useState("Standard")
  const [size, setSize] = useState("M")
  const [stock, setStock] = useState("50")

  // Fetch Product details
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      const res = await axios.get(`/api/products/${id}`)
      return res.data
    },
    enabled: !!id
  })

  // Fetch Categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await axios.get("/api/categories")
      return res.data || []
    }
  })

  // Fetch Brands
  const { data: brands = [], isLoading: brandsLoading } = useQuery<any[]>({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      const res = await axios.get("/api/brands")
      return res.data || []
    }
  })

  // Populates form states when product data is successfully fetched
  useEffect(() => {
    if (product) {
      setName(product.name || "")
      setDescription(product.description || "")
      setShortDescription(product.shortDescription || "")
      setPrice(String(product.price || ""))
      setCategoryId(product.categoryId || "")
      setBrandId(product.brandId || "")
      setImageUrl(product.images?.[0]?.url || "")
      setColor(product.variants?.[0]?.color || "Standard")
      setSize(product.variants?.[0]?.size || "M")
      setStock(String(product.variants?.[0]?.stock || "0"))
    }
  }, [product])

  // Update Product Mutation
  const updateProductMutation = useMutation({
    mutationFn: async (updatedProduct: any) => {
      const res = await axios.patch(`/api/products/${id}`, updatedProduct)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] })
      router.push("/admin")
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Failed to update product")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!categoryId) {
      setError("Please select a category")
      return
    }
    if (!brandId) {
      setError("Please select a brand")
      return
    }

    updateProductMutation.mutate({
      name,
      description,
      shortDescription,
      price: parseFloat(price),
      categoryId,
      brandId,
      status: "PUBLISHED",
      images: [{ url: imageUrl, alt: name }],
      variants: [{
        sku: product?.variants?.[0]?.sku || `SKU-${name.substring(0,3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        price: parseFloat(price),
        stock: parseInt(stock),
        color,
        size
      }]
    })
  }

  const isLoading = productLoading || categoriesLoading || brandsLoading

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
        <p className="text-sm text-muted-foreground">Retrieving product record details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-24 space-y-4 font-sans">
        <p className="text-sm text-destructive font-semibold">Product not found</p>
        <Button onClick={() => router.push("/admin")} variant="outline">
          Back to Admin Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin")} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Edit Product</h1>
          <p className="text-xs text-muted-foreground">Modify catalog features, pricing, and stock variants.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/10 border dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-xs font-semibold mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground">Product Name</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold text-foreground">Category</Label>
              <select
                id="category"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full text-sm border dark:border-zinc-800 rounded-md p-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-sm font-semibold text-foreground">Brand</Label>
              <select
                id="brand"
                value={brandId}
                onChange={e => setBrandId(e.target.value)}
                className="w-full text-sm border dark:border-zinc-800 rounded-md p-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                {brands.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold text-foreground">Price ($)</Label>
              <Input
                id="price"
                required
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-sm font-semibold text-foreground">Stock Quantity</Label>
              <Input
                id="stock"
                required
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(e.target.value)}
                className="text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-semibold text-foreground">Image URL</Label>
            <Input
              id="imageUrl"
              required
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color" className="text-sm font-semibold text-foreground">Color Variant</Label>
              <Input
                id="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size" className="text-sm font-semibold text-foreground">Size Variant</Label>
              <Input
                id="size"
                value={size}
                onChange={e => setSize(e.target.value)}
                className="text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription" className="text-sm font-semibold text-foreground">Short Description</Label>
            <Input
              id="shortDescription"
              required
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              className="text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground">Full Description</Label>
            <textarea
              id="description"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-sm border dark:border-zinc-800 rounded-md p-2 min-h-24 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
