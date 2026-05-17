'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const QUALITY_LABELS = ['', 'Kém', 'Yếu', 'Trung bình', 'Khá', 'Tốt']
const SESSION_TYPES = ['A', 'B', 'C'] as const

const SESSION_ACTIVE: Record<string, string> = {
  A: 'bg-violet-600 border-violet-600 text-white',
  B: 'bg-sky-600 border-sky-600 text-white',
  C: 'bg-emerald-600 border-emerald-600 text-white',
}

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
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-5">
      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2">
        <Link href="/teacher/dashboard">
          <ArrowLeft className="w-3 h-3 mr-1" /> Quay lại Dashboard
        </Link>
      </Button>

      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ghi nhận buổi học</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Điểm danh + đánh giá chất lượng sau mỗi buổi A / B / C
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              Thông tin buổi học
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Học viên *</Label>
                <Select value={form.studentId} onValueChange={set('studentId')} required>
                  <SelectTrigger><SelectValue placeholder="Chọn học viên" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Ngày học *</Label>
                <Input id="date" type="date" value={form.date} onChange={e => set('date')(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Loại buổi</Label>
              <div className="flex gap-2">
                {SESSION_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('sessionType')(t)}
                    className={cn(
                      'flex-1 py-2.5 rounded-md text-sm font-bold border transition-all',
                      form.sessionType === t
                        ? SESSION_ACTIVE[t]
                        : 'bg-muted/30 border-border text-muted-foreground hover:border-primary/40'
                    )}
                  >
                    Buổi {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Giáo án liên kết (tuỳ chọn)</Label>
              <Select
                value={form.lessonPlanId || 'none'}
                onValueChange={(v) => set('lessonPlanId')(v === 'none' ? '' : v)}
              >
                <SelectTrigger><SelectValue placeholder="Không liên kết" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không liên kết</SelectItem>
                  {lessons.filter(l => l.sessionType === form.sessionType).map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              Điểm danh & Đánh giá
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                type="button"
                onClick={() => set('attended')(!form.attended)}
                className={cn(
                  form.attended
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : ''
                )}
                variant={form.attended ? 'default' : 'outline'}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {form.attended ? 'Đã tham gia' : 'Vắng mặt'}
              </Button>
              {!form.attended && (
                <span className="text-xs text-muted-foreground">Buổi vắng sẽ không tính vào tổng số buổi</span>
              )}
            </div>

            {form.attended && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'quality', label: 'Chất lượng' },
                  { key: 'attitude', label: 'Thái độ' },
                  { key: 'comprehension', label: 'Hiểu bài' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1.5">
                    <Label>{label}</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <Button
                          key={v}
                          type="button"
                          size="sm"
                          variant={form[key as keyof typeof form] === v ? 'default' : 'outline'}
                          onClick={() => set(key as any)(v)}
                          className="flex-1 h-8 px-0 text-xs"
                        >
                          {v}
                        </Button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      {QUALITY_LABELS[form[key as keyof typeof form] as number] ?? ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {form.attended && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Kỹ năng đã luyện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'grammarDone', label: 'Ngữ pháp' },
                  { key: 'vocabDone', label: 'Từ vựng' },
                  { key: 'listeningDone', label: 'Nghe' },
                  { key: 'speakingDone', label: 'Nói' },
                  { key: 'readingDone', label: 'Đọc' },
                  { key: 'writingDone', label: 'Viết' },
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    type="button"
                    size="sm"
                    variant={form[key as keyof typeof form] ? 'default' : 'outline'}
                    onClick={() => set(key as any)(!form[key as keyof typeof form])}
                    className="h-9"
                  >
                    {form[key as keyof typeof form] ? '✓ ' : ''}{label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              Ghi chú
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="err">Lỗi sai cần ghi nhận (Sổ Tay Lỗi Sai)</Label>
              <Textarea
                id="err"
                rows={3}
                value={form.errorLog}
                onChange={e => set('errorLog')(e.target.value)}
                placeholder="VD: Nhầm thì hiện tại hoàn thành với quá khứ đơn..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hw">Giao bài tập về nhà</Label>
              <Textarea
                id="hw"
                rows={3}
                value={form.homework}
                onChange={e => set('homework')(e.target.value)}
                placeholder="Bài 1: ... Deadline: ..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Ghi chú giáo viên</Label>
              <Textarea
                id="note"
                rows={2}
                value={form.noteForTeacher}
                onChange={e => set('noteForTeacher')(e.target.value)}
                placeholder="Nhận xét, lưu ý đặc biệt về buổi học..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-1">
          <Button asChild variant="ghost">
            <Link href="/teacher/dashboard">Huỷ</Link>
          </Button>
          <Button type="submit" disabled={loading || !form.studentId}>
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
            Lưu buổi học
          </Button>
        </div>
      </form>
    </div>
  )
}
