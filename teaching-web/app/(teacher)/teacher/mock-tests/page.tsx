import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { FileText, Headphones, Pencil, Mic, BookOpen } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'

const SKILL_ICON = { LISTENING: Headphones, READING: BookOpen, WRITING: Pencil, SPEAKING: Mic } as const

export default async function MockTestsPage() {
  await getServerSession(authOptions)

  const tests = await db.mockTest.findMany({
    where: { isPublished: true },
    include: {
      parts: { select: { skill: true, partNumber: true, timeMinutes: true } },
      _count: { select: { attempts: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Mock Test Bank</h1>
        <p className="page-subtitle">{tests.length} bài test · Cambridge-format · 4 kỹ năng + AI scoring</p>
      </div>

      {tests.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <p className="text-ink-secondary">Chưa có mock test. Chạy <code className="bg-surface-tertiary px-1.5 py-0.5 rounded text-xs">npm run db:seed</code> để seed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 animate-fade-up stagger-1">
          {tests.map(test => {
            const skillsBySkill = new Map<string, number>()
            test.parts.forEach(p => skillsBySkill.set(p.skill, (skillsBySkill.get(p.skill) ?? 0) + 1))
            const totalTime = test.parts.reduce((sum, p) => sum + p.timeMinutes, 0)
            return (
              <Link key={test.id} href={`/teacher/mock-tests/${test.id}`} className="card card-hover p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-ink-tertiary mb-1">{test.testType} · {test.source ?? 'TAIELTS'}</p>
                    <h2 className="text-base font-semibold text-ink leading-tight mb-2">{test.title}</h2>
                    {test.description && <p className="text-xs text-ink-secondary line-clamp-2">{test.description}</p>}
                  </div>
                  <BandPill band={test.targetBand} size="sm" />
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-tertiary">
                  {Array.from(skillsBySkill.keys()).map(skill => {
                    const Icon = SKILL_ICON[skill as keyof typeof SKILL_ICON]
                    return Icon ? <Icon key={skill} className="w-3.5 h-3.5" /> : null
                  })}
                  <span className="ml-auto">{totalTime} phút · {test._count.attempts} lượt</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
