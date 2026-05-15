'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles, BookOpen, Save } from 'lucide-react'
import { ROADMAP_MONTHS, getSessionTypeSummary } from '@/lib/utils'

const SESSION_TYPES = ['A', 'B', 'C'] as const

export default function NewLessonPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    sessionType: 'A' as 'A' | 'B' | 'C',
    month: 1,
    week: 1,
    sessionNumber: 1,
    grammarTopic: '',
    vocabularyFocus: '',
    listeningFocus: '',
    speakingFocus: '',
    readingFocus: '',
    writingFocus: '',
    mainContent: '',
    homework: '',
    notes: '',
    status: 'DRAFT',
  })

  const monthData = ROADMAP_MONTHS[form.month]

  const handleAiSuggest = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: form.sessionType,
          month: form.month,
          week: form.week,
          grammarTopic: form.grammarTopic || monthData?.grammar,
          vocabularyFocus: form.vocabularyFocus || monthData?.vocabulary,
        }),
      })
      const data = await res.json()
      if (data.content) {
        setForm(f => ({ ...f, mainContent: data.content, homework: data.homework || f.homework }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAiLoading(false)
    }
  }

  const handleSave = async (status = 'DRAFT') => {
    setLoading(true)
    try {
      const title = `Giáo Án Buổi ${form.sessionNumber} — Tuần ${form.week} Tháng ${form.month} (Buổi ${form.sessionType})`
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, title, status }),
      })
      const data = await res.json()
      if (data.id) {
        router.push(`/teacher/lessons/${data.id}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Soạn giáo án mới</h1>
        <p className="page-subtitle">Điền thông tin buổi học, AI sẽ hỗ trợ soạn nội dung chi tiết.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left — Meta */}
        <div className="col-span-4 space-y-4 animate-fade-up stagger-1">
          {/* Session Type */}
          <div className="card p-5">
            <label className="label">Loại buổi</label>
            <div className="grid grid-cols-3 gap-2">
              {SESSION_TYPES.map(t => (
                <button key={t} type="button"
                  onClick={() => setForm(f => ({ ...f, sessionType: t }))}
                  className={`py-3 rounded-xl text-sm font-bold border transition-all
                    ${form.sessionType === t
                      ? t === 'A' ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                        : t === 'B' ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                        : 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'bg-surface-tertiary border-surface-border text-ink-secondary hover:border-brand-300'
                    }`}>
                  {t}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-tertiary mt-2">{getSessionTypeSummary(form.sessionType)}</p>
          </div>

          {/* Time */}
          <div className="card p-5 space-y-3">
            <label className="label">Vị trí trong lộ trình</label>
            <div>
              <label className="label text-xs">Tháng ({form.month}/12)</label>
              <input type="range" min={1} max={12} value={form.month}
                onChange={e => setForm(f => ({ ...f, month: +e.target.value }))}
                className="w-full accent-brand-600" />
              <div className="flex justify-between text-[10px] text-ink-tertiary">
                <span>T1</span><span>T6</span><span>T12</span>
              </div>
            </div>
            <div>
              <label className="label text-xs">Tuần trong tháng</label>
              <div className="grid grid-cols-4 gap-1">
                {[1,2,3,4].map(w => (
                  <button key={w} type="button"
                    onClick={() => setForm(f => ({ ...f, week: w }))}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${form.week === w ? 'bg-brand-600 border-brand-600 text-white' : 'bg-surface-tertiary border-surface-border text-ink-secondary'}`}>
                    Tuần {w}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label text-xs">Số thứ tự buổi</label>
              <input type="number" min={1} value={form.sessionNumber}
                onChange={e => setForm(f => ({ ...f, sessionNumber: +e.target.value }))}
                className="input text-sm" />
            </div>
          </div>

          {/* Month topic hint */}
          {monthData && (
            <div className="card p-4 bg-brand-50 border-brand-100">
              <p className="text-[10px] text-brand-500 uppercase tracking-wider font-medium mb-2">Lộ trình tháng {form.month}</p>
              <p className="text-xs font-medium text-brand-900 mb-1">📖 {monthData.grammar}</p>
              <p className="text-xs text-brand-700">💬 {monthData.vocabulary}</p>
              <button type="button"
                onClick={() => setForm(f => ({ ...f, grammarTopic: monthData.grammar, vocabularyFocus: monthData.vocabulary }))}
                className="text-[10px] text-brand-600 hover:text-brand-700 font-medium mt-2 underline">
                Áp dụng →
              </button>
            </div>
          )}
        </div>

        {/* Right — Content */}
        <div className="col-span-8 space-y-4 animate-fade-up stagger-2">
          <div className="card p-5 space-y-4">
            <div>
              <label className="label">Chủ đề ngữ pháp</label>
              <input type="text" value={form.grammarTopic}
                onChange={e => setForm(f => ({ ...f, grammarTopic: e.target.value }))}
                placeholder="VD: Thì hiện tại đơn & tiếp diễn"
                className="input" />
            </div>
            <div>
              <label className="label">Từ vựng & chủ đề</label>
              <input type="text" value={form.vocabularyFocus}
                onChange={e => setForm(f => ({ ...f, vocabularyFocus: e.target.value }))}
                placeholder="VD: Hành động hàng ngày, gia đình"
                className="input" />
            </div>
            {form.sessionType === 'B' && (
              <>
                <div>
                  <label className="label">Chủ đề listening</label>
                  <input type="text" value={form.listeningFocus}
                    onChange={e => setForm(f => ({ ...f, listeningFocus: e.target.value }))}
                    className="input" />
                </div>
                <div>
                  <label className="label">Chuyên đề phát âm tháng này</label>
                  <input type="text" value={form.speakingFocus}
                    onChange={e => setForm(f => ({ ...f, speakingFocus: e.target.value }))}
                    className="input" />
                </div>
              </>
            )}
            {form.sessionType === 'C' && (
              <>
                <div>
                  <label className="label">Chủ đề reading</label>
                  <input type="text" value={form.readingFocus}
                    onChange={e => setForm(f => ({ ...f, readingFocus: e.target.value }))}
                    className="input" />
                </div>
                <div>
                  <label className="label">Dạng bài writing</label>
                  <input type="text" value={form.writingFocus}
                    onChange={e => setForm(f => ({ ...f, writingFocus: e.target.value }))}
                    className="input" />
                </div>
              </>
            )}
          </div>

          {/* AI Content Generator */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="label mb-0">Nội dung chi tiết</label>
                <p className="text-xs text-ink-tertiary mt-0.5">Soạn tay hoặc dùng AI hỗ trợ</p>
              </div>
              <button type="button" onClick={handleAiSuggest} disabled={aiLoading}
                className="btn-secondary text-xs gap-1.5 border-brand-200 text-brand-600 hover:bg-brand-50">
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                AI soạn giúp
              </button>
            </div>
            <textarea value={form.mainContent}
              onChange={e => setForm(f => ({ ...f, mainContent: e.target.value }))}
              rows={10}
              placeholder="Mô tả chi tiết nội dung buổi học: warm-up, nội dung chính (theo loại A/B/C), cách dạy từng phần..."
              className="input resize-none font-mono text-xs leading-relaxed" />
          </div>

          {/* Homework */}
          <div className="card p-5">
            <label className="label">Bài tập về nhà</label>
            <textarea value={form.homework}
              onChange={e => setForm(f => ({ ...f, homework: e.target.value }))}
              rows={4}
              placeholder="Bài 1: ...&#10;Bài 2: ...&#10;Deadline: Trước buổi B"
              className="input resize-none text-sm" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <button type="button" onClick={() => handleSave('DRAFT')} disabled={loading}
              className="btn-secondary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu nháp
            </button>
            <button type="button" onClick={() => handleSave('READY')} disabled={loading}
              className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              Lưu & Sẵn sàng dạy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
