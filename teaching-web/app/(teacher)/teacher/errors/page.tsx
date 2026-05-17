'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
      toast.success('Đã thêm vào Sổ tay lỗi sai')
    } else {
      toast.error('Lỗi khi lưu')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Xoá lỗi này khỏi sổ tay?')) return
    const res = await fetch(`/api/errors/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setEntries(prev => prev.filter(e => e.id !== id))
      toast.success('Đã xoá')
    }
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sổ tay lỗi sai</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {entries.length} lỗi · Phân loại theo kỹ năng · Học viên ôn để cải thiện
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> Thêm lỗi
        </Button>
      </header>

      <div className="w-56">
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn học viên" />
          </SelectTrigger>
          <SelectContent>
            {students.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-5">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Kỹ năng</Label>
                  <Select value={form.skill} onValueChange={v => setForm(f => ({ ...f, skill: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SKILLS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Loại lỗi</Label>
                  <Input
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="VD: chia thì, giới từ, /θ/..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Cách sai</Label>
                  <Input
                    className="font-mono"
                    value={form.wrongVersion}
                    onChange={e => setForm(f => ({ ...f, wrongVersion: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Cách đúng</Label>
                  <Input
                    className="font-mono"
                    value={form.correctVersion}
                    onChange={e => setForm(f => ({ ...f, correctVersion: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Giải thích</Label>
                <Textarea
                  rows={2}
                  value={form.explanation}
                  onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                  placeholder="Tại sao sai, quy tắc đúng là gì..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Câu ví dụ đúng</Label>
                  <Input
                    value={form.exampleSentence}
                    onChange={e => setForm(f => ({ ...f, exampleSentence: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Nguồn</Label>
                  <Input
                    value={form.source}
                    onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                    placeholder="VD: Buổi #12, Writing Task 2..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Huỷ</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                  Thêm
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Chưa có lỗi nào được ghi.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {entries.map(e => (
            <li key={e.id}>
              <Card className={e.resolved ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="secondary">{e.skill}</Badge>
                      <span className="font-medium">{e.category}</span>
                      {e.resolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => remove(e.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="line-through text-red-500 font-mono">{e.wrongVersion}</span>
                      <span className="text-muted-foreground mx-2">→</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{e.correctVersion}</span>
                    </p>
                    {e.explanation && <p className="text-xs text-muted-foreground mt-1">{e.explanation}</p>}
                    {e.exampleSentence && <p className="text-xs text-primary italic mt-1">&quot;{e.exampleSentence}&quot;</p>}
                    {e.source && <p className="text-[11px] text-muted-foreground mt-1">Nguồn: {e.source}</p>}
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
