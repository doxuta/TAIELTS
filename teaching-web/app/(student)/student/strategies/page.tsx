import Link from 'next/link'
import { db } from '@/lib/db'
import { Lightbulb, Clock } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'

const SKILL_LABEL: Record<string, string> = {
  LISTENING: 'Nghe', READING: 'Đọc', WRITING: 'Viết', SPEAKING: 'Nói',
  GRAMMAR: 'Ngữ pháp', VOCABULARY: 'Từ vựng', PRONUNCIATION: 'Phát âm',
}
const SKILL_COLORS: Record<string, string> = {
  LISTENING: 'bg-sky-100 text-sky-700',
  READING: 'bg-amber-100 text-amber-700',
  WRITING: 'bg-emerald-100 text-emerald-700',
  SPEAKING: 'bg-pink-100 text-pink-700',
  GRAMMAR: 'bg-violet-100 text-violet-700',
  VOCABULARY: 'bg-orange-100 text-orange-700',
  PRONUNCIATION: 'bg-slate-100 text-slate-700',
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Chiến lược 4 kỹ năng</h1>
        <p className="page-subtitle">{strategies.length} bài hướng dẫn · Từ Band 5 → 8 · Đọc 5 phút = +20 XP</p>
      </div>

      <div className="space-y-6 animate-fade-up stagger-1">
        {Array.from(bySkill.entries()).map(([skill, items]) => (
          <div key={skill}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`badge ${SKILL_COLORS[skill] ?? 'badge-slate'}`}>{SKILL_LABEL[skill] ?? skill}</span>
              <span className="text-xs text-ink-tertiary">{items.length} bài</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {items.map(s => (
                <Link key={s.id} href={`/student/strategies/${s.slug}`} className="card card-hover p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-ink flex-1 pr-2">{s.title}</h3>
                    <BandPill band={s.band} size="sm" />
                  </div>
                  <p className="text-xs text-ink-secondary line-clamp-2">{s.summary}</p>
                  <p className="text-[10px] text-ink-tertiary mt-2 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {s.readingTimeMin} phút
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
