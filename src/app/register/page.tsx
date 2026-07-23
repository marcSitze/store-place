"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to create account")
        setLoading(false)
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white px-4">
      <div className="w-full max-w-md space-y-8 bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-widest text-white">
            AURA
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">Create Account</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sign up to track orders, manage addresses, and checkout faster.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-transparent border-zinc-800 text-white focus-visible:ring-zinc-700"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-transparent border-zinc-800 text-white focus-visible:ring-zinc-700"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-zinc-300">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-transparent border-zinc-800 text-white focus-visible:ring-zinc-700"
            />
          </div>

          <Button type="submit" className="w-full rounded-full bg-white text-black hover:bg-zinc-200" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
