"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowUpRight, Activity, CheckCircle2, Loader2, PlayCircle } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  type Automation,
  type DashboardStats,
  type LogEntry,
  getDashboardStats,
  listAutomations,
  listLogs,
} from "@/lib/api"

function formatDate(input?: string | null) {
  if (!input) return "—"
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDuration(ms: number) {
  if (!Number.isFinite(ms)) return "—"
  if (ms < 1000) return `${ms}ms`
  const s = ms / 1000
  if (s < 60) return `${s.toFixed(1)}s`
  const m = Math.floor(s / 60)
  const rs = Math.round(s % 60)
  return `${m}m ${rs}s`
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [automations, setAutomations] = useState<Automation[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [s, a, l] = await Promise.all([
          getDashboardStats().catch(() => null),
          listAutomations().catch(() => [] as Automation[]),
          listLogs({ limit: 5 }).catch(() => [] as LogEntry[]),
        ])
        if (cancelled) return
        setStats(s)
        setAutomations(a)
        setLogs(l)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const activeCount = stats?.activeAutomations ?? automations.filter((a) => a.enabled).length
  const totalCount = stats?.totalAutomations ?? automations.length
  const successRate = stats?.successRate
  const runsToday = stats?.runsToday

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your automations and recent activity."
        actions={
          <Button asChild size="sm">
            <Link href="/automations/new">
              New automation
              <ArrowUpRight className="size-4" />
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

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Runs today"
            value={loading ? null : (runsToday ?? 0).toLocaleString()}
            hint={stats?.runsTrend != null ? `${stats.runsTrend > 0 ? "+" : ""}${stats.runsTrend}% vs yesterday` : "Last 24 hours"}
            icon={PlayCircle}
          />
          <StatCard
            label="Success rate"
            value={loading ? null : successRate != null ? `${Math.round(successRate * 100)}%` : "—"}
            hint="All-time across automations"
            icon={CheckCircle2}
          />
          <StatCard
            label="Active automations"
            value={loading ? null : activeCount.toString()}
            hint={`${totalCount} total`}
            icon={Activity}
          />
        </div>

        {/* Recent runs */}
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-base font-medium">Recent runs</h2>
              <p className="text-sm text-muted-foreground">The last few executions across all automations.</p>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/logs">
                View all
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Automation</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Duration</th>
                  <th className="px-4 py-3 text-left font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                      <Loader2 className="mx-auto size-4 animate-spin" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No runs yet. Create an automation to get started.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{log.automationName}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {formatDuration(log.durationMs)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(log.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string | null
  hint?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        {value === null ? (
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        ) : (
          <span className="font-mono text-2xl tracking-tight tabular-nums">{value}</span>
        )}
      </div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
