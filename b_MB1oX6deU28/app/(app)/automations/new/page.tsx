"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createAutomation } from "@/lib/api"
import { toast } from "sonner"

const SCHEDULE_PRESETS: { value: string; label: string }[] = [
  { value: "*/5 * * * *", label: "Every 5 minutes" },
  { value: "0 * * * *", label: "Hourly" },
  { value: "0 */6 * * *", label: "Every 6 hours" },
  { value: "0 0 * * *", label: "Daily at midnight" },
  { value: "0 9 * * 1-5", label: "Weekdays at 9:00 AM" },
]

export default function NewAutomationPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [triggerType, setTriggerType] = useState<"manual" | "schedule">("manual")
  const [schedule, setSchedule] = useState(SCHEDULE_PRESETS[0].value)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createAutomation({
        name: name.trim(),
        url: url.trim(),
        triggerType,
        schedule: triggerType === "schedule" ? schedule : undefined,
      })
      toast.success("Automation created")
      router.push("/automations")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create automation")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="New automation"
        description="Configure a target URL and choose how it should run."
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/automations">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="px-6 py-8 md:px-8">
        <form onSubmit={onSubmit} className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-border bg-card">
            <div className="flex flex-col gap-6 p-6">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-xs font-normal text-muted-foreground">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Scrape pricing page"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={80}
                />
                <p className="text-xs text-muted-foreground">A short label so you can identify this automation later.</p>
              </div>

              {/* URL */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="url" className="text-xs font-normal text-muted-foreground">
                  Target URL
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">The page the headless browser will navigate to.</p>
              </div>

              {/* Trigger */}
              <div className="flex flex-col gap-3">
                <Label className="text-xs font-normal text-muted-foreground">Trigger</Label>
                <RadioGroup
                  value={triggerType}
                  onValueChange={(v) => setTriggerType(v as "manual" | "schedule")}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <TriggerOption
                    value="manual"
                    title="Manual"
                    description="Run on demand from the dashboard or API."
                    selected={triggerType === "manual"}
                  />
                  <TriggerOption
                    value="schedule"
                    title="Schedule"
                    description="Run automatically on a recurring schedule."
                    selected={triggerType === "schedule"}
                  />
                </RadioGroup>
              </div>

              {triggerType === "schedule" && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="schedule" className="text-xs font-normal text-muted-foreground">
                    Schedule
                  </Label>
                  <Select value={schedule} onValueChange={setSchedule}>
                    <SelectTrigger id="schedule">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHEDULE_PRESETS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <span className="flex items-center gap-3">
                            <span>{p.label}</span>
                            <span className="font-mono text-xs text-muted-foreground">{p.value}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">All schedules are evaluated in UTC.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-6 py-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/automations">Cancel</Link>
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating
                  </>
                ) : (
                  "Create automation"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

function TriggerOption({
  value,
  title,
  description,
  selected,
}: {
  value: string
  title: string
  description: string
  selected: boolean
}) {
  return (
    <Label
      htmlFor={`trigger-${value}`}
      data-selected={selected}
      className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-accent/40 data-[selected=true]:border-foreground/40 data-[selected=true]:bg-accent/40"
    >
      <RadioGroupItem id={`trigger-${value}`} value={value} className="mt-0.5" />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground leading-relaxed">{description}</span>
      </div>
    </Label>
  )
}
