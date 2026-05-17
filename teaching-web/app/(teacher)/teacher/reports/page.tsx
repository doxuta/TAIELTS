'use client'

import { useState, useEffect } from 'react'
import { Loader2, FileText, Send, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Student { id: string; fullName: string; currentMonth: number }
interface Report { id: string; month: number; year: number; title: string; content: string; sentAt?: string | null }

export default function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [report, setReport] = useState<Report | null>(null)
  const [generating, setGenerating] = useState(false)
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then((data: Student[]) => {
      setStudents(data)
      if (data.length) { setSelectedId(data[0].id); setMonth(data[0].currentMonth) }
    })
  }, [])

  useEffect(() => {
    if (!selectedId) return
    fetch(`/api/reports?studentId=${selectedId}`).then(r => r.json()).then(setReports)
  }, [selectedId])

  useEffect(() => {
    const r = reports.find(r => r.month === month)
    setReport(r ?? null)
  }, [reports, month])

  const generate = async () => {
    setGenerating(true)
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: selectedId, month }),
    })
    const data = await res.json()
    setReport(data)
    setReports(prev => {
      const filtered = prev.filter(r => !(r.month === month))
      return [...filtered, data]
    })
    setGenerating(false)
    toast.success('Báo cáo tháng đã được tạo!')
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Báo cáo tháng</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tổng hợp tiến độ · Tự động sinh từ rubric + weekly progress
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
        <div className="ml-auto">
          <Button onClick={generate} disabled={generating || !selectedId}>
            {generating
              ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Đang tạo...</>
              : report
              ? <><RefreshCw className="w-4 h-4 mr-1" /> Tạo lại</>
              : <><FileText className="w-4 h-4 mr-1" /> Tạo báo cáo</>}
          </Button>
        </div>
      </div>

      {report ? (
        <div className="space-y-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{report.title}</CardTitle>
              {report.sentAt && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Send className="w-3 h-3" /> Đã gửi {new Date(report.sentAt).toLocaleDateString('vi')}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans bg-muted rounded-lg p-4 border">
                {report.content}
              </pre>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground text-right">
            Đây là bản preview. Copy nội dung để gửi qua Slack / Email.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mb-1">Chưa có báo cáo cho tháng {month}.</p>
            <p className="text-xs text-muted-foreground/70">Nhấn &ldquo;Tạo báo cáo&rdquo; để tự động tổng hợp từ rubric và weekly progress.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
