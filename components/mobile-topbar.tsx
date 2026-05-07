"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, LayoutDashboard, LogOut, Plus, ScrollText, Workflow } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AuthUser } from "@/lib/api"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/automations", label: "Automations", icon: Activity },
  { href: "/logs", label: "Logs", icon: ScrollText },
]

export function MobileTopbar({
  user,
  onLogout,
}: {
  user: AuthUser | null
  onLogout: () => void
}) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col border-b border-border bg-background md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md border border-border bg-card">
            <Workflow className="size-4" />
          </div>
          <span className="font-mono text-sm">Flowra</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/automations/new">
              <Plus className="size-4" />
              New
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-2 py-1">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm whitespace-nowrap",
                active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
