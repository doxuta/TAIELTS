'use client'

import { useEffect, useState } from 'react'

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6']

export function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; rotate: number; color: string; delay: number }>>([])

  useEffect(() => {
    if (!trigger) return
    const newPieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      rotate: Math.random() * 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.3,
    }))
    setPieces(newPieces)
    const timeout = setTimeout(() => setPieces([]), 2500)
    return () => clearTimeout(timeout)
  }, [trigger])

  if (pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute w-2 h-3 rounded-sm animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
