'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ErrorEntry {
  id: string; skill: string; category: string
  wrongVersion: string; correctVersion: string
  explanation?: string | null; exampleSentence?: string | null
  source?: string | null; resolved: boolean; createdAt: string
}

export default function StudentErrorsPage() {
  const [entries, setEntries] = useState<ErrorEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved')

  useEffect(() => {
    const q = filter === 'all' ? '' : `?resolved=${filter === 'resolved'}`
    fetch(`/api/errors${q}`).then(r => r.json()).then(setEntries)
  }, [filter])

  const toggleResolved = async (id: string, current: boolean) => {
    const res = await fetch(`/api/errors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: !current }),
    })
    if (res.ok) {
      setEntries(prev => prev.map(e => e.id === id ? { ...e, resolved: !current } : e))
      toast.success(!current ? 'Đã đánh dấu ôn rồi!' : 'Đã bỏ đánh dấu')
    }
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-5">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sổ tay lỗi sai</h1>
        <p className="text-sm text-muted-foreground mt-1">{entries.length} lỗi · Tick khi đã ôn để hoàn thành</p>
      </header>

      <div className="flex gap-2">
        {(['unresolved', 'resolved', 'all'] as const).map(f => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tất cả' : f === 'unresolved' ? 'Cần ôn' : 'Đã ôn'}
          </Button>
        ))}
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Tuyệt — chưa có lỗi nào trong nhóm này!</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {entries.map(e => (
            <li key={e.id}>
              <Card className={cn(e.resolved && 'opacity-60')}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleResolved(e.id, e.resolved)}
                      className={cn(
                        'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                        e.resolved ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground hover:border-primary'
                      )}
                    >
                      {e.resolved && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs mb-1.5 flex-wrap">
                        <Badge variant="secondary">{e.skill}</Badge>
                        <span className="text-muted-foreground font-medium">{e.category}</span>
                      </div>
                      <p className="text-sm">
                        <span className="line-through text-red-500 font-mono">{e.wrongVersion}</span>
                        <span className="text-muted-foreground mx-2">→</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{e.correctVersion}</span>
                      </p>
                      {e.explanation && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{e.explanation}</p>}
                      {e.exampleSentence && <p className="text-xs text-primary italic mt-1">&quot;{e.exampleSentence}&quot;</p>}
                      {e.source && <p className="text-[10px] text-muted-foreground mt-1">Nguồn: {e.source}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
