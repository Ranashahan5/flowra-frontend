"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, LayoutDashboard, LogOut, Plus, ScrollText, Workflow } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { AuthUser } from "@/lib/api"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/automations", label: "Automations", icon: Activity },
  { href: "/logs", label: "Logs", icon: ScrollText },
]

export function AppSidebar({
  user,
  onLogout,
}: {
  user: AuthUser | null
  onLogout: () => void
}) {
  const pathname = usePathname()
  const initials = (user?.name || user?.email || "A").slice(0, 2).toUpperCase()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-7 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent">
          <Workflow className="size-4 text-sidebar-foreground" />
        </div>
        <span className="font-mono text-sm tracking-tight text-sidebar-foreground">Flowra</span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <Button asChild size="sm" className="mb-2 justify-start gap-2">
          <Link href="/automations/new">
            <Plus className="size-4" />
            New automation
          </Link>
        </Button>

        <nav className="flex flex-col gap-0.5">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent/60">
              <Avatar className="size-7">
                <AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-sidebar-foreground">{user?.name || "Account"}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email || "—"}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm">{user?.name || "Account"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="gap-2">
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
