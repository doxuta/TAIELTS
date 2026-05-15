import { db } from '@/lib/db'
import { Mic } from 'lucide-react'

export default async function TeacherSpeakingCuesPage() {
  const cues = await db.speakingCueCard.findMany({
    orderBy: [{ part: 'asc' }, { topic: 'asc' }],
  })

  const byPart = new Map<number, typeof cues>()
  cues.forEach(c => {
    if (!byPart.has(c.part)) byPart.set(c.part, [])
    byPart.get(c.part)!.push(c)
  })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Speaking Cue Cards</h1>
        <p className="page-subtitle">{cues.length} thẻ · Part 1/2/3 đầy đủ format Cambridge · Có sample answers</p>
      </div>

      {cues.length === 0 ? (
        <div className="card p-16 text-center">
          <Mic className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <p className="text-ink-secondary">Chưa có cue card. Chạy seed để nạp.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-up stagger-1">
          {[1, 2, 3].map(part => {
            const items = byPart.get(part) ?? []
            return (
              <div key={part}>
                <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider mb-3">
                  Speaking Part {part} · {items.length} cards
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {items.map(c => {
                    const bullets = c.bulletPoints ? JSON.parse(c.bulletPoints) as string[] : []
                    const followUps = c.followUps ? JSON.parse(c.followUps) as string[] : []
                    return (
                      <details key={c.id} className="card p-4">
                        <summary className="cursor-pointer list-none">
                          <p className="text-xs text-ink-tertiary uppercase tracking-wider mb-1">{c.topic}</p>
                          <p className="text-sm font-semibold text-ink line-clamp-2">{c.prompt}</p>
                        </summary>
                        <div className="mt-3 pt-3 border-t border-surface-border space-y-2 text-xs">
                          {bullets.length > 0 && (
                            <ul className="list-disc pl-4 space-y-1 text-ink-secondary">
                              {bullets.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                          )}
                          {followUps.length > 0 && (
                            <div>
                              <p className="text-ink-tertiary uppercase tracking-wider font-semibold mb-1">Follow-up questions</p>
                              <ul className="list-decimal pl-4 space-y-1 text-ink-secondary">
                                {followUps.map((q, i) => <li key={i}>{q}</li>)}
                              </ul>
                            </div>
                          )}
                          {c.sampleAnswer && (
                            <div className="p-2 bg-brand-50/40 rounded-md border border-brand-200">
                              <p className="text-brand-700 uppercase tracking-wider font-semibold mb-1">Sample answer</p>
                              <p className="text-ink-secondary leading-relaxed whitespace-pre-wrap">{c.sampleAnswer}</p>
                            </div>
                          )}
                        </div>
                      </details>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
