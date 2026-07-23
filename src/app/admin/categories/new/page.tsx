"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Save } from "lucide-react"

export default function NewCategoryPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  // Form States
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [icon, setIcon] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [parentId, setParentId] = useState("")

  // Fetch Parent Categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await axios.get("/api/categories")
      return res.data || []
    }
  })

  // Create Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (newCategory: any) => {
      const res = await axios.post("/api/categories", newCategory)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
      router.push("/admin")
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Failed to create category")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    createCategoryMutation.mutate({
      name,
      description: description || null,
      image: image || null,
      icon: icon || null,
      isFeatured,
      parentId: parentId || null,
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin")} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Category</h1>
          <p className="text-xs text-muted-foreground">Define a new category to classify products.</p>
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
            <Label htmlFor="name" className="text-sm font-semibold text-foreground">Category Name</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Outerwear"
              className="text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentId" className="text-sm font-semibold text-foreground">Parent Category (Optional)</Label>
              <select
                id="parentId"
                value={parentId}
                onChange={e => setParentId(e.target.value)}
                className="w-full text-sm border dark:border-zinc-800 rounded-md p-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="">None (Top Level Category)</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon" className="text-sm font-semibold text-foreground">Icon Code (Optional)</Label>
              <Input
                id="icon"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                placeholder="e.g. jacket"
                className="text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-semibold text-foreground">Image URL (Optional)</Label>
            <Input
              id="image"
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="text-foreground"
            />
          </div>

          <div className="flex items-center space-x-3 bg-muted/20 p-4 rounded-xl border dark:border-zinc-800">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={e => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary bg-background dark:border-zinc-800"
            />
            <div className="space-y-0.5">
              <Label htmlFor="isFeatured" className="text-sm font-semibold text-foreground cursor-pointer">Featured Category</Label>
              <p className="text-[11px] text-muted-foreground">Highlight this category on home page banners and filters.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground">Description (Optional)</Label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Write a brief category bio..."
              className="w-full text-sm border dark:border-zinc-800 rounded-md p-2 min-h-24 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCategoryMutation.isPending}>
              {createCategoryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Category
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
