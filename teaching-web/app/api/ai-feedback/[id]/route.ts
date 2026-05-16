import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'

const TEACHER_STATUSES = ['PENDING_REVIEW', 'APPROVED', 'NEEDS_REWORK', 'OVERRIDDEN'] as const

function isStaff(role?: string) {
  return role === 'ADMIN' || role === 'TEACHER'
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const feedback = await db.aIFeedback.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true, email: true } },
    },
  })
  if (!feedback) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Students may only read their own feedback.
  if (!isStaff(session.user.role) && feedback.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Re-validate that any cited citation IDs are still APPROVED/non-blocked.
  let validCitedIds: string[] = []
  try {
    const parsed = JSON.parse(feedback.outputJson) as { citedCitationIds?: string[] }
    if (Array.isArray(parsed.citedCitationIds) && parsed.citedCitationIds.length) {
      const citations = await db.citation.findMany({
        where: { id: { in: parsed.citedCitationIds } },
        include: { sourceRoute: { include: { source: true } } },
      })
      validCitedIds = citations
        .filter((c) => c.sourceRoute.source.reviewStatus === 'APPROVED' && c.sourceRoute.source.trustLevel !== 'D_BLOCKED')
        .map((c) => c.id)
    }
  } catch {
    /* ignore parse errors */
  }

  const citations = validCitedIds.length
    ? await db.citation.findMany({
        where: { id: { in: validCitedIds } },
        include: { sourceRoute: { include: { source: true } } },
      })
    : []

  return NextResponse.json({ ...feedback, citations })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isStaff(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const status = body.teacherStatus
  if (status && !(TEACHER_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: 'invalid teacherStatus' }, { status: 400 })
  }

  const before = await db.aIFeedback.findUnique({ where: { id: params.id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await db.aIFeedback.update({
    where: { id: params.id },
    data: {
      teacherStatus: status ?? before.teacherStatus,
      teacherNotes: 'teacherNotes' in body ? body.teacherNotes || null : before.teacherNotes,
      reviewedById: session.user.id,
      reviewedAt: new Date(),
    },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'AI_FEEDBACK_REVIEW',
    entityType: 'AI_FEEDBACK',
    entityId: updated.id,
    before: { teacherStatus: before.teacherStatus },
    after: { teacherStatus: updated.teacherStatus },
  })

  return NextResponse.json(updated)
}
