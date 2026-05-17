import Link from 'next/link'
import { db } from '@/lib/db'
import { Clock } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const SKILL_LABEL: Record<string, string> = {
  LISTENING: 'Nghe', READING: 'Đọc', WRITING: 'Viết', SPEAKING: 'Nói',
  GRAMMAR: 'Ngữ pháp', VOCABULARY: 'Từ vựng', PRONUNCIATION: 'Phát âm',
}

const SKILL_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  LISTENING: 'default',
  READING: 'warning',
  WRITING: 'success',
  SPEAKING: 'destructive',
  GRAMMAR: 'secondary',
  VOCABULARY: 'secondary',
  PRONUNCIATION: 'secondary',
}

export default async function StudentStrategiesPage() {
  const strategies = await db.strategyArticle.findMany({
    orderBy: [{ skill: 'asc' }, { band: 'asc' }],
  })

  const bySkill = new Map<string, typeof strategies>()
  strategies.forEach(s => {
    if (!bySkill.has(s.skill)) bySkill.set(s.skill, [])
    bySkill.get(s.skill)!.push(s)
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Chiến lược 4 kỹ năng</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {strategies.length} bài hướng dẫn · Từ Band 5 → 8 · Đọc 5 phút = +20 XP
        </p>
      </header>

      <div className="space-y-6">
        {Array.from(bySkill.entries()).map(([skill, items]) => (
          <section key={skill} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={SKILL_VARIANT[skill] ?? 'secondary'}>{SKILL_LABEL[skill] ?? skill}</Badge>
              <span className="text-xs text-muted-foreground">{items.length} bài</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map(s => (
                <Card key={s.id} className="transition-colors hover:border-primary/50">
                  <Link href={`/student/strategies/${s.slug}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold flex-1">{s.title}</h3>
                        <BandPill band={s.band} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{s.summary}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {s.readingTimeMin} phút
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
