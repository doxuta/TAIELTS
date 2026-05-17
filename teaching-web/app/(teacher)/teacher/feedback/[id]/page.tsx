import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AIFeedbackCard, type FeedbackOutput } from '@/components/ai/AIFeedbackCard'
import { ReviewActions } from './ReviewActions'
import type { CitationWithSource } from '@/components/sources/CitationList'
import { Button } from '@/components/ui/button'

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
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-5">
      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2">
        <Link href="/teacher/feedback">
          <ArrowLeft className="w-3 h-3 mr-1" /> Back
        </Link>
      </Button>

      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI feedback review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          For {feedback.user.name ?? feedback.user.email} ·{' '}
          {new Date(feedback.createdAt).toLocaleString('vi-VN')} · model{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">{feedback.model}</code>
        </p>
        {feedback.reviewedBy && feedback.reviewedAt && (
          <p className="text-xs text-muted-foreground mt-0.5">
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
