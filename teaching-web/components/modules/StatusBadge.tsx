import { cn } from '@/lib/utils'
import { moduleStatusLabel } from '@/lib/modules'

const COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
  IN_REVIEW: 'bg-amber-100 text-amber-700 border-amber-200',
  PUBLISHED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ARCHIVED: 'bg-zinc-100 text-zinc-600 border-zinc-200',
}

export function ModuleStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        COLORS[status] ?? COLORS.DRAFT,
        className
      )}
    >
      {moduleStatusLabel(status)}
    </span>
  )
}
