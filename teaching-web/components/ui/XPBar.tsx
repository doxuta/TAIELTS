'use client'

import { Zap } from 'lucide-react'

interface XPBarProps {
  totalXP: number
  level: number
  xpInLevel: number
  xpForNext: number
  percent: number
  compact?: boolean
}

export function XPBar({ totalXP, level, xpInLevel, xpForNext, percent, compact = false }: XPBarProps) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
          {level}
        </div>
        <div className="flex-1 min-w-[80px] h-1.5 bg-surface-border rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-violet-600 transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-xs text-ink-tertiary tabular-nums">{totalXP} XP</span>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-md">
            {level}
          </div>
          <div>
            <p className="text-xs text-ink-tertiary uppercase tracking-wider">Cấp độ</p>
            <p className="text-sm font-semibold text-ink">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200">
            <Zap className="w-3 h-3 text-amber-600" fill="currentColor" />
            <span className="text-xs font-bold text-amber-700 tabular-nums">{totalXP.toLocaleString()} XP</span>
          </div>
        </div>
      </div>
      <div className="h-2 bg-surface-border rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand-500 to-violet-600 transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-[10px] text-ink-tertiary text-right mt-1 tabular-nums">
        {xpInLevel} / {xpForNext} đến Level {level + 1}
      </p>
    </div>
  )
}
