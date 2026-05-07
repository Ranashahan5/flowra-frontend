"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { clearToken, getStoredUser, getToken, type AuthUser } from "@/lib/api"

export function useAuth(options: { redirectTo?: string } = {}) {
  const { redirectTo = "/login" } = options
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace(redirectTo)
      return
    }
    setUser(getStoredUser())
    setLoading(false)
  }, [router, redirectTo])

  const logout = () => {
    clearToken()
    router.replace("/login")
  }

  return { user, loading, logout }
}
