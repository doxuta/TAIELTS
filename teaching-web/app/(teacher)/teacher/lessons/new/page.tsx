'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles, BookOpen, Save } from 'lucide-react'
import { ROADMAP_MONTHS, getSessionTypeSummary } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const SESSION_TYPES = ['A', 'B', 'C'] as const

const SESSION_ACTIVE: Record<string, string> = {
  A: 'bg-violet-600 border-violet-600 text-white',
  B: 'bg-sky-600 border-sky-600 text-white',
  C: 'bg-emerald-600 border-emerald-600 text-white',
}

export default function NewLessonPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

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
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Soạn giáo án mới</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Điền thông tin buổi học, AI sẽ hỗ trợ soạn nội dung chi tiết.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-2">
              <Label>Loại buổi</Label>
              <div className="grid grid-cols-3 gap-2">
                {SESSION_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, sessionType: t }))}
                    className={cn(
                      'py-3 rounded-md text-sm font-bold border transition-all',
                      form.sessionType === t
                        ? SESSION_ACTIVE[t]
                        : 'bg-muted/30 border-border text-muted-foreground hover:border-primary/40'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{getSessionTypeSummary(form.sessionType)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <Label>Vị trí trong lộ trình</Label>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Tháng ({form.month}/12)</Label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={form.month}
                  onChange={e => setForm(f => ({ ...f, month: +e.target.value }))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>T1</span><span>T6</span><span>T12</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Tuần trong tháng</Label>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map(w => (
                    <Button
                      key={w}
                      type="button"
                      size="sm"
                      variant={form.week === w ? 'default' : 'outline'}
                      onClick={() => setForm(f => ({ ...f, week: w }))}
                      className="h-8 px-0 text-xs"
                    >
                      Tuần {w}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Số thứ tự buổi</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.sessionNumber}
                  onChange={e => setForm(f => ({ ...f, sessionNumber: +e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {monthData && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-[10px] text-primary uppercase tracking-wider font-medium mb-2">
                  Lộ trình tháng {form.month}
                </p>
                <p className="text-xs font-medium mb-1">📖 {monthData.grammar}</p>
                <p className="text-xs text-muted-foreground">💬 {monthData.vocabulary}</p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-[10px] h-auto p-0 mt-2"
                  onClick={() => setForm(f => ({ ...f, grammarTopic: monthData.grammar, vocabularyFocus: monthData.vocabulary }))}
                >
                  Áp dụng →
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="grammar">Chủ đề ngữ pháp</Label>
                <Input
                  id="grammar"
                  value={form.grammarTopic}
                  onChange={e => setForm(f => ({ ...f, grammarTopic: e.target.value }))}
                  placeholder="VD: Thì hiện tại đơn & tiếp diễn"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vocab">Từ vựng & chủ đề</Label>
                <Input
                  id="vocab"
                  value={form.vocabularyFocus}
                  onChange={e => setForm(f => ({ ...f, vocabularyFocus: e.target.value }))}
                  placeholder="VD: Hành động hàng ngày, gia đình"
                />
              </div>
              {form.sessionType === 'B' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="listen">Chủ đề listening</Label>
                    <Input
                      id="listen"
                      value={form.listeningFocus}
                      onChange={e => setForm(f => ({ ...f, listeningFocus: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="speak">Chuyên đề phát âm tháng này</Label>
                    <Input
                      id="speak"
                      value={form.speakingFocus}
                      onChange={e => setForm(f => ({ ...f, speakingFocus: e.target.value }))}
                    />
                  </div>
                </>
              )}
              {form.sessionType === 'C' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="read">Chủ đề reading</Label>
                    <Input
                      id="read"
                      value={form.readingFocus}
                      onChange={e => setForm(f => ({ ...f, readingFocus: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="write">Dạng bài writing</Label>
                    <Input
                      id="write"
                      value={form.writingFocus}
                      onChange={e => setForm(f => ({ ...f, writingFocus: e.target.value }))}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <div>
                  <Label>Nội dung chi tiết</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Soạn tay hoặc dùng AI hỗ trợ</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAiSuggest}
                  disabled={aiLoading}
                >
                  {aiLoading
                    ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    : <Sparkles className="w-3.5 h-3.5 mr-1" />}
                  AI soạn giúp
                </Button>
              </div>
              <Textarea
                value={form.mainContent}
                onChange={e => setForm(f => ({ ...f, mainContent: e.target.value }))}
                rows={10}
                placeholder="Mô tả chi tiết nội dung buổi học: warm-up, nội dung chính (theo loại A/B/C), cách dạy từng phần..."
                className="font-mono text-xs leading-relaxed"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-1.5">
              <Label>Bài tập về nhà</Label>
              <Textarea
                value={form.homework}
                onChange={e => setForm(f => ({ ...f, homework: e.target.value }))}
                rows={4}
                placeholder="Bài 1: ...&#10;Bài 2: ...&#10;Deadline: Trước buổi B"
              />
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSave('DRAFT')}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Lưu nháp
            </Button>
            <Button
              type="button"
              onClick={() => handleSave('READY')}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <BookOpen className="w-4 h-4 mr-1" />}
              Lưu & Sẵn sàng dạy
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
