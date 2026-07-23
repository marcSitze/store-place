"use client"

import { useState } from "react"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, ShoppingBag, FolderTree, ListOrdered, PlusCircle, Pencil, Trash2, ArrowUpRight, BarChart3, AlertTriangle, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import axios from "axios"

export function AdminDashboard() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "categories" | "orders">("overview")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { data: session } = authClient.useSession()

  // Fetch all dashboard data using React Query
  const { data: productsData, isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await axios.get("/api/products?status=PUBLISHED&limit=100")
      return res.data?.products || []
    }
  })

  const { data: orders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await axios.get("/api/orders")
      return res.data || []
    }
  })

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await axios.get("/api/categories")
      return res.data || []
    }
  })

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
    },
    onError: () => {
      alert("Failed to delete product")
    }
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
    },
    onError: () => {
      alert("Failed to delete category")
    }
  })

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await axios.patch(`/api/orders/${orderId}`, { status })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
    },
    onError: () => {
      alert("Failed to update status")
    }
  })

  const handleDeleteProduct = (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    deleteProductMutation.mutate(id)
  }

  const handleDeleteCategory = (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    deleteCategoryMutation.mutate(id)
  }

  const handleUpdateStatus = (orderId: string, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status })
  }

  const isLoading = productsLoading || ordersLoading || categoriesLoading
  const products = productsData || []

  // Overview metrics
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0)
  const totalOrders = orders.length
  const totalProducts = products.length
  const lowStockCount = products.filter((p: any) => p.variants?.some((v: any) => v.stock < 10)).length

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
        <p className="text-sm text-muted-foreground">Syncing control center statistics...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-300">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className={`hidden lg:flex flex-shrink-0 flex-col justify-between border-r dark:border-zinc-800 sticky top-24 h-[calc(100vh-10rem)] transition-all duration-300 ${isCollapsed ? "w-20 pr-0" : "w-64 pr-6"}`}>
        <div className="space-y-6">
          <div className={`flex items-center justify-between px-3 ${isCollapsed ? "flex-col gap-2" : ""}`}>
            {!isCollapsed && (
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Navigation</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[#0077B6]/5"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          
          <nav className="space-y-1.5">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "products", label: "Products", icon: ShoppingBag },
              { id: "categories", label: "Categories", icon: FolderTree },
              { id: "orders", label: "Orders", icon: ListOrdered },
            ].map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all duration-200 group relative border border-transparent ${
                    isCollapsed ? "justify-center py-3 px-0" : "space-x-3 px-4 py-3"
                  } ${
                    isActive 
                      ? "bg-[#03045E]/10 dark:bg-[#03045E]/20 text-[#0077B6] border-[#00B4D8]/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-[#0077B6]/5"
                  }`}
                >
                  {/* Left Indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-[#00B4D8]" />
                  )}
                  <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? "text-[#00B4D8]" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              )
            })}
          </nav>
        </div>
        
        {session?.user && (
          <div className={`border-t dark:border-zinc-800 pt-4 flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
            <div className="h-9 w-9 rounded-full flex-shrink-0 bg-[#03045E] border border-[#00B4D8] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {session.user.name?.substring(0, 2).toUpperCase() || "AD"}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">{session.user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{session.user.email}</p>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* MOBILE TOP NAVIGATION BAR */}
      <div className="lg:hidden flex overflow-x-auto bg-muted/30 p-1.5 rounded-xl gap-1.5 scrollbar-none border dark:border-zinc-800">
        {[
          { id: "overview", label: "Overview", icon: LayoutDashboard },
          { id: "products", label: "Products", icon: ShoppingBag },
          { id: "categories", label: "Categories", icon: FolderTree },
          { id: "orders", label: "Orders", icon: ListOrdered },
        ].map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive 
                  ? "bg-[#03045E] text-white shadow-sm border border-[#00B4D8]/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-[#0077B6]/5"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-[#00B4D8]" : ""}`} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* WORKSPACE AREA */}
      <main className="flex-1 min-w-0">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow duration-300 border dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Total Revenue</CardTitle>
                  <BarChart3 className="h-4 w-4 text-[#0077B6]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground mt-1">+12.5% from last week</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-300 border dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Total Orders</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-[#0077B6]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{totalOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">Pending fulfillment</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-300 border dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Active Products</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-[#0077B6]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
                  <p className="text-xs text-muted-foreground mt-1">Sourced items</p>
                </CardContent>
              </Card>

              <Card className={`hover:shadow-md transition-shadow duration-300 border ${lowStockCount > 0 ? "border-amber-500/50 bg-amber-500/5" : "dark:border-zinc-800"}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Low Stock Alert</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{lowStockCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Products below 10 units</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders Overview */}
            <div className="border border-zinc-200/60 dark:border-zinc-850 rounded-2xl bg-white dark:bg-zinc-900/10 space-y-4 shadow-sm overflow-hidden">
              <div className="px-6 pt-6">
                <h3 className="font-bold text-lg text-foreground">Recent Orders</h3>
              </div>
              <Table>
                <TableHeader className="bg-[#03045E]/5 dark:bg-[#03045E]/10">
                  <TableRow className="border-b border-zinc-100 dark:border-zinc-800/80">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Order</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Customer</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Total</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 5).map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800/80">
                      <TableCell className="font-semibold text-foreground py-4 px-6">{order.orderNumber}</TableCell>
                      <TableCell className="text-foreground py-4 px-6">{order.user?.name || "Guest"}</TableCell>
                      <TableCell className="text-foreground py-4 px-6">{formatPrice(Number(order.total))}</TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge className={`border-none rounded-full px-3 py-1 text-xs font-semibold ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-foreground font-sans">Product Catalog</h3>
              <Button 
                onClick={() => router.push("/admin/products/new")} 
                className="rounded-full bg-[#0077B6] hover:bg-[#0077B6]/90 text-white shadow-sm"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Product
              </Button>
            </div>

            <div className="border border-zinc-200/60 dark:border-zinc-850 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/10 shadow-sm">
              <Table>
                <TableHeader className="bg-[#03045E]/5 dark:bg-[#03045E]/10">
                  <TableRow className="border-b border-zinc-100 dark:border-zinc-800/80">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Product</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Brand</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Category</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Price</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Total Stock</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((prod: any) => {
                    const totalStock = prod.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0
                    return (
                      <TableRow key={prod.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800/80">
                        <TableCell className="font-semibold text-foreground py-4 px-6">{prod.name}</TableCell>
                        <TableCell className="text-foreground py-4 px-6">{prod.brand?.name}</TableCell>
                        <TableCell className="text-foreground py-4 px-6">{prod.category?.name}</TableCell>
                        <TableCell className="text-foreground py-4 px-6">{formatPrice(Number(prod.price))}</TableCell>
                        <TableCell className="text-foreground py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            totalStock < 15 
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                              : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                          }`}>
                            {totalStock} units
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-4 px-6 space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/products/${prod.id}/edit`)}
                            className="text-muted-foreground hover:text-[#0077B6] h-8 w-8 rounded-full"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-full"
                            disabled={deleteProductMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-foreground font-sans">Product Categories</h3>
              <Button 
                onClick={() => router.push("/admin/categories/new")} 
                className="rounded-full bg-[#0077B6] hover:bg-[#0077B6]/90 text-white shadow-sm"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Category
              </Button>
            </div>

            <div className="border border-zinc-200/60 dark:border-zinc-850 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/10 shadow-sm">
              <Table>
                <TableHeader className="bg-[#03045E]/5 dark:bg-[#03045E]/10">
                  <TableRow className="border-b border-zinc-100 dark:border-zinc-800/80">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Category</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Slug</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Description</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Featured status</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat: any) => (
                    <TableRow key={cat.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800/80">
                      <TableCell className="font-semibold text-foreground flex items-center space-x-3 py-4 px-6">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="h-8 w-8 rounded-lg object-cover border dark:border-zinc-800" />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border dark:border-zinc-800">
                            {cat.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span>{cat.name}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs py-4 px-6">{cat.slug}</TableCell>
                      <TableCell className="text-foreground max-w-xs truncate py-4 px-6">{cat.description || "-"}</TableCell>
                      <TableCell className="py-4 px-6">
                        {cat.isFeatured ? (
                          <Badge className="border-none rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#00B4D8]/10 text-[#0077B6] dark:text-[#00B4D8]">Featured</Badge>
                        ) : (
                          <Badge className="border-none rounded-full px-2.5 py-0.5 text-xs font-semibold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400">Standard</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-4 px-6 space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/categories/${cat.id}/edit`)}
                          className="text-muted-foreground hover:text-[#0077B6] h-8 w-8 rounded-full"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-full"
                          disabled={deleteCategoryMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="font-bold text-lg text-foreground font-sans">Customer Orders</h3>
            
            <div className="border border-zinc-200/60 dark:border-zinc-850 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/10 shadow-sm">
              <Table>
                <TableHeader className="bg-[#03045E]/5 dark:bg-[#03045E]/10">
                  <TableRow className="border-b border-zinc-100 dark:border-zinc-800/80">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Order</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Customer</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Purchased Items</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Total</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6">Status</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800/80">
                      <TableCell className="font-semibold text-foreground py-4 px-6">{order.orderNumber}</TableCell>
                      <TableCell className="text-foreground font-sans py-4 px-6">
                        <p className="font-medium">{order.user?.name || "Guest"}</p>
                        <p className="text-xs text-muted-foreground">{order.user?.email || order.shippingAddress?.phone}</p>
                      </TableCell>
                      <TableCell className="text-foreground max-w-xs font-sans py-4 px-6">
                        <div className="text-xs space-y-1">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="line-clamp-1 text-muted-foreground">
                              • {item.variant?.product?.name} ({item.variant?.color || "Standard"} / {item.variant?.size || "OS"}) x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground font-bold py-4 px-6">{formatPrice(Number(order.total))}</TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge className={`border-none rounded-full px-3 py-1 text-xs font-semibold ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : order.status === "PAID"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : order.status === "CANCELLED"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-4 px-6">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="text-xs border border-zinc-200 dark:border-zinc-800 rounded-md p-1.5 bg-background text-foreground focus:ring-1 focus:ring-[#00B4D8]"
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          <option value="PAID">Paid</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
