import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import { REVIEW_STATUSES } from '@/lib/sources'

function isAdmin(role?: string) {
  return role === 'ADMIN'
}

const ACTION_BY_STATUS: Record<string, string> = {
  DRAFT: 'SOURCE_UNREVIEW',
  PENDING_REVIEW: 'SOURCE_SUBMIT_REVIEW',
  APPROVED: 'SOURCE_APPROVE',
  DEPRECATED: 'SOURCE_DEPRECATE',
  BLOCKED: 'SOURCE_BLOCK',
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const nextStatus = body?.reviewStatus
  if (!nextStatus || !(REVIEW_STATUSES as readonly string[]).includes(nextStatus)) {
    return NextResponse.json({ error: 'invalid reviewStatus' }, { status: 400 })
  }

  const before = await db.source.findUnique({ where: { id: params.id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await db.source.update({
    where: { id: params.id },
    data: {
      reviewStatus: nextStatus,
      reviewedById: session.user.id,
      lastVerifiedAt: nextStatus === 'APPROVED' ? new Date() : before.lastVerifiedAt,
    },
  })

  await writeAudit({
    actorId: session.user.id,
    action: ACTION_BY_STATUS[nextStatus] ?? 'SOURCE_REVIEW',
    entityType: 'SOURCE',
    entityId: updated.id,
    before: { reviewStatus: before.reviewStatus },
    after: { reviewStatus: updated.reviewStatus },
  })

  return NextResponse.json(updated)
}
