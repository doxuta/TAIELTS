import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AIFeedbackCard, type FeedbackOutput } from '@/components/ai/AIFeedbackCard'
import type { CitationWithSource } from '@/components/sources/CitationList'

export const dynamic = 'force-dynamic'

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
    <div className="p-8 max-w-3xl mx-auto space-y-5">
      <Link
        href="/student/feedback"
        className="inline-flex items-center gap-1 text-sm text-ink-tertiary hover:text-ink-primary"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-ink-primary">AI feedback</h1>
        <p className="text-sm text-ink-tertiary">
          {new Date(feedback.createdAt).toLocaleString('vi-VN')} · model {feedback.model}
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
  )
}
