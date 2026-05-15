'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2, AlertCircle, BookOpen, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

const SKILLS = ['GRAMMAR', 'VOCABULARY', 'PRONUNCIATION', 'WRITING', 'SPEAKING', 'READING', 'LISTENING']

interface Student { id: string; fullName: string }
interface ErrorEntry {
  id: string; studentId: string; skill: string; category: string
  wrongVersion: string; correctVersion: string; explanation?: string | null
  exampleSentence?: string | null; source?: string | null; resolved: boolean; createdAt: string
}

export default function TeacherErrorsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [studentId, setStudentId] = useState('')
  const [entries, setEntries] = useState<ErrorEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast, ToastContainer } = useToast()

  const [form, setForm] = useState({
    skill: 'GRAMMAR', category: '', wrongVersion: '', correctVersion: '',
    explanation: '', exampleSentence: '', source: '',
  })

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then((data: Student[]) => {
      setStudents(data)
      if (data.length) setStudentId(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!studentId) return
    fetch(`/api/errors?studentId=${studentId}`).then(r => r.json()).then(setEntries)
  }, [studentId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, studentId }),
    })
    setLoading(false)
    if (res.ok) {
      const created = await res.json()
      setEntries(prev => [created, ...prev])
      setShowForm(false)
      setForm({ skill: 'GRAMMAR', category: '', wrongVersion: '', correctVersion: '', explanation: '', exampleSentence: '', source: '' })
      toast('Đã thêm vào Sổ tay lỗi sai', 'success')
    } else {
      toast('Lỗi khi lưu', 'error')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Xoá lỗi này khỏi sổ tay?')) return
    const res = await fetch(`/api/errors/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setEntries(prev => prev.filter(e => e.id !== id))
      toast('Đã xoá', 'success')
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="page-header flex items-start justify-between animate-fade-up">
        <div>
          <h1 className="page-title">Sổ tay lỗi sai</h1>
          <p className="page-subtitle">{entries.length} lỗi · Phân loại theo kỹ năng · Học viên ôn để cải thiện</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Thêm lỗi
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5 animate-fade-up stagger-1">
        <select className="input w-52 text-sm" value={studentId} onChange={e => setStudentId(e.target.value)}>
          {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </select>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card p-5 mb-6 space-y-3 animate-fade-up">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Kỹ năng</label>
              <select className="input text-sm" value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))}>
                {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Loại lỗi</label>
              <input className="input text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="VD: chia thì, giới từ, /θ/..." required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Cách sai</label>
              <input className="input text-sm font-mono" value={form.wrongVersion} onChange={e => setForm(f => ({ ...f, wrongVersion: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Cách đúng</label>
              <input className="input text-sm font-mono" value={form.correctVersion} onChange={e => setForm(f => ({ ...f, correctVersion: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="label">Giải thích</label>
            <textarea className="input text-sm resize-none" rows={2} value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Tại sao sai, quy tắc đúng là gì..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Câu ví dụ đúng</label>
              <input className="input text-sm" value={form.exampleSentence} onChange={e => setForm(f => ({ ...f, exampleSentence: e.target.value }))} />
            </div>
            <div>
              <label className="label">Nguồn</label>
              <input className="input text-sm" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="VD: Buổi #12, Writing Task 2..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Huỷ</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Thêm
            </button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <div className="card p-16 text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <p className="text-ink-secondary">Chưa có lỗi nào được ghi.</p>
        </div>
      ) : (
        <div className="space-y-2 animate-fade-up stagger-2">
          {entries.map(e => (
            <div key={e.id} className={`card p-4 ${e.resolved ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="badge badge-slate">{e.skill}</span>
                  <span className="text-ink-secondary font-medium">{e.category}</span>
                  {e.resolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <button onClick={() => remove(e.id)} className="btn-icon text-red-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="line-through text-red-600 font-mono">{e.wrongVersion}</span> <span className="text-ink-tertiary mx-2">→</span> <span className="text-emerald-700 font-mono font-semibold">{e.correctVersion}</span></p>
                {e.explanation && <p className="text-xs text-ink-secondary mt-1">{e.explanation}</p>}
                {e.exampleSentence && <p className="text-xs text-brand-600 italic mt-1">"{e.exampleSentence}"</p>}
                {e.source && <p className="text-[10px] text-ink-tertiary mt-1">Nguồn: {e.source}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {ToastContainer}
    </div>
  )
}
