import Link from 'next/link'
import { db } from '@/lib/db'
import { Plus, Lightbulb, Clock } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'

const SKILL_COLORS: Record<string, string> = {
  LISTENING: 'badge-brand',
  READING: 'badge-amber',
  WRITING: 'badge-green',
  SPEAKING: 'badge-red',
  GRAMMAR: 'badge-slate',
  VOCABULARY: 'badge-slate',
  PRONUNCIATION: 'badge-slate',
}
const SKILL_LABEL: Record<string, string> = {
  LISTENING: 'Nghe', READING: 'Đọc', WRITING: 'Viết', SPEAKING: 'Nói',
  GRAMMAR: 'Ngữ pháp', VOCABULARY: 'Từ vựng', PRONUNCIATION: 'Phát âm',
}

export default async function TeacherStrategiesPage() {
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
      <div className="page-header flex items-start justify-between animate-fade-up">
        <div>
          <h1 className="page-title">Strategy Library</h1>
          <p className="page-subtitle">{strategies.length} bài chiến lược · Theo skill × band · IELTS Liz / Magoosh / DOL methodology</p>
        </div>
      </div>

      {strategies.length === 0 ? (
        <div className="card p-16 text-center">
          <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <p className="text-ink-secondary">Chưa có bài chiến lược. Chạy seed để nạp thư viện.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-up stagger-1">
          {Array.from(bySkill.entries()).map(([skill, items]) => (
            <div key={skill}>
              <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className={`badge ${SKILL_COLORS[skill] ?? 'badge-slate'}`}>{SKILL_LABEL[skill] ?? skill}</span>
                <span className="text-ink-tertiary normal-case font-normal">{items.length} bài</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {items.map(s => (
                  <Link key={s.id} href={`/teacher/strategies/${s.slug}`} className="card card-hover p-4">
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="text-sm font-semibold text-ink flex-1">{s.title}</h3>
                      <BandPill band={s.band} size="sm" />
                    </div>
                    <p className="text-xs text-ink-secondary line-clamp-2">{s.summary}</p>
                    <div className="flex items-center gap-3 text-[10px] text-ink-tertiary mt-2">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {s.readingTimeMin} phút</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
