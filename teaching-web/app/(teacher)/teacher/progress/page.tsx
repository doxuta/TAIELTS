'use client'

import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, getRubricColor } from '@/lib/utils'

const SKILLS = [
  { key: 'grammarScore', label: 'Ngữ pháp' },
  { key: 'vocabularyScore', label: 'Từ vựng' },
  { key: 'listeningScore', label: 'Nghe' },
  { key: 'speakingScore', label: 'Nói' },
  { key: 'readingScore', label: 'Đọc' },
  { key: 'writingScore', label: 'Viết' },
] as const

interface Student { id: string; fullName: string; currentMonth: number; totalSessions: number }
interface Rubric { month: number; grammarScore?: number|null; vocabularyScore?: number|null; listeningScore?: number|null; speakingScore?: number|null; readingScore?: number|null; writingScore?: number|null }
interface Session { week: number; attended: boolean }

export default function ProgressPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then((data: Student[]) => {
      setStudents(data)
      if (data.length) setSelectedId(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedId) return
    fetch(`/api/rubrics?studentId=${selectedId}`).then(r => r.json()).then(setRubrics)
    fetch(`/api/sessions?studentId=${selectedId}`).then(r => r.json()).then(setSessions)
  }, [selectedId])

  const student = students.find(s => s.id === selectedId)
  const latestRubric = rubrics[rubrics.length - 1]
  const prevRubric = rubrics[rubrics.length - 2]

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Theo dõi tiến độ</h1>
        <p className="text-sm text-muted-foreground mt-1">Rubric 6 kỹ năng theo tháng · Thang điểm 1–5</p>
      </header>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Chưa có học viên.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
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
            {student && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Tháng <strong className="text-foreground">{student.currentMonth}</strong>/12</span>
                <span><strong className="text-foreground">{student.totalSessions}</strong> buổi học</span>
                <span><strong className="text-foreground">{rubrics.length}</strong> đánh giá tháng</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SKILLS.map(({ key, label }) => {
              const current = latestRubric?.[key] ?? null
              const prev = prevRubric?.[key] ?? null
              const trend = current != null && prev != null ? current - prev : null

              return (
                <Card key={key}>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{label}</p>
                    <div className="flex items-end gap-2 mb-4">
                      <p className={cn(
                        'text-3xl font-bold',
                        current ? getRubricColor(current) : 'text-muted-foreground/50'
                      )}>
                        {current != null ? current.toFixed(1) : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">/ 5</p>
                      {trend != null && trend !== 0 && (
                        <p className={cn(
                          'text-xs font-semibold mb-1',
                          trend > 0 ? 'text-emerald-500' : 'text-red-500'
                        )}>
                          {trend > 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}
                        </p>
                      )}
                    </div>

                    {rubrics.length > 0 ? (
                      <>
                        <div className="flex items-end gap-1 h-14 mb-1">
                          {rubrics.map((r, j) => {
                            const score = r[key] ?? 0
                            const isLatest = j === rubrics.length - 1
                            const heightPct = score > 0 ? (score / 5) * 100 : 3
                            return (
                              <div key={j} className="flex-1 flex flex-col justify-end"
                                title={`T${r.month}: ${score || '—'}`}>
                                <div
                                  className={cn(
                                    'rounded-sm transition-all',
                                    isLatest ? 'bg-primary' : 'bg-primary/30'
                                  )}
                                  style={{ height: `${heightPct}%` }}
                                />
                              </div>
                            )
                          })}
                        </div>
                        <div className="flex justify-between">
                          {rubrics.map(r => (
                            <span key={r.month} className="text-[9px] text-muted-foreground/60 leading-none">T{r.month}</span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="h-14 flex items-center justify-center">
                        <p className="text-xs text-muted-foreground/60">Chưa có dữ liệu</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Heatmap tham gia (52 tuần)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 flex-wrap">
                {Array.from({ length: 52 }, (_, i) => {
                  const week = i + 1
                  const weekSessions = sessions.filter(s => s.week === week)
                  const attended = weekSessions.filter(s => s.attended).length
                  const opacity = weekSessions.length === 0 ? 0.08 : Math.min(attended / 3, 1)
                  return (
                    <div key={i} title={`Tuần ${week}: ${attended}/${weekSessions.length} buổi`}
                      className="w-3.5 h-3.5 rounded-sm bg-primary transition-all"
                      style={{ opacity: Math.max(opacity, 0.08) }}
                    />
                  )
                })}
              </div>
              <div className="flex items-center gap-5 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary opacity-10 inline-block" /> Vắng</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary opacity-50 inline-block" /> Một phần</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary inline-block" /> Đầy đủ</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
