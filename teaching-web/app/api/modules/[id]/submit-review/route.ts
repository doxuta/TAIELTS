import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'

function canBuild(role?: string) {
  return role === 'ADMIN' || role === 'TEACHER'
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !canBuild(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const before = await db.learningModule.findUnique({
    where: { id: params.id },
    include: { blocks: true },
  })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (before.status !== 'DRAFT') {
    return NextResponse.json(
      { error: `Cannot submit review from status ${before.status}` },
      { status: 422 }
    )
  }
  if (before.blocks.length === 0) {
    return NextResponse.json(
      { error: 'Module must have at least 1 block before review' },
      { status: 422 }
    )
  }

  const updated = await db.learningModule.update({
    where: { id: params.id },
    data: { status: 'IN_REVIEW' },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'MODULE_SUBMIT_REVIEW',
    entityType: 'MODULE',
    entityId: updated.id,
    before: { status: before.status },
    after: { status: updated.status },
  })

  return NextResponse.json(updated)
}
