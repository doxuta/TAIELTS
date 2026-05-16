import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'

function canBuild(role?: string) {
  return role === 'ADMIN' || role === 'TEACHER'
}

async function loadBlock(moduleId: string, blockId: string) {
  return db.lessonBlock.findFirst({
    where: { id: blockId, moduleId },
    include: { module: true },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; blockId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !canBuild(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const before = await loadBlock(params.id, params.blockId)
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (before.module.status === 'PUBLISHED' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admin can edit a published module' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const data: Record<string, unknown> = {}
  if (typeof body.title === 'string') data.title = body.title.trim()
  if ('content' in body) {
    data.contentJson =
      body.content === null || body.content === undefined
        ? null
        : typeof body.content === 'string'
          ? body.content
          : JSON.stringify(body.content)
  }
  if (typeof body.order === 'number') data.order = body.order
  if ('estimatedMinutes' in body) {
    data.estimatedMinutes =
      typeof body.estimatedMinutes === 'number' ? body.estimatedMinutes : null
  }

  const updated = await db.lessonBlock.update({
    where: { id: params.blockId },
    data,
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'BLOCK_UPDATE',
    entityType: 'BLOCK',
    entityId: updated.id,
    before,
    after: updated,
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; blockId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !canBuild(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const before = await loadBlock(params.id, params.blockId)
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (before.module.status === 'PUBLISHED' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admin can edit a published module' }, { status: 403 })
  }

  await db.lessonBlock.delete({ where: { id: params.blockId } })

  await writeAudit({
    actorId: session.user.id,
    action: 'BLOCK_DELETE',
    entityType: 'BLOCK',
    entityId: before.id,
    before,
  })

  return NextResponse.json({ ok: true })
}
