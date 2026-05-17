'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const SKILLS = [
  { key: 'grammarScore', label: 'Ngữ pháp', desc: 'Nắm cấu trúc, ít lỗi sai' },
  { key: 'vocabularyScore', label: 'Từ vựng', desc: 'Vốn từ, collocation' },
  { key: 'listeningScore', label: 'Nghe', desc: 'Hiểu độ bóc' },
  { key: 'speakingScore', label: 'Nói', desc: 'Tự tin, lưu loát, phát âm' },
  { key: 'readingScore', label: 'Đọc', desc: 'Tốc độ + hiểu ý' },
  { key: 'writingScore', label: 'Viết', desc: 'Cấu trúc đoạn, từ vựng, ngữ pháp' },
] as const

interface Student { id: string; fullName: string; currentMonth: number }

export default function RubricsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [loading, setLoading] = useState(false)

  const [scores, setScores] = useState<Record<string, number | null>>({
    grammarScore: null, vocabularyScore: null, listeningScore: null,
    speakingScore: null, readingScore: null, writingScore: null,
  })
  const [text, setText] = useState({ strongPoints: '', improvements: '', nextMonthFocus: '' })

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then((data: Student[]) => {
      setStudents(data)
      if (data.length) { setSelectedId(data[0].id); setMonth(data[0].currentMonth) }
    })
  }, [])

  useEffect(() => {
    if (!selectedId) return
    fetch(`/api/rubrics?studentId=${selectedId}`)
      .then(r => r.json())
      .then((rubrics: any[]) => {
        const r = rubrics.find(r => r.month === month)
        if (r) {
          setScores({
            grammarScore: r.grammarScore, vocabularyScore: r.vocabularyScore,
            listeningScore: r.listeningScore, speakingScore: r.speakingScore,
            readingScore: r.readingScore, writingScore: r.writingScore,
          })
          setText({ strongPoints: r.strongPoints ?? '', improvements: r.improvements ?? '', nextMonthFocus: r.nextMonthFocus ?? '' })
        } else {
          setScores({ grammarScore: null, vocabularyScore: null, listeningScore: null, speakingScore: null, readingScore: null, writingScore: null })
          setText({ strongPoints: '', improvements: '', nextMonthFocus: '' })
        }
      })
  }, [selectedId, month])

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch('/api/rubrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: selectedId, month, ...scores, ...text }),
    })
    setLoading(false)
    if (res.ok) toast.success('Đã lưu đánh giá tháng!')
    else toast.error('Lưu thất bại, thử lại.')
  }

  const student = students.find(s => s.id === selectedId)

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Đánh giá tháng</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rubric 6 kỹ năng · Thang 1–5 · Ghi nhận điểm mạnh/yếu
        </p>
      </header>

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Chọn học viên" />
          </SelectTrigger>
          <SelectContent>
            {students.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(month)} onValueChange={v => setMonth(parseInt(v))}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <SelectItem key={m} value={String(m)}>Tháng {m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {student && <span className="text-sm text-muted-foreground">Hiện tại: T{student.currentMonth}</span>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
            Điểm 6 kỹ năng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {SKILLS.map(({ key, label, desc }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <span className={cn(
                    'text-lg font-bold tabular-nums',
                    scores[key] ? 'text-primary' : 'text-muted-foreground/50'
                  )}>
                    {scores[key] ?? '—'}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[null, 1, 2, 3, 4, 5].map(v => (
                    <Button
                      key={String(v)}
                      type="button"
                      size="sm"
                      variant={scores[key] === v ? 'default' : 'outline'}
                      className={cn(
                        'flex-1 h-8 px-0 text-xs',
                        v === null && scores[key] !== v && 'text-muted-foreground'
                      )}
                      onClick={() => setScores(s => ({ ...s, [key]: v }))}
                    >
                      {v === null ? 'Clear' : v}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
            Ghi nhận định tính
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'strongPoints', label: 'Điểm mạnh tháng này' },
            { key: 'improvements', label: 'Cần cải thiện' },
            { key: 'nextMonthFocus', label: 'Trọng tâm tháng sau' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Textarea
                rows={2}
                value={text[key as keyof typeof text]}
                onChange={e => setText(t => ({ ...t, [key]: e.target.value }))}
                placeholder={`${label}...`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading || !selectedId}>
          {loading
            ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Đang lưu</>
            : <><Save className="w-4 h-4 mr-1" /> Lưu đánh giá</>}
        </Button>
      </div>
    </div>
  )
}
