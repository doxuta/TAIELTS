import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { FileText, Headphones, Pencil, Mic, BookOpen } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'
import { Card, CardContent } from '@/components/ui/card'

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
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mock Test Bank</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {tests.length} bài test · Cambridge-format · 4 kỹ năng + AI scoring
        </p>
      </header>

      {tests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Chưa có mock test. Chạy <code className="rounded bg-muted px-1.5 py-0.5 text-xs">npm run db:seed</code> để seed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tests.map(test => {
            const skillsBySkill = new Map<string, number>()
            test.parts.forEach(p => skillsBySkill.set(p.skill, (skillsBySkill.get(p.skill) ?? 0) + 1))
            const totalTime = test.parts.reduce((sum, p) => sum + p.timeMinutes, 0)
            return (
              <Card key={test.id} className="transition-colors hover:border-primary/50">
                <Link href={`/teacher/mock-tests/${test.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          {test.testType} · {test.source ?? 'TAIELTS'}
                        </p>
                        <h2 className="text-base font-semibold leading-tight mb-2">{test.title}</h2>
                        {test.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{test.description}</p>
                        )}
                      </div>
                      <BandPill band={test.targetBand} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {Array.from(skillsBySkill.keys()).map(skill => {
                        const Icon = SKILL_ICON[skill as keyof typeof SKILL_ICON]
                        return Icon ? <Icon key={skill} className="w-3.5 h-3.5" /> : null
                      })}
                      <span className="ml-auto">{totalTime} phút · {test._count.attempts} lượt</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
