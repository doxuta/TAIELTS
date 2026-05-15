'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

const QUALITY_LABELS = ['', 'Kém', 'Yếu', 'Trung bình', 'Khá', 'Tốt']
const SESSION_TYPES = ['A', 'B', 'C'] as const

interface Student { id: string; fullName: string; currentMonth: number; currentWeek: number }
interface Lesson { id: string; title: string; sessionType: string }

export default function NewSessionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])

  const [form, setForm] = useState({
    studentId: '',
    lessonPlanId: '',
    sessionType: 'A' as 'A' | 'B' | 'C',
    date: new Date().toISOString().slice(0, 10),
    attended: true,
    quality: 3,
    attitude: 3,
    comprehension: 3,
    noteForTeacher: '',
    errorLog: '',
    homework: '',
    homeworkDone: false,
    grammarDone: false,
    listeningDone: false,
    speakingDone: false,
    readingDone: false,
    writingDone: false,
    vocabDone: false,
  })

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(setStudents)
    fetch('/api/lessons').then(r => r.json()).then(setLessons)
  }, [])

  const selectedStudent = students.find(s => s.id === form.studentId)

  const set = (k: keyof typeof form) => (v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        week: selectedStudent?.currentWeek,
        month: selectedStudent?.currentMonth,
      }),
    })
    setLoading(false)
    if (res.ok) router.push('/teacher/dashboard')
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="animate-fade-up mb-8">
        <Link href="/teacher/dashboard" className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
        </Link>
        <h1 className="page-title">Ghi nhận buổi học</h1>
        <p className="page-subtitle">Điểm danh + đánh giá chất lượng sau mỗi buổi A / B / C</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Session meta */}
        <div className="card p-6 space-y-4 animate-fade-up stagger-1">
          <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">Thông tin buổi học</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Học viên *</label>
              <select className="input" value={form.studentId} onChange={e => set('studentId')(e.target.value)} required>
                <option value="">Chọn học viên</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Ngày học *</label>
              <input className="input" type="date" value={form.date} onChange={e => set('date')(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="label">Loại buổi</label>
            <div className="flex gap-2">
              {SESSION_TYPES.map(t => (
                <button key={t} type="button"
                  onClick={() => set('sessionType')(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all
                    ${form.sessionType === t
                      ? t === 'A' ? 'bg-violet-600 border-violet-600 text-white'
                        : t === 'B' ? 'bg-sky-600 border-sky-600 text-white'
                        : 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-surface-tertiary border-surface-border text-ink-secondary'}`}>
                  Buổi {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Giáo án liên kết (tuỳ chọn)</label>
            <select className="input" value={form.lessonPlanId} onChange={e => set('lessonPlanId')(e.target.value)}>
              <option value="">Không liên kết</option>
              {lessons.filter(l => l.sessionType === form.sessionType).map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance + quality */}
        <div className="card p-6 space-y-5 animate-fade-up stagger-2">
          <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">Điểm danh & Đánh giá</h2>

          <div className="flex items-center gap-3">
            <button type="button"
              onClick={() => set('attended')(!form.attended)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
                ${form.attended ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-surface-tertiary border-surface-border text-ink-secondary'}`}>
              <CheckCircle2 className="w-4 h-4" />
              {form.attended ? 'Đã tham gia' : 'Vắng mặt'}
            </button>
            {!form.attended && (
              <span className="text-xs text-ink-tertiary">Buổi vắng sẽ không tính vào tổng số buổi</span>
            )}
          </div>

          {form.attended && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'quality', label: 'Chất lượng' },
                { key: 'attitude', label: 'Thái độ' },
                { key: 'comprehension', label: 'Hiểu bài' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button key={v} type="button"
                        onClick={() => set(key as any)(v)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all
                          ${form[key as keyof typeof form] === v
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'bg-surface-tertiary border-surface-border text-ink-secondary hover:border-brand-300'}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-ink-tertiary mt-1 text-center">
                    {QUALITY_LABELS[form[key as keyof typeof form] as number] ?? ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills done */}
        {form.attended && (
          <div className="card p-6 animate-fade-up stagger-3">
            <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider mb-4">Kỹ năng đã luyện</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'grammarDone', label: 'Ngữ pháp' },
                { key: 'vocabDone', label: 'Từ vựng' },
                { key: 'listeningDone', label: 'Nghe' },
                { key: 'speakingDone', label: 'Nói' },
                { key: 'readingDone', label: 'Đọc' },
                { key: 'writingDone', label: 'Viết' },
              ].map(({ key, label }) => (
                <button key={key} type="button"
                  onClick={() => set(key as any)(!form[key as keyof typeof form])}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all
                    ${form[key as keyof typeof form]
                      ? 'bg-brand-50 border-brand-300 text-brand-700'
                      : 'bg-surface-tertiary border-surface-border text-ink-secondary'}`}>
                  {form[key as keyof typeof form] ? '✓ ' : ''}{label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="card p-6 space-y-4 animate-fade-up stagger-4">
          <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">Ghi chú</h2>

          <div>
            <label className="label">Lỗi sai cần ghi nhận (Sổ Tay Lỗi Sai)</label>
            <textarea className="input resize-none text-sm" rows={3}
              value={form.errorLog} onChange={e => set('errorLog')(e.target.value)}
              placeholder="VD: Nhầm thì hiện tại hoàn thành với quá khứ đơn..." />
          </div>

          <div>
            <label className="label">Giao bài tập về nhà</label>
            <textarea className="input resize-none text-sm" rows={3}
              value={form.homework} onChange={e => set('homework')(e.target.value)}
              placeholder="Bài 1: ... Deadline: ..." />
          </div>

          <div>
            <label className="label">Ghi chú giáo viên</label>
            <textarea className="input resize-none text-sm" rows={2}
              value={form.noteForTeacher} onChange={e => set('noteForTeacher')(e.target.value)}
              placeholder="Nhận xét, lưu ý đặc biệt về buổi học..." />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/teacher/dashboard" className="btn-secondary">Huỷ</Link>
          <button type="submit" disabled={loading || !form.studentId} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Lưu buổi học
          </button>
        </div>
      </form>
    </div>
  )
}
