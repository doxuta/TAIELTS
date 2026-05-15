'use client'

import { Flame, Snowflake } from 'lucide-react'

interface StreakBadgeProps {
  currentStreak: number
  longestStreak?: number
  freezeCount?: number
  size?: 'sm' | 'md' | 'lg'
}

export function StreakBadge({ currentStreak, longestStreak, freezeCount, size = 'md' }: StreakBadgeProps) {
  const isActive = currentStreak > 0
  const flameColor = currentStreak >= 30 ? 'text-pink-500' : currentStreak >= 7 ? 'text-amber-500' : 'text-orange-500'
  const sizing = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base'
  const iconSize = size === 'lg' ? 'w-7 h-7' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`relative ${isActive ? 'animate-pulse-slow' : 'opacity-40'}`}>
        <Flame className={`${iconSize} ${flameColor}`} fill="currentColor" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`${sizing} font-display font-bold tabular-nums ${isActive ? 'text-ink' : 'text-ink-tertiary'}`}>
          {currentStreak}
        </span>
        <span className="text-xs text-ink-tertiary">ngày</span>
      </div>
      {longestStreak != null && longestStreak > currentStreak && size === 'lg' && (
        <span className="text-xs text-ink-placeholder ml-2">Kỷ lục: {longestStreak}</span>
      )}
      {freezeCount != null && freezeCount > 0 && (
        <div className="flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded-md bg-sky-50 border border-sky-200">
          <Snowflake className="w-3 h-3 text-sky-600" />
          <span className="text-[10px] font-semibold text-sky-700 tabular-nums">{freezeCount}</span>
        </div>
      )}
    </div>
  )
}
