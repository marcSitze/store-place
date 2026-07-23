"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Home, Loader2 } from "lucide-react"
import { useEffect } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  useEffect(() => {
    if (!sessionLoading && (!session || (session.user as any).role !== "ADMIN")) {
      router.push("/login?callbackUrl=/admin");
    }
  }, [session, sessionLoading, router]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
        <p className="text-sm text-muted-foreground">Loading admin settings...</p>
      </div>
    );
  }

  if (!session || (session.user as any).role !== "ADMIN") {
    return null; // redirecting
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/85 sticky top-0 z-40 backdrop-blur-md dark:border-zinc-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-6 font-sans">
            <span className="font-bold tracking-widest text-lg text-foreground">AURA ADMIN</span>
            <span className="bg-zinc-850 dark:bg-zinc-800 text-[10px] tracking-wider text-zinc-300 font-bold px-2.5 py-1 rounded-full">SYSTEM STAGING</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/">
              <span className="flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer transition-colors">
                <Home className="h-4 w-4" />
                <span>Storefront</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:px-6 flex-1">
        {children}
      </main>
    </div>
  )
}
