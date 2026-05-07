"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Clock, ExternalLink, Loader2, Play, Plus } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { type Automation, listAutomations, runAutomation, updateAutomation } from "@/lib/api"
import { toast } from "sonner"

function timeAgo(input?: string | null) {
  if (!input) return "Never"
  const d = new Date(input).getTime()
  if (Number.isNaN(d)) return "—"
  const diff = Date.now() - d
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function AutomationsPage() {
  const [items, setItems] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [runningId, setRunningId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await listAutomations()
        if (!cancelled) setItems(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load automations")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const onToggle = async (a: Automation, next: boolean) => {
    const prev = items
    setItems((cur) => cur.map((it) => (it.id === a.id ? { ...it, enabled: next } : it)))
    try {
      await updateAutomation(a.id, { enabled: next })
    } catch (e) {
      setItems(prev)
      toast.error(e instanceof Error ? e.message : "Failed to update automation")
    }
  }

  const onRun = async (a: Automation) => {
    setRunningId(a.id)
    try {
      await runAutomation(a.id)
      toast.success(`Triggered “${a.name}”`)
      setItems((cur) =>
        cur.map((it) => (it.id === a.id ? { ...it, lastRunStatus: "running", lastRunAt: new Date().toISOString() } : it)),
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to run automation")
    } finally {
      setRunningId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Automations"
        description="Manage your browser automations and trigger them on demand."
        actions={
          <Button asChild size="sm">
            <Link href="/automations/new">
              <Plus className="size-4" />
              New automation
            </Link>
          </Button>
        }
      />

      <div className="px-6 py-6 md:px-8">
        {error && (
          <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center rounded-lg border border-border bg-card py-20">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <ul className="divide-y divide-border">
              {items.map((a) => (
                <li key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{a.name}</span>
                      {a.lastRunStatus ? <StatusBadge status={a.lastRunStatus} /> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-mono">
                        <ExternalLink className="size-3" />
                        <span className="truncate">{a.url}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        Last run {timeAgo(a.lastRunAt)}
                      </span>
                      <span className="rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide">
                        {a.triggerType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={a.enabled}
                        onCheckedChange={(v) => onToggle(a, v)}
                        aria-label={`${a.enabled ? "Disable" : "Enable"} ${a.name}`}
                      />
                      <span className="text-xs text-muted-foreground">{a.enabled ? "Enabled" : "Disabled"}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRun(a)}
                      disabled={runningId === a.id}
                    >
                      {runningId === a.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          <Play className="size-3.5" />
                          Run
                        </>
                      )}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="flex size-10 items-center justify-center rounded-md border border-border bg-muted/40">
        <Play className="size-4 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-base font-medium">No automations yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground leading-relaxed">
        Create your first browser automation to scrape data, monitor sites, or run scheduled tasks.
      </p>
      <Button asChild size="sm" className="mt-6">
        <Link href="/automations/new">
          <Plus className="size-4" />
          New automation
        </Link>
      </Button>
    </div>
  )
}
