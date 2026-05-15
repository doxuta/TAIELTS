import { db } from '@/lib/db'
import { FileText } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'

const TASK_LABEL: Record<string, string> = {
  TASK_1_ACADEMIC: 'Task 1 Academic',
  TASK_1_GENERAL: 'Task 1 General',
  TASK_2: 'Task 2',
}

export default async function TeacherSampleEssaysPage() {
  const essays = await db.sampleEssay.findMany({
    orderBy: [{ taskType: 'asc' }, { band: 'desc' }],
  })

  const byTask = new Map<string, typeof essays>()
  essays.forEach(e => {
    if (!byTask.has(e.taskType)) byTask.set(e.taskType, [])
    byTask.get(e.taskType)!.push(e)
  })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Sample Essays Bank</h1>
        <p className="page-subtitle">{essays.length} essay mẫu · Theo task × band · Đầy đủ examiner notes</p>
      </div>

      {essays.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <p className="text-ink-secondary">Chưa có essay. Chạy seed để nạp bank.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-up stagger-1">
          {Array.from(byTask.entries()).map(([task, items]) => (
            <div key={task}>
              <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider mb-3">
                {TASK_LABEL[task]} · {items.length} essay
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {items.map(e => (
                  <details key={e.id} className="card p-4 group">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-start justify-between mb-1.5">
                        <p className="text-sm font-semibold text-ink line-clamp-2 flex-1">{e.prompt.slice(0, 100)}{e.prompt.length > 100 ? '...' : ''}</p>
                        <BandPill band={e.band} size="sm" />
                      </div>
                      <p className="text-xs text-ink-tertiary">{e.wordCount} từ · {e.topics ?? 'general'}</p>
                    </summary>
                    <div className="mt-3 pt-3 border-t border-surface-border space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider mb-1">Đề bài</p>
                        <p className="text-sm text-ink leading-relaxed">{e.prompt}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider mb-1">Essay</p>
                        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{e.essay}</p>
                      </div>
                      {e.examinerNotes && (
                        <div className="p-3 bg-brand-50/40 rounded-lg border border-brand-200">
                          <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-1">Examiner notes</p>
                          <p className="text-xs text-ink-secondary leading-relaxed whitespace-pre-wrap">{e.examinerNotes}</p>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
