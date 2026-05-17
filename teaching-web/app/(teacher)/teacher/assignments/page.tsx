'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, FileText, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TYPES = [
  { value: 'WEEKLY_EXERCISE', label: 'Bài tập tuần' },
  { value: 'MINI_TEST', label: 'Test mini' },
  { value: 'MONTHLY_TEST', label: 'Kiểm tra tháng' },
]

const TYPE_VARIANT: Record<string, 'default' | 'warning' | 'destructive'> = {
  WEEKLY_EXERCISE: 'default',
  MINI_TEST: 'warning',
  MONTHLY_TEST: 'destructive',
}

const TYPE_LABEL: Record<string, string> = {
  WEEKLY_EXERCISE: 'Bài tập tuần',
  MINI_TEST: 'Test mini',
  MONTHLY_TEST: 'KT tháng',
}

interface Assignment {
  id: string; title: string; type: string; month: number; week?: number;
  dueDate?: string; submissions: { submittedAt?: string | null; score?: number | null }[]
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '', type: 'WEEKLY_EXERCISE', month: '1', week: '1',
    dueDate: '', partA: '', partB: '', partC: '', answerKey: '',
  })

  const load = () => fetch('/api/assignments').then(r => r.json()).then(setAssignments)
  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, month: parseInt(form.month), week: parseInt(form.week) }),
    })
    setLoading(false)
    setShowForm(false)
    load()
    toast.success('Bài tập đã được tạo!')
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bài tập</h1>
          <p className="text-sm text-muted-foreground mt-1">{assignments.length} bài tập đã tạo</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> Tạo bài tập mới
        </Button>
      </header>

      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              Bài tập mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                    placeholder="VD: Bài tập tuần 3 tháng 2 — Thì quá khứ"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Loại</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Tháng</Label>
                  <Select value={form.month} onValueChange={v => setForm(f => ({ ...f, month: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <SelectItem key={m} value={String(m)}>Tháng {m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tuần</Label>
                  <Select value={form.week} onValueChange={v => setForm(f => ({ ...f, week: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map(w => (
                        <SelectItem key={w} value={String(w)}>Tuần {w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="due">Deadline</Label>
                  <Input
                    id="due"
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              {(['partA', 'partB', 'partC'] as const).map((p, i) => (
                <div key={p} className="space-y-1.5">
                  <Label>Phần {['A — Từ vựng', 'B — Ngữ pháp', 'C — Kỹ năng'][i]}</Label>
                  <Textarea
                    rows={4}
                    className="font-mono text-sm"
                    value={form[p]}
                    onChange={e => setForm(f => ({ ...f, [p]: e.target.value }))}
                    placeholder={`Câu hỏi / đề bài phần ${p.toUpperCase().slice(-1)}...`}
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <Label htmlFor="answer">Đáp án (chỉ giáo viên thấy)</Label>
                <Textarea
                  id="answer"
                  rows={3}
                  value={form.answerKey}
                  onChange={e => setForm(f => ({ ...f, answerKey: e.target.value }))}
                  placeholder="Đáp án..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Huỷ</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                  Tạo bài tập
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Chưa có bài tập nào.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {assignments.map(a => {
            const submitted = a.submissions.filter(s => s.submittedAt).length
            return (
              <Card key={a.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <Badge variant={TYPE_VARIANT[a.type] ?? 'secondary'}>{TYPE_LABEL[a.type] ?? a.type}</Badge>
                        <span className="text-xs text-muted-foreground">T{a.month} · Tuần {a.week}</span>
                      </div>
                      <p className="text-sm font-medium truncate">{a.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{submitted}/{a.submissions.length} đã nộp</span>
                    {a.dueDate && (
                      <span className="flex items-center gap-1 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(a.dueDate).toLocaleDateString('vi')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
