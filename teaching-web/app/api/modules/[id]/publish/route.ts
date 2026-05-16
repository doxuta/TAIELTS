import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only ADMIN can publish' }, { status: 403 })
  }

  const before = await db.learningModule.findUnique({
    where: { id: params.id },
    include: { blocks: true },
  })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (before.blocks.length === 0) {
    return NextResponse.json(
      { error: 'Cannot publish empty module' },
      { status: 422 }
    )
  }

  const updated = await db.learningModule.update({
    where: { id: params.id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
      publishedById: session.user.id,
      version: before.status === 'PUBLISHED' ? before.version + 1 : before.version,
    },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'MODULE_PUBLISH',
    entityType: 'MODULE',
    entityId: updated.id,
    before: { status: before.status, version: before.version },
    after: { status: updated.status, version: updated.version },
  })

  return NextResponse.json(updated)
}
