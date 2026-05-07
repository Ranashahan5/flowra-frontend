"use client"

import type React from "react"

import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileTopbar } from "@/components/mobile-topbar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar user={user} onLogout={logout} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopbar user={user} onLogout={logout} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
