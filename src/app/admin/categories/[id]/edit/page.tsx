"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Save } from "lucide-react"

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  // Form States
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [icon, setIcon] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [parentId, setParentId] = useState("")

  // Fetch Category details
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["admin-category", id],
    queryFn: async () => {
      const res = await axios.get(`/api/categories/${id}`)
      return res.data
    },
    enabled: !!id
  })

  // Fetch Parent Categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await axios.get("/api/categories")
      return res.data || []
    }
  })

  // Populates form states when category data is loaded
  useEffect(() => {
    if (category) {
      setName(category.name || "")
      setDescription(category.description || "")
      setImage(category.image || "")
      setIcon(category.icon || "")
      setIsFeatured(category.isFeatured || false)
      setParentId(category.parentId || "")
    }
  }, [category])

  // Update Category Mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (updatedCategory: any) => {
      const res = await axios.patch(`/api/categories/${id}`, updatedCategory)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
      queryClient.invalidateQueries({ queryKey: ["admin-category", id] })
      router.push("/admin")
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Failed to update category")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Cannot make category its own parent
    if (parentId === id) {
      setError("A category cannot be its own parent category")
      return
    }

    updateCategoryMutation.mutate({
      name,
      description: description || null,
      image: image || null,
      icon: icon || null,
      isFeatured,
      parentId: parentId || null,
    })
  }

  const isLoading = categoryLoading || categoriesLoading

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
        <p className="text-sm text-muted-foreground">Retrieving category record details...</p>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="text-center py-24 space-y-4 font-sans">
        <p className="text-sm text-destructive font-semibold">Category not found</p>
        <Button onClick={() => router.push("/admin")} variant="outline">
          Back to Admin Dashboard
        </Button>
      </div>
    )
  }

  // Filter out the current category so it doesn't appear in the parent selection list
  const filteredCategories = categories.filter((c: any) => c.id !== id)

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin")} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Edit Category</h1>
          <p className="text-xs text-muted-foreground">Modify category naming, image classification, or parental nesting.</p>
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
                {filteredCategories.map((c: any) => (
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
              className="w-full text-sm border dark:border-zinc-800 rounded-md p-2 min-h-24 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateCategoryMutation.isPending}>
              {updateCategoryMutation.isPending ? (
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
