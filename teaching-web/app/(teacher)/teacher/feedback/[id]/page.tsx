import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AIFeedbackCard, type FeedbackOutput } from '@/components/ai/AIFeedbackCard'
import { ReviewActions } from './ReviewActions'
import type { CitationWithSource } from '@/components/sources/CitationList'

export const dynamic = 'force-dynamic'

export default async function TeacherFeedbackDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role
  if (role !== 'TEACHER' && role !== 'ADMIN') redirect('/login')

  const feedback = await db.aIFeedback.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true, email: true } },
    },
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
        href="/teacher/dashboard"
        className="inline-flex items-center gap-1 text-sm text-ink-tertiary hover:text-ink-primary"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-ink-primary">AI feedback review</h1>
        <p className="text-sm text-ink-tertiary">
          For {feedback.user.name ?? feedback.user.email} ·{' '}
          {new Date(feedback.createdAt).toLocaleString('vi-VN')} · model {feedback.model}
        </p>
        {feedback.reviewedBy && feedback.reviewedAt && (
          <p className="text-xs text-ink-tertiary mt-0.5">
            Reviewed by {feedback.reviewedBy.name ?? feedback.reviewedBy.email} ·{' '}
            {new Date(feedback.reviewedAt).toLocaleString('vi-VN')}
          </p>
        )}
      </header>

      <AIFeedbackCard
        kind={feedback.kind}
        output={output}
        citations={citations}
        viewerRole={role}
        teacherStatus={feedback.teacherStatus}
        teacherNotes={feedback.teacherNotes}
      />

      <ReviewActions
        feedbackId={feedback.id}
        currentStatus={feedback.teacherStatus}
        currentNotes={feedback.teacherNotes ?? ''}
      />
    </div>
  )
}
