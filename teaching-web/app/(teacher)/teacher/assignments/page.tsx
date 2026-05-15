'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, FileText, Clock } from 'lucide-react'

const TYPES = [
  { value: 'WEEKLY_EXERCISE', label: 'Bài tập tuần' },
  { value: 'MINI_TEST', label: 'Test mini' },
  { value: 'MONTHLY_TEST', label: 'Kiểm tra tháng' },
]

interface Assignment {
  id: string; title: string; type: string; month: number; week?: number;
  dueDate?: string; submissions: { submittedAt?: string | null; score?: number | null }[]
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '', type: 'WEEKLY_EXERCISE', month: 1, week: 1,
    dueDate: '', partA: '', partB: '', partC: '', answerKey: '',
  })

  const load = () => fetch('/api/assignments').then(r => r.json()).then(setAssignments)
  useEffect(() => { load() }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, month: parseInt(String(form.month)), week: parseInt(String(form.week)) }),
    })
    setLoading(false); setShowForm(false)
    load()
  }

  const TYPE_BADGE: Record<string, string> = {
    WEEKLY_EXERCISE: 'badge-brand',
    MINI_TEST: 'badge-amber',
    MONTHLY_TEST: 'badge-red',
  }
  const TYPE_LABEL: Record<string, string> = {
    WEEKLY_EXERCISE: 'Bài tập tuần',
    MINI_TEST: 'Test mini',
    MONTHLY_TEST: 'KT tháng',
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="page-header flex items-start justify-between animate-fade-up">
        <div>
          <h1 className="page-title">Bài tập</h1>
          <p className="page-subtitle">{assignments.length} bài tập đã tạo</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Tạo bài tập mới
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-6 space-y-4 animate-fade-up">
          <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">Bài tập mới</h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="label">Tiêu đề *</label>
              <input className="input" value={form.title} onChange={set('title')} required placeholder="VD: Bài tập tuần 3 tháng 2 — Thì quá khứ" />
            </div>
            <div>
              <label className="label">Loại</label>
              <select className="input" value={form.type} onChange={set('type')}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Tháng</label>
              <select className="input" value={form.month} onChange={set('month')}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tuần</label>
              <select className="input" value={form.week} onChange={set('week')}>
                {[1,2,3,4].map(w => <option key={w} value={w}>Tuần {w}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Deadline</label>
              <input className="input" type="datetime-local" value={form.dueDate} onChange={set('dueDate')} />
            </div>
          </div>

          {['partA', 'partB', 'partC'].map((p, i) => (
            <div key={p}>
              <label className="label">Phần {['A — Từ vựng', 'B — Ngữ pháp', 'C — Kỹ năng'][i]}</label>
              <textarea className="input resize-none text-sm font-mono" rows={4}
                value={form[p as keyof typeof form] as string}
                onChange={set(p as any)}
                placeholder={`Câu hỏi / đề bài phần ${p.toUpperCase().slice(-1)}...`} />
            </div>
          ))}

          <div>
            <label className="label">Đáp án (chỉ giáo viên thấy)</label>
            <textarea className="input resize-none text-sm" rows={3}
              value={form.answerKey} onChange={set('answerKey')} placeholder="Đáp án..." />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Huỷ</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Tạo bài tập
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {assignments.length === 0 ? (
        <div className="card p-16 text-center animate-fade-up">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <p className="text-ink-secondary">Chưa có bài tập nào.</p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-up stagger-1">
          {assignments.map(a => {
            const submitted = a.submissions.filter(s => s.submittedAt).length
            return (
              <div key={a.id} className="card p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-ink-tertiary flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`${TYPE_BADGE[a.type]} badge`}>{TYPE_LABEL[a.type]}</span>
                      <span className="text-xs text-ink-tertiary">T{a.month} · Tuần {a.week}</span>
                    </div>
                    <p className="text-sm font-medium text-ink">{a.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-ink-secondary">
                  <span>{submitted}/{a.submissions.length} đã nộp</span>
                  {a.dueDate && (
                    <span className="flex items-center gap-1 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(a.dueDate).toLocaleDateString('vi')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
