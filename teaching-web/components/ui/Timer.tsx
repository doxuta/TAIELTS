'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface TimerProps {
  /** Total seconds available */
  totalSeconds: number
  /** Called when timer reaches 0 */
  onExpire?: () => void
  /** Pauses the timer */
  paused?: boolean
}

export function Timer({ totalSeconds, onExpire, paused = false }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    if (paused || remaining <= 0) return
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(id)
          onExpire?.()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [paused, remaining, onExpire])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const pct = (remaining / totalSeconds) * 100

  const color = pct > 50 ? 'text-emerald-600' : pct > 20 ? 'text-amber-600' : 'text-red-600'
  const bgColor = pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-surface-border shadow-sm">
      <Clock className={`w-4 h-4 ${color}`} />
      <span className={`text-sm font-mono font-semibold tabular-nums ${color}`}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <div className="w-16 h-1 bg-surface-border rounded-full overflow-hidden">
        <div className={`h-full ${bgColor} transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
