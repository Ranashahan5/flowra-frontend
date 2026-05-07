import { cn } from "@/lib/utils"

type Status = "success" | "failed" | "running" | "idle"

const styles: Record<Status, { dot: string; text: string; ring: string }> = {
  success: {
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    ring: "ring-emerald-400/20",
  },
  failed: {
    dot: "bg-red-400",
    text: "text-red-300",
    ring: "ring-red-400/20",
  },
  running: {
    dot: "bg-amber-400 animate-pulse",
    text: "text-amber-300",
    ring: "ring-amber-400/20",
  },
  idle: {
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    ring: "ring-border",
  },
}

const labels: Record<Status, string> = {
  success: "Success",
  failed: "Failed",
  running: "Running",
  idle: "Idle",
}

export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const s = styles[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-card px-2 py-0.5 text-xs font-medium ring-1",
        s.text,
        s.ring,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden />
      {label ?? labels[status]}
    </span>
  )
}
