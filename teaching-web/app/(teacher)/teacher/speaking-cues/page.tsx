import { db } from '@/lib/db'
import { Mic } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

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
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Speaking Cue Cards</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {cues.length} thẻ · Part 1/2/3 đầy đủ format Cambridge · Có sample answers
        </p>
      </header>

      {cues.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Mic className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Chưa có cue card. Chạy seed để nạp.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {[1, 2, 3].map(part => {
            const items = byPart.get(part) ?? []
            return (
              <section key={part} className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Speaking Part {part} · {items.length} cards
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {items.map(c => {
                    const bullets = c.bulletPoints ? JSON.parse(c.bulletPoints) as string[] : []
                    const followUps = c.followUps ? JSON.parse(c.followUps) as string[] : []
                    return (
                      <Card key={c.id}>
                        <CardContent className="p-4">
                          <details>
                            <summary className="cursor-pointer list-none">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{c.topic}</p>
                              <p className="text-sm font-semibold line-clamp-2">{c.prompt}</p>
                            </summary>
                            <div className="mt-3 pt-3 border-t space-y-2 text-xs">
                              {bullets.length > 0 && (
                                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                  {bullets.map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                              )}
                              {followUps.length > 0 && (
                                <div>
                                  <p className="text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                                    Follow-up questions
                                  </p>
                                  <ul className="list-decimal pl-4 space-y-1 text-muted-foreground">
                                    {followUps.map((q, i) => <li key={i}>{q}</li>)}
                                  </ul>
                                </div>
                              )}
                              {c.sampleAnswer && (
                                <div className="p-2 rounded-md border border-primary/30 bg-primary/5">
                                  <p className="text-primary uppercase tracking-wider font-semibold mb-1">Sample answer</p>
                                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{c.sampleAnswer}</p>
                                </div>
                              )}
                            </div>
                          </details>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
