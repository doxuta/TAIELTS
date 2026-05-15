'use client'

import { useState, useEffect } from 'react'
import { Loader2, FileText, Send, RefreshCw } from 'lucide-react'

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
  }

  const student = students.find(s => s.id === selectedId)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Báo cáo tháng</h1>
        <p className="page-subtitle">Tổng hợp tiến độ · Tự động sinh từ rubric + weekly progress</p>
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
        <button onClick={generate} disabled={generating || !selectedId} className="btn-primary ml-auto">
          {generating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo...</>
            : report
            ? <><RefreshCw className="w-4 h-4" /> Tạo lại</>
            : <><FileText className="w-4 h-4" /> Tạo báo cáo</>}
        </button>
      </div>

      {report ? (
        <div className="space-y-4 animate-fade-up stagger-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-ink">{report.title}</h2>
              {report.sentAt && (
                <span className="badge badge-green flex items-center gap-1">
                  <Send className="w-3 h-3" /> Đã gửi {new Date(report.sentAt).toLocaleDateString('vi')}
                </span>
              )}
            </div>
            <pre className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans bg-surface-secondary rounded-xl p-4 border border-surface-border">
              {report.content}
            </pre>
          </div>

          <div className="text-xs text-ink-tertiary text-right">
            Đây là bản preview. Copy nội dung để gửi qua Slack / Email.
          </div>
        </div>
      ) : (
        <div className="card p-16 text-center animate-fade-up stagger-2">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <p className="text-ink-secondary mb-2">Chưa có báo cáo cho tháng {month}.</p>
          <p className="text-xs text-ink-tertiary">Nhấn "Tạo báo cáo" để tự động tổng hợp từ rubric và weekly progress.</p>
        </div>
      )}
    </div>
  )
}
