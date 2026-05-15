'use client'

import { useState, useEffect } from 'react'
import { Zap, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

export default function StrategyReadTracker({ slug }: { slug: string }) {
  const [marked, setMarked] = useState(false)
  const { toast, ToastContainer } = useToast()

  useEffect(() => {
    // Auto-mark read after 30s on page
    const timer = setTimeout(() => setMarked(false), 1) // no-op; user clicks manually
    return () => clearTimeout(timer)
  }, [])

  const markRead = async () => {
    const res = await fetch(`/api/strategies/${slug}`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setMarked(true)
      toast(`+${data.xp?.xpAwarded ?? 20} XP nhận được!`, 'success')
    }
  }

  return (
    <>
      <button
        onClick={markRead}
        disabled={marked}
        className={`w-full ${marked ? 'btn-secondary' : 'btn-primary'} text-sm animate-fade-up stagger-2`}
      >
        {marked ? <><CheckCircle2 className="w-4 h-4" /> Đã đánh dấu đọc</> : <><Zap className="w-4 h-4" /> Đánh dấu đã đọc (+20 XP)</>}
      </button>
      {ToastContainer}
    </>
  )
}
