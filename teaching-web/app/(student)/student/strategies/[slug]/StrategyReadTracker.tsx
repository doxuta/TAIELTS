'use client'

import { useState } from 'react'
import { Zap, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function StrategyReadTracker({ slug }: { slug: string }) {
  const [marked, setMarked] = useState(false)

  const markRead = async () => {
    const res = await fetch(`/api/strategies/${slug}`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setMarked(true)
      toast.success(`+${data.xp?.xpAwarded ?? 20} XP nhận được!`)
    }
  }

  return (
    <Button
      onClick={markRead}
      disabled={marked}
      variant={marked ? 'secondary' : 'default'}
      className="w-full"
    >
      {marked
        ? <><CheckCircle2 className="w-4 h-4 mr-1" /> Đã đánh dấu đọc</>
        : <><Zap className="w-4 h-4 mr-1" /> Đánh dấu đã đọc (+20 XP)</>}
    </Button>
  )
}
