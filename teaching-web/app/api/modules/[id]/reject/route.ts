import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only ADMIN can reject' }, { status: 403 })
  }

  let reason: string | undefined
  try {
    const body = await req.json()
    reason = typeof body?.reason === 'string' ? body.reason.trim() : undefined
  } catch {
    // body optional
  }

  const before = await db.learningModule.findUnique({ where: { id: params.id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (before.status !== 'IN_REVIEW') {
    return NextResponse.json(
      { error: `Cannot reject from status ${before.status}` },
      { status: 422 }
    )
  }

  const updated = await db.learningModule.update({
    where: { id: params.id },
    data: { status: 'DRAFT' },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'MODULE_REJECT',
    entityType: 'MODULE',
    entityId: updated.id,
    before: { status: before.status },
    after: { status: updated.status, reason },
  })

  return NextResponse.json(updated)
}
