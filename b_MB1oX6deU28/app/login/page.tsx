"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Workflow } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, register, setStoredUser, setToken } from "@/lib/api"
import { toast } from "sonner"

type Mode = "login" | "register"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res =
        mode === "login" ? await login(email, password) : await register(email, password, name || undefined)
      setToken(res.token)
      setStoredUser(res.user)
      toast.success(mode === "login" ? "Welcome back" : "Account created")
      router.push("/dashboard")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-12">
      {/* subtle grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-10 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md border border-border bg-card">
            <Workflow className="size-4" />
          </div>
          <span className="font-mono text-sm tracking-tight">Flowra</span>
        </div>

        <h1 className="text-balance text-2xl font-medium tracking-tight">
          {mode === "login" ? "Sign in to your workspace" : "Create your workspace"}
        </h1>
        <p className="mt-2 text-pretty text-sm text-muted-foreground leading-relaxed">
          {mode === "login"
            ? "Enter your credentials to access your automations."
            : "Get started in seconds. No credit card required."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          {mode === "register" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-xs font-normal text-muted-foreground">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-xs font-normal text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-xs font-normal text-muted-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={submitting}>
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Sign in" : "Create account"}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              {"Don't have an account? "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              {"Already have an account? "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
