import { db } from '@/lib/db'
import { FileText } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'
import { Card, CardContent } from '@/components/ui/card'

const TASK_LABEL: Record<string, string> = {
  TASK_1_ACADEMIC: 'Task 1 Academic', TASK_1_GENERAL: 'Task 1 General', TASK_2: 'Task 2',
}

export default async function StudentSampleEssaysPage() {
  const essays = await db.sampleEssay.findMany({
    orderBy: [{ taskType: 'asc' }, { band: 'desc' }],
  })

  const byTask = new Map<string, typeof essays>()
  essays.forEach(e => {
    if (!byTask.has(e.taskType)) byTask.set(e.taskType, [])
    byTask.get(e.taskType)!.push(e)
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sample Essays</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {essays.length} essay band 6-9 · Có examiner notes giải thích chấm điểm
        </p>
      </header>

      {Array.from(byTask.entries()).map(([task, items]) => (
        <section key={task} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {TASK_LABEL[task]} · {items.length} essay
          </h2>
          <div className="space-y-3">
            {items.map(e => (
              <Card key={e.id}>
                <CardContent className="p-4">
                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-sm font-semibold line-clamp-2 flex-1">
                          {e.prompt.slice(0, 120)}{e.prompt.length > 120 ? '...' : ''}
                        </p>
                        <BandPill band={e.band} />
                      </div>
                      <p className="text-xs text-muted-foreground">{e.wordCount} từ {e.topics && `· ${e.topics}`}</p>
                    </summary>
                    <div className="mt-3 pt-3 border-t space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Đề bài</p>
                        <p className="text-sm leading-relaxed">{e.prompt}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Essay</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-serif">{e.essay}</p>
                      </div>
                      {e.examinerNotes && (
                        <div className="p-3 rounded-md border border-primary/30 bg-primary/5">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Examiner notes</p>
                          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{e.examinerNotes}</p>
                        </div>
                      )}
                    </div>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {essays.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Chưa có essay mẫu.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
