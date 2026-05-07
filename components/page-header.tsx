import type React from "react"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border px-6 py-6 sm:flex-row sm:items-end sm:justify-between md:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-balance text-xl font-medium tracking-tight">{title}</h1>
        {description ? (
          <p className="text-pretty text-sm text-muted-foreground leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
