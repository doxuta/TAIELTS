import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AIFeedbackCard, type FeedbackOutput } from '@/components/ai/AIFeedbackCard'
import type { CitationWithSource } from '@/components/sources/CitationList'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const GLASS_BG = 'min-h-full bg-gradient-to-br from-violet-500/10 via-background to-emerald-500/10'

export default async function StudentFeedbackDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') redirect('/login')

  const feedback = await db.aIFeedback.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!feedback) notFound()

  let output: FeedbackOutput = {}
  try {
    output = JSON.parse(feedback.outputJson) as FeedbackOutput
  } catch {}
  const citedIds: string[] = Array.isArray((output as { citedCitationIds?: unknown }).citedCitationIds)
    ? ((output as { citedCitationIds?: string[] }).citedCitationIds ?? [])
    : []

  const citationsRaw = citedIds.length
    ? await db.citation.findMany({
        where: { id: { in: citedIds } },
        include: { sourceRoute: { include: { source: true } } },
      })
    : []
  const citations = citationsRaw.filter(
    (c) =>
      c.sourceRoute.source.reviewStatus === 'APPROVED' &&
      c.sourceRoute.source.trustLevel !== 'D_BLOCKED'
  ) as unknown as CitationWithSource[]

  return (
    <div className={GLASS_BG}>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-5">
        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2">
          <Link href="/student/feedback">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back
          </Link>
        </Button>

        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI feedback</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(feedback.createdAt).toLocaleString('vi-VN')} · model{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">{feedback.model}</code>
          </p>
        </header>

        <AIFeedbackCard
          kind={feedback.kind}
          output={output}
          citations={citations}
          viewerRole="STUDENT"
          teacherStatus={feedback.teacherStatus}
          teacherNotes={feedback.teacherNotes}
        />
      </div>
    </div>
  )
}
