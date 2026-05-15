interface BandPillProps {
  band: number | null | undefined
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const COLORS: Record<number, string> = {
  9: 'bg-pink-100 text-pink-700 border-pink-200',
  8: 'bg-violet-100 text-violet-700 border-violet-200',
  7: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  6: 'bg-sky-100 text-sky-700 border-sky-200',
  5: 'bg-amber-100 text-amber-700 border-amber-200',
  4: 'bg-orange-100 text-orange-700 border-orange-200',
}

const SIZES = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-3 py-1',
}

export function BandPill({ band, size = 'md', label }: BandPillProps) {
  if (band == null) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border bg-surface-tertiary text-ink-tertiary border-surface-border font-semibold ${SIZES[size]}`}>
        {label ? `${label} —` : '—'}
      </span>
    )
  }
  const floor = Math.floor(band)
  const color = COLORS[floor] ?? COLORS[5]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold tabular-nums ${color} ${SIZES[size]}`}>
      {label && <span className="opacity-70 font-normal">{label}</span>}
      Band {band.toFixed(1)}
    </span>
  )
}
