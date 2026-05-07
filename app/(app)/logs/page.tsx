"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type LogEntry, listLogs } from "@/lib/api"

type Filter = "all" | "success" | "failed" | "running"

function formatDate(input?: string | null) {
  if (!input) return "—"
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDuration(ms: number) {
  if (!Number.isFinite(ms)) return "—"
  if (ms < 1000) return `${ms}ms`
  const s = ms / 1000
  if (s < 60) return `${s.toFixed(2)}s`
  const m = Math.floor(s / 60)
  const rs = (s % 60).toFixed(0)
  return `${m}m ${rs}s`
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")

  const load = async (current: Filter) => {
    setLoading(true)
    setError(null)
    try {
      const data = await listLogs({
        limit: 100,
        status: current === "all" ? undefined : current,
      })
      setLogs(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const summary = useMemo(() => {
    const total = logs.length
    const successes = logs.filter((l) => l.status === "success").length
    const failures = logs.filter((l) => l.status === "failed").length
    return { total, successes, failures }
  }, [logs])

  return (
    <>
      <PageHeader
        title="Logs"
        description="Every automation run, with status and duration."
        actions={
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => load(filter)} disabled={loading}>
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        }
      />

      <div className="px-6 py-6 md:px-8">
        {error && (
          <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
          <span>
            <span className="font-mono text-foreground">{summary.total}</span> entries
          </span>
          <span>
            <span className="font-mono text-emerald-300">{summary.successes}</span> succeeded
          </span>
          <span>
            <span className="font-mono text-red-300">{summary.failures}</span> failed
          </span>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Automation</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Duration</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center text-muted-foreground">
                      <Loader2 className="mx-auto size-4 animate-spin" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center text-sm text-muted-foreground">
                      No log entries yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{log.automationName}</span>
                          {log.message ? (
                            <span className="truncate font-mono text-xs text-muted-foreground">{log.message}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground tabular-nums">
                        {formatDuration(log.durationMs)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(log.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
