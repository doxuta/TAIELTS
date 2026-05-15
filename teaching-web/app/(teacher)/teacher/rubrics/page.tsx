'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, BarChart3 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

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
  const { toast, ToastContainer } = useToast()

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

  // Load existing rubric when student/month changes
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
    if (res.ok) toast('Đã lưu đánh giá tháng!', 'success')
    else toast('Lưu thất bại, thử lại.', 'error')
  }

  const student = students.find(s => s.id === selectedId)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Đánh giá tháng</h1>
        <p className="page-subtitle">Rubric 6 kỹ năng · Thang 1–5 · Ghi nhận điểm mạnh/yếu</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 animate-fade-up stagger-1">
        <select className="input w-52 text-sm" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </select>
        <select className="input w-36 text-sm" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>Tháng {m}</option>
          ))}
        </select>
        {student && <span className="text-sm text-ink-secondary">Hiện tại: T{student.currentMonth}</span>}
      </div>

      {/* Score grid */}
      <div className="card p-6 mb-5 animate-fade-up stagger-2">
        <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider mb-5">Điểm 6 kỹ năng</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {SKILLS.map(({ key, label, desc }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-ink">{label}</p>
                  <p className="text-xs text-ink-tertiary">{desc}</p>
                </div>
                <span className={`text-lg font-bold tabular-nums ${scores[key] ? 'text-brand-600' : 'text-ink-placeholder'}`}>
                  {scores[key] ?? '—'}
                </span>
              </div>
              <div className="flex gap-1.5">
                {[null, 1, 2, 3, 4, 5].map(v => (
                  <button key={String(v)} type="button"
                    onClick={() => setScores(s => ({ ...s, [key]: v }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all
                      ${scores[key] === v
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : v === null ? 'bg-surface-tertiary border-surface-border text-ink-tertiary text-[9px]'
                        : 'bg-surface-tertiary border-surface-border text-ink-secondary hover:border-brand-300'}`}>
                    {v === null ? 'Clear' : v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Qualitative */}
      <div className="card p-6 space-y-4 animate-fade-up stagger-3">
        <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">Ghi nhận định tính</h2>
        {[
          { key: 'strongPoints', label: 'Điểm mạnh tháng này' },
          { key: 'improvements', label: 'Cần cải thiện' },
          { key: 'nextMonthFocus', label: 'Trọng tâm tháng sau' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <textarea className="input resize-none text-sm" rows={2}
              value={text[key as keyof typeof text]}
              onChange={e => setText(t => ({ ...t, [key]: e.target.value }))}
              placeholder={`${label}...`} />
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-5 animate-fade-up stagger-4">
        <button onClick={handleSave} disabled={loading || !selectedId} className="btn-primary">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Lưu đánh giá</>}
        </button>
      </div>

      {ToastContainer}
    </div>
  )
}
