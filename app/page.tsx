"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/api"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    router.replace(token ? "/dashboard" : "/login")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="size-2 animate-pulse rounded-full bg-foreground" aria-hidden />
      <span className="sr-only">Loading Flowra</span>
    </div>
  )
}
