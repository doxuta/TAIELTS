'use client'

import { ROADMAP_MONTHS } from '@/lib/utils'
import { CheckCircle2, Circle, Lock } from 'lucide-react'

interface RoadmapTimelineProps {
  currentMonth: number
  currentWeek: number
}

const QUARTERS = [
  { q: 1, label: 'Quý 1', months: [1, 2, 3], milestone: 'Thì cơ bản + viết đoạn ngắn + nói 90s' },
  { q: 2, label: 'Quý 2', months: [4, 5, 6], milestone: 'Passive + Conditional + đọc 350 từ' },
  { q: 3, label: 'Quý 3', months: [7, 8, 9], milestone: 'Liên kết đoạn + nói có outline' },
  { q: 4, label: 'Quý 4', months: [10, 11, 12], milestone: 'Tổng kết + chốt định hướng Năm 2' },
]

export function RoadmapTimeline({ currentMonth, currentWeek }: RoadmapTimelineProps) {
  return (
    <div className="space-y-8">
      {QUARTERS.map((quarter) => (
        <div key={quarter.q}>
          {/* Quarter header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
              ${quarter.months.every(m => m < currentMonth) 
                ? 'bg-emerald-100 text-emerald-700' 
                : quarter.months.includes(currentMonth)
                ? 'bg-brand-100 text-brand-700'
                : 'bg-surface-tertiary text-ink-tertiary'}`}>
              Q{quarter.q}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{quarter.label}</p>
              <p className="text-xs text-ink-tertiary">{quarter.milestone}</p>
            </div>
          </div>

          {/* Month cards */}
          <div className="grid grid-cols-3 gap-3 pl-11">
            {quarter.months.map((month) => {
              const data = ROADMAP_MONTHS[month]
              const isDone = month < currentMonth
              const isCurrent = month === currentMonth
              const isLocked = month > currentMonth

              return (
                <div key={month}
                  className={`p-4 rounded-xl border transition-all
                    ${isDone ? 'bg-emerald-50 border-emerald-200' 
                      : isCurrent ? 'bg-brand-50 border-brand-200 shadow-sm ring-1 ring-brand-300'
                      : 'bg-surface border-surface-border opacity-60'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider
                      ${isDone ? 'text-emerald-600' : isCurrent ? 'text-brand-600' : 'text-ink-tertiary'}`}>
                      T{month}
                    </span>
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      : isCurrent ? <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse mt-1" />
                      : <Lock className="w-3.5 h-3.5 text-ink-placeholder" />}
                  </div>
                  <p className="text-xs font-medium text-ink leading-snug mb-1.5">{data?.grammar}</p>
                  <p className="text-[10px] text-ink-tertiary">{data?.vocabulary}</p>
                  {isCurrent && currentWeek && (
                    <div className="mt-3 pt-2 border-t border-brand-200">
                      <div className="flex items-center justify-between text-[10px] text-brand-600 mb-1">
                        <span>Tuần {currentWeek}/4</span>
                        <span>{Math.round((currentWeek / 4) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-brand-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all"
                          style={{ width: `${Math.min((currentWeek / 4) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
