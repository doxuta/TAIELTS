'use client'

import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import { getRubricColor } from '@/lib/utils'

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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Theo dõi tiến độ</h1>
        <p className="page-subtitle">Rubric 6 kỹ năng theo tháng · Thang điểm 1–5</p>
      </div>

      {students.length === 0 ? (
        <div className="card p-16 text-center">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <p className="text-ink-secondary">Chưa có học viên.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-up stagger-1">
          {/* Student selector + summary */}
          <div className="flex items-center gap-4">
            <select className="input w-52 text-sm" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
            {student && (
              <div className="flex items-center gap-4 text-sm text-ink-secondary">
                <span>Tháng <strong className="text-ink">{student.currentMonth}</strong>/12</span>
                <span><strong className="text-ink">{student.totalSessions}</strong> buổi học</span>
                <span><strong className="text-ink">{rubrics.length}</strong> đánh giá tháng</span>
              </div>
            )}
          </div>

          {/* 6-skill cards with mini bar chart */}
          <div className="grid grid-cols-3 gap-4">
            {SKILLS.map(({ key, label }) => {
              const current = latestRubric?.[key] ?? null
              const prev = prevRubric?.[key] ?? null
              const trend = current != null && prev != null ? current - prev : null

              return (
                <div key={key} className="card p-5">
                  <p className="text-xs text-ink-tertiary uppercase tracking-wider mb-3">{label}</p>
                  <div className="flex items-end gap-2 mb-4">
                    <p className={`text-3xl font-display font-bold ${current ? getRubricColor(current) : 'text-ink-placeholder'}`}>
                      {current != null ? current.toFixed(1) : '—'}
                    </p>
                    <p className="text-xs text-ink-tertiary mb-1">/ 5</p>
                    {trend != null && trend !== 0 && (
                      <p className={`text-xs font-semibold mb-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {trend > 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}
                      </p>
                    )}
                  </div>

                  {/* Bar chart */}
                  {rubrics.length > 0 ? (
                    <>
                      <div className="flex items-end gap-1 h-14 mb-1">
                        {rubrics.map((r, j) => {
                          const score = r[key] ?? 0
                          const isLatest = j === rubrics.length - 1
                          const heightPct = score > 0 ? (score / 5) * 100 : 3
                          return (
                            <div key={j} className="flex-1 flex flex-col justify-end group relative"
                              title={`T${r.month}: ${score || '—'}`}>
                              <div
                                className={`rounded-sm transition-all ${isLatest ? 'bg-brand-500' : 'bg-brand-200'}`}
                                style={{ height: `${heightPct}%` }}
                              />
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex justify-between">
                        {rubrics.map(r => (
                          <span key={r.month} className="text-[9px] text-ink-placeholder leading-none">T{r.month}</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-14 flex items-center justify-center">
                      <p className="text-xs text-ink-placeholder">Chưa có dữ liệu</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Attendance heatmap */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-ink mb-4">Heatmap tham gia (52 tuần)</h2>
            <div className="flex items-end gap-1 flex-wrap">
              {Array.from({ length: 52 }, (_, i) => {
                const week = i + 1
                const weekSessions = sessions.filter(s => s.week === week)
                const attended = weekSessions.filter(s => s.attended).length
                const opacity = weekSessions.length === 0 ? 0.08 : Math.min(attended / 3, 1)
                return (
                  <div key={i} title={`Tuần ${week}: ${attended}/${weekSessions.length} buổi`}
                    className="w-3.5 h-3.5 rounded-sm bg-brand-500 transition-all"
                    style={{ opacity: Math.max(opacity, 0.08) }}
                  />
                )
              })}
            </div>
            <div className="flex items-center gap-5 mt-3 text-xs text-ink-tertiary">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand-500 opacity-10 inline-block" /> Vắng</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand-500 opacity-50 inline-block" /> Một phần</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand-500 inline-block" /> Đầy đủ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
